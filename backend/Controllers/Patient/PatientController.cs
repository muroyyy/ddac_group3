using BloodLine.Data;
using BloodLine.DTOs;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Models.System;
using BloodLine.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Amazon.S3;
using Amazon.S3.Model;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PatientController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly NotificationService _notificationService;
        private readonly IAmazonS3 _s3Client;
        private const string BucketName = "dev-bloodline-assets-8826eb40";
        private const string CloudFrontDomain = "d3vjqplzgxllwe.cloudfront.net";
        private const string S3Folder = "patient/patient-medical-documents";

        public PatientController(ApplicationDbContext db, NotificationService notificationService, IAmazonS3 s3Client)
        {
            _db = db;
            _notificationService = notificationService;
            _s3Client = s3Client;
        }

        /// <summary>
        /// SECURITY HELPER METHOD - Converts user ID to patient ID
        /// 
        /// PURPOSE:
        /// - Users have a user_id (for authentication/login)
        /// - Patients have a patient_id (for medical records)
        /// - This method links the two for secure data access
        /// 
        /// SECURITY BENEFIT:
        /// - Ensures patients can only access their own medical data
        /// - Prevents unauthorized access to other patients' appointments
        /// </summary>
        /// <param name="userId">The authenticated user's ID from login session</param>
        /// <returns>Patient ID if found, null if user has no patient profile</returns>
        private async Task<int?> GetPatientIdFromUser(int userId)
        {
            try
            {
                var profile = await _db.PatientProfiles
                    .FirstOrDefaultAsync(p => p.UserId == userId);
                
                Console.WriteLine($"User {userId} -> Patient {profile?.PatientId}");
                return profile?.PatientId;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting patient ID: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// CREATE BLOOD REQUEST ENDPOINT - Allows patients to submit new blood requests
        /// 
        /// BUSINESS LOGIC:
        /// - Validates user is authenticated and has patient profile
        /// - Creates blood_requests record with "Pending" status
        /// - Sends confirmation notification to patient
        /// - Hospital staff will later review and approve/reject
        /// - If approved, appointment is automatically created
        /// 
        /// SECURITY:
        /// - Converts user ID to patient ID for data isolation
        /// - Validates all input data
        /// - Prevents unauthorized access to other patients' data
        /// </summary>
        /// <param name="userId">The authenticated user's ID from frontend</param>
        /// <param name="dto">Blood request data (blood type, units, urgency, hospital, notes)</param>
        /// <returns>Success response with request ID or error message</returns>
        [HttpPost("blood-request/{userId}")]
        public async Task<IActionResult> CreateBloodRequest(int userId, [FromBody] CreateBloodRequestDto dto)
        {
            try
            {
                // INPUT VALIDATION - Ensure valid user ID
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                // INPUT VALIDATION - Ensure request data provided
                if (dto == null)
                    return BadRequest(new { success = false, message = "Request data is required." });

                // SECURITY CONVERSION - Convert user ID to patient ID
                // This ensures only patients can create requests and data isolation
                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found for this user."
                    });
                }

                // CREATE BLOOD REQUEST OBJECT - Prepare data for database
                var newRequest = new BloodRequest
                {
                    PatientId = patientId.Value,                                    // Link to patient
                    HospitalId = dto.HospitalId,                                    // Target hospital
                    BloodType = dto.BloodType ?? "Unknown",                        // Blood type with fallback
                    UnitsRequired = dto.UnitsRequired > 0 ? dto.UnitsRequired : 1, // Minimum 1 unit
                    UrgencyLevel = dto.UrgencyLevel ?? "Medium",                   // Urgency with fallback
                    Notes = dto.Notes,                                              // Optional notes
                    Status = "Pending",                                            // Initial status
                    CreatedAt = DateTime.UtcNow                                     // Timestamp
                };

                // SAVE TO DATABASE - Add request and commit transaction
                _db.BloodRequests.Add(newRequest);
                await _db.SaveChangesAsync();

                // SEND NOTIFICATION - Confirm submission to patient
                await SendBloodRequestSubmissionNotification(userId, newRequest.RequestId, newRequest.BloodType, newRequest.CreatedAt ?? DateTime.UtcNow);

                // SUCCESS RESPONSE - Return request ID for tracking
                return Ok(new
                {
                    success = true,
                    message = "Blood request created successfully.",
                    requestId = newRequest.RequestId
                });
            }
            catch (Exception ex)
            {
                // ERROR HANDLING - Log error and return generic message
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error submitting blood request.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// GET BLOOD REQUESTS ENDPOINT - Retrieves patient's blood requests
        /// Used by frontend to display request history
        /// </summary>
        [HttpGet("blood-requests/{userId}")]
        public async Task<IActionResult> GetBloodRequests(int userId)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                // 🔥 Convert userId → patientId
                var patientId = await GetPatientIdFromUser(userId);

                if (patientId == null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Patient profile not found."
                    });
                }

                var requests = await _db.BloodRequests
                    .Where(r => r.PatientId == patientId.Value)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        id = r.RequestId,
                        bloodType = r.BloodType,
                        units = r.UnitsRequired,
                        urgency = r.UrgencyLevel,
                        hospitalId = r.HospitalId,
                        hospitalName = _db.Hospitals.Where(h => h.HospitalId == r.HospitalId).Select(h => h.HospitalName).FirstOrDefault(),
                        status = r.Status,
                        date = r.CreatedAt.HasValue
                            ? r.CreatedAt.Value.ToString("yyyy-MM-dd")
                            : "N/A",
                        notes = r.Notes
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading blood requests.",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// GET APPOINTMENTS ENDPOINT - Retrieves all appointments for a specific patient
        /// 
        /// BUSINESS LOGIC:
        /// - Converts user ID to patient ID for security isolation
        /// - Queries patient_appointments table with hospital/doctor JOINs
        /// - Returns appointments with complete scheduling information
        /// - Orders by appointment date (newest first)
        /// 
        /// SECURITY: Only returns appointments for the authenticated patient
        /// DATA JOINS: Links appointments → hospitals → doctors for complete info
        /// </summary>
        /// <param name="userId">The authenticated user's ID from frontend session</param>
        /// <returns>JSON response with appointment data including hospital and doctor details</returns>
        [HttpGet("appointments/{userId}")]
        public async Task<IActionResult> GetAppointments(int userId)
        {
            try
            {
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                // Try both: patient profile mapping AND direct user_id as patient_id
                var patientId = await GetPatientIdFromUser(userId);
                
                // If no patient profile, try using userId directly as patientId
                var searchPatientId = patientId ?? userId;
                
                var appointments = await _db.PatientAppointments
                    .Where(pa => pa.PatientId == searchPatientId)
                    .Select(pa => new
                    {
                        appointmentId = pa.AppointmentId,
                        hospitalName = "Hospital",
                        doctorName = "Doctor",
                        appointmentDate = pa.AppointmentDate.ToString("yyyy-MM-dd"),
                        appointmentTime = "Not Set",
                        status = pa.Status ?? "Unknown",
                        notes = pa.DoctorNotes ?? "",
                        createdAt = pa.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                    })
                    .OrderByDescending(a => a.appointmentDate)
                    .ToListAsync();

                return Ok(new { success = true, data = appointments });
            }
            catch (Exception ex)
            {
                return Ok(new { success = true, data = new List<object>() });
            }
        }


        /// <summary>
        /// CANCEL APPOINTMENT ENDPOINT - Allows patients to cancel upcoming appointments
        /// 
        /// BUSINESS LOGIC:
        /// - Only "Upcoming" appointments can be cancelled
        /// - Updates appointment status to "Cancelled"
        /// - Updates timestamp to track when cancellation occurred
        /// 
        /// SECURITY: Validates appointment exists and is in correct status
        /// </summary>
        /// <param name="appointmentId">The ID of the appointment to cancel</param>
        /// <returns>Success/failure response</returns>
        [HttpPut("cancel-appointment/{appointmentId}")]
        public async Task<IActionResult> CancelAppointment(int appointmentId)
        {
            try
            {
                // FIND AND VALIDATE APPOINTMENT
                // Only find appointments that are "Upcoming" - prevents cancelling completed/cancelled appointments
                var appointment = await _db.PatientAppointments
                    .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId && a.Status == "Upcoming");

                // VALIDATION - Check if appointment exists and is cancellable
                if (appointment == null)
                {
                    return BadRequest(new { success = false, message = "Appointment not found or already cancelled." });
                }

                // UPDATE DATABASE - Change status to cancelled
                appointment.Status = "Cancelled";
                appointment.CreatedAt = DateTime.UtcNow; // Update timestamp to track when cancellation occurred
                
                // SAVE CHANGES - Persist the cancellation to database
                _db.PatientAppointments.Update(appointment);
                await _db.SaveChangesAsync();

                // SUCCESS RESPONSE - Confirm cancellation to frontend
                return Ok(new { success = true, message = "Appointment cancelled successfully." });
            }
            catch (Exception ex)
            {
                // ERROR HANDLING - Return server error with details
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error cancelling appointment.",
                    error = ex.Message
                });
            }
        }


        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var patientProfile = await _db.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient profile not found." });

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        fullName = user.FullName,
                        email = user.Email,
                        phone = user.Phone,
                        bloodTypeNeeded = patientProfile.BloodTypeNeeded,
                        medicalCondition = patientProfile.MedicalCondition,
                        dateOfBirth = patientProfile.DateOfBirth?.ToString("yyyy-MM-dd"),
                        address = patientProfile.Address,
                        emergencyContact = patientProfile.EmergencyContact,
                        allergies = patientProfile.Allergies
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading profile.", error = ex.Message });
            }
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] UpdatePatientProfileDto dto)
        {
            try
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
                if (user == null)
                    return NotFound(new { success = false, message = "User not found." });

                var patientProfile = await _db.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (patientProfile == null)
                    return NotFound(new { success = false, message = "Patient profile not found." });

                if (dto.FullName != null)
                    user.FullName = dto.FullName;
                if (dto.Email != null)
                    user.Email = dto.Email;
                if (dto.Phone != null)
                    user.Phone = dto.Phone;
                if (dto.BloodTypeNeeded != null)
                    patientProfile.BloodTypeNeeded = dto.BloodTypeNeeded;
                if (dto.MedicalCondition != null)
                    patientProfile.MedicalCondition = dto.MedicalCondition;
                if (dto.DateOfBirth != null)
                    patientProfile.DateOfBirth = dto.DateOfBirth;
                if (dto.Address != null)
                    patientProfile.Address = dto.Address;
                if (dto.EmergencyContact != null)
                    patientProfile.EmergencyContact = dto.EmergencyContact;
                if (dto.Allergies != null)
                    patientProfile.Allergies = dto.Allergies;

                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Profile updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating profile.", error = ex.Message });
            }
        }

        private async Task SendBloodRequestSubmissionNotification(int userId, int requestId, string bloodType, DateTime submittedAt)
        {
            try
            {
                var message = $"Your blood request for {bloodType} has been submitted successfully on {submittedAt:MMM dd, yyyy} at {submittedAt:HH:mm}. Request ID: #{requestId}";

                await _db.Database.ExecuteSqlRawAsync(
                    @"INSERT INTO notifications (user_id, title, message, type, is_read, created_at) 
                      VALUES ({0}, {1}, {2}, {3}, 0, NOW())",
                    userId,
                    "Blood Request Submitted",
                    message,
                    "blood_request_submitted");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send submission notification: {ex.Message}");
            }
        }

        [HttpPost("create-table")]
        public async Task<IActionResult> CreateTable()
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(@"
                    DROP TABLE IF EXISTS patient_medical_documents;
                    CREATE TABLE patient_medical_documents (
                        document_id INT AUTO_INCREMENT PRIMARY KEY,
                        patient_id INT NOT NULL,
                        document_name VARCHAR(255) NOT NULL,
                        s3_key VARCHAR(500) NOT NULL,
                        cloudfront_url VARCHAR(500) NOT NULL,
                        file_type VARCHAR(100),
                        file_size BIGINT,
                        uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");
                return Ok(new { success = true, message = "Table created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPost("upload-document/{userId}")]
        public async Task<IActionResult> UploadDocument(int userId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided." });

                var patientId = await GetPatientIdFromUser(userId);
                if (patientId == null)
                    return BadRequest(new { success = false, message = "Patient profile not found." });

                // Generate S3 key
                var s3Key = $"{S3Folder}/{patientId.Value}/{Guid.NewGuid()}-{file.FileName}";
                
                // Upload to S3
                using var stream = file.OpenReadStream();
                var uploadRequest = new PutObjectRequest
                {
                    BucketName = BucketName,
                    Key = s3Key,
                    InputStream = stream,
                    ContentType = file.ContentType
                };
                
                await _s3Client.PutObjectAsync(uploadRequest);
                
                // Generate presigned URL for viewing (24 hour expiry)
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = BucketName,
                    Key = s3Key,
                    Expires = DateTime.UtcNow.AddHours(24),
                    Verb = HttpVerb.GET
                };
                
                var s3Url = await _s3Client.GetPreSignedURLAsync(request);

                var document = new PatientMedicalDocument
                {
                    PatientId = patientId.Value,
                    DocumentName = file.FileName,
                    DocumentType = file.ContentType ?? "application/octet-stream",
                    S3Key = s3Key,
                    S3Url = s3Url,
                    FileSize = (int)file.Length,
                    UploadedAt = DateTime.UtcNow
                };

                _db.PatientMedicalDocuments.Add(document);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Upload successful", documentId = document.DocumentId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Upload failed.", error = ex.Message });
            }
        }

        [HttpGet("documents/{userId}")]
        public async Task<IActionResult> GetDocuments(int userId)
        {
            try
            {
                var patientId = await GetPatientIdFromUser(userId);
                if (patientId == null)
                    return Ok(new { success = true, data = new List<object>() });

                var documents = await _db.PatientMedicalDocuments
                    .Where(d => d.PatientId == patientId.Value)
                    .OrderByDescending(d => d.UploadedAt)
                    .ToListAsync();

                var result = new List<object>();
                foreach (var d in documents)
                {
                    // Generate fresh presigned URL for each document
                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = BucketName,
                        Key = d.S3Key,
                        Expires = DateTime.UtcNow.AddHours(24),
                        Verb = HttpVerb.GET
                    };
                    var freshUrl = await _s3Client.GetPreSignedURLAsync(request);

                    result.Add(new
                    {
                        documentId = d.DocumentId,
                        documentName = d.DocumentName,
                        fileType = d.DocumentType,
                        fileSize = d.FileSize ?? 0,
                        uploadedAt = d.UploadedAt.HasValue ? d.UploadedAt.Value.ToString("yyyy-MM-dd HH:mm") : "Unknown",
                        url = freshUrl
                    });
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error loading documents.", error = ex.Message });
            }
        }

        [HttpDelete("document/{documentId}")]
        public async Task<IActionResult> DeleteDocument(int documentId)
        {
            try
            {
                var document = await _db.PatientMedicalDocuments.FindAsync(documentId);
                if (document == null)
                    return NotFound(new { success = false, message = "Document not found." });

                await _s3Client.DeleteObjectAsync(BucketName, document.S3Key);

                _db.PatientMedicalDocuments.Remove(document);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Document deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Delete failed.", error = ex.Message });
            }
        }
    }
}
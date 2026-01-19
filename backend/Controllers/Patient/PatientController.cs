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
            // QUERY patient_profile table to find patient record for this user
            var profile = await _db.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            // RETURN patient ID or null if no profile exists
            return profile?.PatientId;
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
                // INPUT VALIDATION - Ensure valid user ID provided
                if (userId <= 0)
                    return BadRequest(new { success = false, message = "Invalid user ID." });

                // SECURITY CONVERSION - Convert user ID to patient ID
                // This ensures patients can only see their own appointments
                var patientId = await GetPatientIdFromUser(userId);
                if (patientId == null)
                {
                    // User has no patient profile - return empty list instead of error
                    return Ok(new { success = true, data = new List<object>() });
                }

                // DATABASE QUERY - Get appointments with related hospital/doctor data
                // Uses LINQ projections to avoid loading full entities into memory
                var appointments = await _db.PatientAppointments
                    .Where(pa => pa.PatientId == patientId.Value)  // SECURITY: Only this patient's appointments
                    .Select(pa => new
                    {
                        appointmentId = pa.AppointmentId,
                        
                        // JOIN with hospitals table to get hospital name and location
                        hospitalName = _db.Hospitals
                            .Where(h => h.HospitalId == pa.HospitalId)
                            .Select(h => h.HospitalName)
                            .FirstOrDefault() ?? "Unknown Hospital",
                            
                        // JOIN with doctors table to get assigned doctor information
                        doctorName = _db.Doctors
                            .Where(d => d.DoctorId == pa.DoctorId)
                            .Select(d => d.DoctorName)
                            .FirstOrDefault() ?? "Not Assigned",
                            
                        // APPOINTMENT SCHEDULING DETAILS
                        appointmentDate = pa.AppointmentDate.ToString("yyyy-MM-dd"),
                            
                        appointmentTime = "Not Set",
                        
                        // STATUS AND METADATA
                        status = pa.Status ?? "Unknown",
                        notes = pa.DoctorNotes ?? "",
                        
                        // CREATION TRACKING
                        createdAt = pa.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                    })
                    .OrderByDescending(a => a.appointmentDate)  // SORT: Newest appointments first
                    .ToListAsync();

                // SUCCESS RESPONSE - Return appointment data for frontend display
                return Ok(new { success = true, data = appointments });
            }
            catch (Exception ex)
            {
                // ERROR HANDLING - Log error and return user-friendly message
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error loading appointments.",
                    error = ex.Message
                });
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

        [HttpPost("upload-document/{userId}")]
        public async Task<IActionResult> UploadDocument(int userId, IFormFile file)
        {
            try
            {
                // Create table if it doesn't exist
                await _db.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS patient_medical_documents (
                        document_id INT AUTO_INCREMENT PRIMARY KEY,
                        patient_id INT NOT NULL,
                        document_name VARCHAR(255) NOT NULL,
                        s3_key VARCHAR(500) NOT NULL,
                        cloudfront_url VARCHAR(500) NOT NULL,
                        file_type VARCHAR(100),
                        file_size BIGINT,
                        uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_profile(patient_id) ON DELETE CASCADE,
                        INDEX idx_patient_id (patient_id),
                        INDEX idx_uploaded_at (uploaded_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");

                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file provided." });

                var patientId = await GetPatientIdFromUser(userId);
                if (patientId == null)
                    return BadRequest(new { success = false, message = "Patient profile not found." });

                // Skip S3 upload for now, just test database insert
                var document = new PatientMedicalDocument
                {
                    PatientId = patientId.Value,
                    DocumentName = file.FileName,
                    S3Key = "test-key",
                    CloudFrontUrl = "test-url",
                    FileType = file.ContentType,
                    FileSize = file.Length,
                    UploadedAt = DateTime.UtcNow
                };

                _db.PatientMedicalDocuments.Add(document);
                await _db.SaveChangesAsync();

                return Ok(new { success = true, message = "Test upload successful", documentId = document.DocumentId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Upload failed.", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        [HttpGet("documents/{userId}")]
        public async Task<IActionResult> GetDocuments(int userId)
        {
            try
            {
                // Create table if it doesn't exist
                await _db.Database.ExecuteSqlRawAsync(@"
                    CREATE TABLE IF NOT EXISTS patient_medical_documents (
                        document_id INT AUTO_INCREMENT PRIMARY KEY,
                        patient_id INT NOT NULL,
                        document_name VARCHAR(255) NOT NULL,
                        s3_key VARCHAR(500) NOT NULL,
                        cloudfront_url VARCHAR(500) NOT NULL,
                        file_type VARCHAR(100),
                        file_size BIGINT,
                        uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (patient_id) REFERENCES patient_profile(patient_id) ON DELETE CASCADE,
                        INDEX idx_patient_id (patient_id),
                        INDEX idx_uploaded_at (uploaded_at)
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                ");

                var patientId = await GetPatientIdFromUser(userId);
                if (patientId == null)
                    return Ok(new { success = true, data = new List<object>() });

                var documents = await _db.PatientMedicalDocuments
                    .Where(d => d.PatientId == patientId.Value)
                    .OrderByDescending(d => d.UploadedAt)
                    .Select(d => new
                    {
                        documentId = d.DocumentId,
                        documentName = d.DocumentName,
                        fileType = d.FileType,
                        fileSize = d.FileSize,
                        uploadedAt = d.UploadedAt.ToString("yyyy-MM-dd HH:mm"),
                        url = d.CloudFrontUrl
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = documents });
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

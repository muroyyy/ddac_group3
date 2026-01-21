using BloodLine.Data;
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

namespace BloodLine.Controllers.Hospital;

[Route("api/hospital")]
[ApiController]
public class HospitalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly NotificationService _notificationService;
    private readonly SnsService _snsService;
    private readonly ILogger<HospitalController> _logger;

    public HospitalController(ApplicationDbContext context, NotificationService notificationService, SnsService snsService, ILogger<HospitalController> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _snsService = snsService;
        _logger = logger;
    }

    /// <summary>
    /// Get all hospitals for registration dropdown
    /// </summary>
    [HttpGet("list")]
    public async Task<IActionResult> GetAllHospitals()
    {
        try
        {
            var hospitals = await _context.Hospitals
                .Select(h => new
                {
                    h.HospitalId,
                    h.HospitalName,
                    h.Address
                })
                .OrderBy(h => h.HospitalName)
                .ToListAsync();

            return Ok(new { success = true, data = hospitals });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching hospitals list: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch hospitals" });
        }
    }

    // Helper method to get hospital ID from user ID
    private async Task<int?> GetHospitalIdFromUser(int userId)
    {
        try
        {
            // Use simple query to get hospital_id from hospital_staff table
            var result = await _context.Database
                .SqlQuery<int>($"SELECT hospital_id FROM hospital_staff WHERE user_id = {userId} LIMIT 1")
                .ToListAsync();
            
            if (result.Any())
                return result.First();
                
            // Fallback: check if user is directly a hospital user
            var directResult = await _context.Database
                .SqlQuery<int>($"SELECT hospital_id FROM hospital WHERE user_id = {userId} LIMIT 1")
                .ToListAsync();
                
            if (directResult.Any())
                return directResult.First();
                
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error getting hospital ID for user {userId}: {ex.Message}");
            return null;
        }
    }

    // Helper method to validate hospital access
    private async Task<bool> ValidateHospitalAccess(int userId, int hospitalId)
    {
        var userHospitalId = await GetHospitalIdFromUser(userId);
        return userHospitalId == hospitalId;
    }

    /// <summary>
    /// Get dashboard stats for a hospital (total inventory, pending approvals, low stock alerts, system health).
    /// </summary>
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats([FromQuery] int userId)
    {
        try
        {
            var hospitalId = await GetHospitalIdFromUser(userId);
            if (hospitalId == null)
                return Ok(new { success = true, data = new { pendingRequests = 0, upcomingAppointments = 0, totalInventory = 0, lowStockCount = 0 } });

            // Pending blood requests that need approval
            var pendingRequests = await _context.BloodRequests
                .Where(br => br.HospitalId == hospitalId.Value && br.Status == "Pending")
                .CountAsync();

            // Upcoming appointments
            var upcomingAppointments = await _context.PatientAppointments
                .Where(pa => pa.HospitalId == hospitalId.Value && pa.Status == "Upcoming")
                .CountAsync();

            // Total blood units in inventory
            var totalInventory = await _context.BloodInventory
                .Where(bi => bi.HospitalId == hospitalId.Value)
                .SumAsync(bi => (int?)bi.QuantityUnits) ?? 0;

            // Low stock count (blood types with less than 10 units)
            var lowStockCount = await _context.BloodInventory
                .Where(bi => bi.HospitalId == hospitalId.Value && bi.QuantityUnits < 10)
                .CountAsync();

            var stats = new
            {
                pendingRequests = pendingRequests,
                upcomingAppointments = upcomingAppointments,
                totalInventory = totalInventory,
                lowStockCount = lowStockCount
            };

            return Ok(new { success = true, data = stats });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching dashboard stats: {ex.Message}");
            return Ok(new { success = true, data = new { pendingRequests = 0, upcomingAppointments = 0, totalInventory = 0, lowStockCount = 0 } });
        }
    }

    /// <summary>
    /// Get blood inventory for a hospital.
    /// </summary>
    [HttpGet("blood-inventory")]
    public async Task<IActionResult> GetBloodInventory([FromQuery] int hospitalId)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId)
                .Select(bi => new
                {
                    id = bi.InventoryId,
                    bloodType = bi.BloodType,
                    units = bi.QuantityUnits,
                    status = bi.Status,
                    lastUpdated = bi.LastUpdated,
                    hospitalId = bi.HospitalId
                })
                .ToListAsync();

            return Ok(inventory);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch blood inventory" });
        }
    }

    /// <summary>
    /// Add blood inventory for a hospital.
    /// </summary>
    [HttpPost("blood-inventory")]
    public async Task<IActionResult> AddBloodInventory([FromBody] AddInventoryRequest request)
    {
        try
        {
            if (request.HospitalId <= 0 || string.IsNullOrEmpty(request.BloodType))
                return BadRequest(new { error = "Invalid hospital ID or blood type" });

            var inventory = new BloodInventory
            {
                HospitalId = request.HospitalId,
                BloodType = request.BloodType,
                QuantityUnits = request.Units ?? 0,
                LastUpdated = DateTime.Now
            };

            _context.Set<BloodInventory>().Add(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error adding blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to add blood inventory" });
        }
    }

    /// <summary>
    /// Update blood inventory units.
    /// </summary>
    [HttpPut("blood-inventory/{id}")]
    public async Task<IActionResult> UpdateBloodInventory(int id, [FromBody] UpdateInventoryRequest request)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>().FindAsync(id);
            if (inventory == null)
                return NotFound(new { error = "Inventory not found" });

            inventory.QuantityUnits = request.Units ?? inventory.QuantityUnits;
            inventory.LastUpdated = DateTime.Now;

            _context.Set<BloodInventory>().Update(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update blood inventory" });
        }
    }

    /// <summary>
    /// Delete blood inventory.
    /// </summary>
    [HttpDelete("blood-inventory/{id}")]
    public async Task<IActionResult> DeleteBloodInventory(int id)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>().FindAsync(id);
            if (inventory == null)
                return NotFound(new { error = "Inventory not found" });

            _context.Set<BloodInventory>().Remove(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to delete blood inventory" });
        }
    }

    /// <summary>
    /// Get blood requests for hospital staff (scoped to their hospital)
    /// </summary>
    [HttpGet("blood-requests/{userId}")]
    public async Task<IActionResult> GetBloodRequests(int userId)
    {
        try
        {
            var hospitalId = await GetHospitalIdFromUser(userId);
            if (hospitalId == null)
                return Ok(new { success = true, data = new List<object>() });

            var requests = await _context.BloodRequests
                .Where(br => br.HospitalId == hospitalId.Value && br.Status == "Pending")
                .GroupJoin(_context.PatientProfiles, br => br.PatientId, pp => pp.PatientId, (br, pp) => new { br, pp })
                .SelectMany(x => x.pp.DefaultIfEmpty(), (x, pp) => new { x.br, pp })
                .GroupJoin(_context.Users, x => x.pp != null ? x.pp.UserId : 0, u => u.Id, (x, u) => new { x.br, x.pp, u })
                .SelectMany(x => x.u.DefaultIfEmpty(), (x, u) => new
                {
                    requestId = x.br.RequestId,
                    patientId = x.br.PatientId,
                    patientName = u != null ? u.FullName : null,
                    patientEmail = u != null ? u.Email : null,
                    patientPhone = u != null ? u.Phone : null,
                    bloodType = x.br.BloodType,
                    unitsRequired = x.br.UnitsRequired,
                    status = x.br.Status,
                    urgencyLevel = x.br.UrgencyLevel,
                    notes = x.br.Notes ?? "",
                    createdAt = x.br.CreatedAt.HasValue ? x.br.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm") : ""
                })
                .Where(x => x.patientName != null)
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching blood requests: {ex.Message}");
            return Ok(new { success = true, data = new List<object>() });
        }
    }



    /// <summary>
    /// Approve blood request and create appointment
    /// </summary>
    [HttpPost("requests/{id}/approve")]
    public async Task<IActionResult> ApproveRequest(int id, [FromBody] ApproveRequestDto dto)
    {
        try
        {
            var bloodRequest = await _context.BloodRequests.FindAsync(id);
            if (bloodRequest == null)
                return NotFound(new { error = "Request not found" });

            // Update blood request status
            bloodRequest.Status = "Approved";
            
            // Create appointment
            var appointment = new PatientAppointment
            {
                RequestId = id,
                PatientId = bloodRequest.PatientId,
                HospitalId = bloodRequest.HospitalId,
                DoctorId = dto.DoctorId,
                AppointmentDate = dto.AppointmentDate,
                Status = "Upcoming",
                CreatedAt = DateTime.UtcNow
            };

            _context.PatientAppointments.Add(appointment);
            await _context.SaveChangesAsync();

            await SendBloodRequestNotification(bloodRequest.PatientId, "Approved", id);

            return Ok(new { success = true, message = "Request approved and appointment created" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error approving request: {ex.Message}");
            return StatusCode(500, new { error = "Failed to approve request" });
        }
    }

    /// <summary>
    /// Reject blood request.
    /// </summary>
    [HttpPost("requests/{id}/reject")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] RejectRequestDto dto)
    {
        try
        {
            var bloodRequest = await _context.Set<BloodRequest>().FindAsync(id);
            if (bloodRequest == null)
                return NotFound(new { error = "Request not found" });

            bloodRequest.Status = "Rejected";
            bloodRequest.RejectionNotes = dto.RejectionNotes;
            _context.Set<BloodRequest>().Update(bloodRequest);
            await _context.SaveChangesAsync();

            await SendBloodRequestNotification(bloodRequest.PatientId, "Rejected", id);

            return Ok(new { success = true, message = "Request rejected." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error rejecting request: {ex.Message}");
            return StatusCode(500, new { error = "Failed to reject request" });
        }
    }

    private async Task SendBloodRequestNotification(int patientId, string status, int requestId)
    {
        try
        {
            var patient = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null) return;

            var bloodRequest = await _context.BloodRequests.FindAsync(requestId);
            var bloodType = bloodRequest?.BloodType ?? "Unknown";

            // Send SNS email notification
            await _snsService.SendBloodRequestNotification(patient.User.Email, status, requestId, bloodType, patient.UserId);

            // Also create in-app notification
            var message = status.ToLower() switch
            {
                "approved" => $"Good news! Your blood request #{requestId} has been approved.",
                "rejected" => $"Your blood request #{requestId} has been rejected. Please contact the hospital for more information.",
                _ => $"Your blood request #{requestId} status has been updated to {status}."
            };

            var notification = new Notification
            {
                UserId = patient.UserId,
                Title = $"Blood Request {status}",
                Message = message,
                Type = "blood_request_update",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending blood request notification: {ex.Message}");
        }
    }

    /// <summary>
    /// Get hospital profile by user ID (joins users and hospital tables).
    /// </summary>
    [HttpGet("profile")]
    public async Task<IActionResult> GetHospitalProfile([FromQuery] int userId)
    {
        try
        {
            var profile = await _context.Set<HospitalEntity>()
                .Where(h => h.UserId == userId)
                .Join(_context.Users, h => h.UserId, u => u.Id, (h, u) => new
                {
                    // User information
                    user_id = u.Id,
                    full_name = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    role = u.Role.ToString(),
                    status = u.Status.ToString(),
                    verification_status = u.VerificationStatus.ToString(),
                    created_at = u.CreatedAt,
                    // Hospital information
                    hospital_id = h.HospitalId,
                    hospital_name = h.HospitalName,
                    address = h.Address,
                    contact_person = h.ContactPerson,
                    contact_number = h.ContactNumber
                })
                .FirstOrDefaultAsync();

            if (profile == null)
                return NotFound(new { error = "Hospital profile not found" });

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching hospital profile: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch hospital profile" });
        }
    }



    /// <summary>
    /// Get hospital appointments with patient data from patient_appointments table
    /// </summary>
    [HttpGet("appointments/{userId}")]
    public async Task<IActionResult> GetAppointments(int userId)
    {
        try
        {
            // First check if there are any patient appointments at all
            var appointmentCount = await _context.PatientAppointments.CountAsync();
            _logger.LogInformation($"Total patient appointments in database: {appointmentCount}");

            if (appointmentCount == 0)
            {
                return Ok(new { success = true, data = new List<object>() });
            }

            var hospitalId = await GetHospitalIdFromUser(userId);
            _logger.LogInformation($"Hospital ID for user {userId}: {hospitalId}");
            
            if (hospitalId == null)
                return Ok(new { success = true, data = new List<object>() });

            // Get appointments for this hospital
            var hospitalAppointments = await _context.PatientAppointments
                .Where(pa => pa.HospitalId == hospitalId.Value)
                .CountAsync();
            _logger.LogInformation($"Patient appointments for hospital {hospitalId}: {hospitalAppointments}");

            // Simplified query similar to working donor appointments
            var rawAppointments = await _context.PatientAppointments
                .Where(pa => pa.HospitalId == hospitalId.Value)
                .GroupJoin(_context.BloodRequests, pa => pa.RequestId, br => br.RequestId, (pa, br) => new { pa, br })
                .SelectMany(x => x.br.DefaultIfEmpty(), (x, br) => new { x.pa, br })
                .GroupJoin(_context.PatientProfiles, x => x.pa.PatientId, pp => pp.PatientId, (x, pp) => new { x.pa, x.br, pp })
                .SelectMany(x => x.pp.DefaultIfEmpty(), (x, pp) => new { x.pa, x.br, pp })
                .GroupJoin(_context.Users, x => x.pp != null ? x.pp.UserId : 0, u => u.Id, (x, u) => new { x.pa, x.br, x.pp, u })
                .SelectMany(x => x.u.DefaultIfEmpty(), (x, u) => new { x.pa, x.br, x.pp, u })
                .GroupJoin(_context.Doctors, x => x.pa.DoctorId ?? 0, d => d.DoctorId, (x, d) => new { x.pa, x.br, x.pp, x.u, d })
                .SelectMany(x => x.d.DefaultIfEmpty(), (x, d) => new
                {
                    appointmentId = x.pa.AppointmentId,
                    requestId = x.pa.RequestId,
                    patientId = x.pa.PatientId,
                    hospitalId = x.pa.HospitalId,
                    patientName = x.u != null ? x.u.FullName : "Unknown Patient",
                    patientPhone = x.u != null ? x.u.Phone : "N/A",
                    bloodType = x.br != null ? x.br.BloodType : "Unknown",
                    doctorName = d != null ? d.DoctorName : "TBD",
                    doctorId = x.pa.DoctorId,
                    appointmentDate = x.pa.AppointmentDate,
                    status = x.pa.Status ?? "Upcoming",
                    doctorNotes = x.pa.DoctorNotes ?? "",
                    createdAt = x.pa.CreatedAt
                })
                .OrderByDescending(x => x.appointmentDate)
                .ToListAsync();

            // Format dates after query execution (like donor appointments)
            var appointments = rawAppointments.Select(a => new
            {
                appointmentId = a.appointmentId,
                requestId = a.requestId,
                patientId = a.patientId,
                hospitalId = a.hospitalId,
                patientName = a.patientName,
                patientPhone = a.patientPhone,
                bloodType = a.bloodType,
                doctorName = a.doctorName,
                doctorId = a.doctorId,
                appointmentDate = a.appointmentDate.ToString("yyyy-MM-dd HH:mm"),
                status = a.status,
                doctorNotes = a.doctorNotes,
                createdAt = a.createdAt.ToString("yyyy-MM-dd HH:mm")
            }).ToList();

            _logger.LogInformation($"Successfully retrieved {appointments.Count} patient appointments");
            return Ok(new { success = true, data = appointments });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching appointments from patient_appointments table: {ex.Message}");
            return Ok(new { success = true, data = new List<object>() });
        }
    }

    /// <summary>
    /// Delete appointment from patient_appointments table
    /// </summary>
    [HttpDelete("appointments/{id}")]
    public async Task<IActionResult> DeleteAppointment(int id)
    {
        try
        {
            _logger.LogInformation($"Attempting to delete appointment with ID: {id}");
            
            var appointment = await _context.PatientAppointments.FindAsync(id);
            if (appointment == null)
            {
                _logger.LogWarning($"Appointment with ID {id} not found");
                return NotFound(new { error = "Appointment not found" });
            }

            _logger.LogInformation($"Found appointment {id}: PatientId={appointment.PatientId}, HospitalId={appointment.HospitalId}, Status={appointment.Status}");
            
            _context.PatientAppointments.Remove(appointment);
            var result = await _context.SaveChangesAsync();
            
            _logger.LogInformation($"Successfully deleted appointment {id}. Records affected: {result}");
            return Ok(new { success = true, message = "Appointment deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting appointment {id}: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            if (ex.InnerException != null)
            {
                _logger.LogError($"Inner exception: {ex.InnerException.Message}");
            }
            return StatusCode(500, new { error = $"Failed to delete appointment: {ex.Message}" });
        }
    }

    /// <summary>
    /// Complete appointment.
    /// </summary>
    [HttpPost("appointments/{id}/complete")]
    public async Task<IActionResult> CompleteAppointment(int id, [FromBody] CompleteAppointmentDto dto)
    {
        try
        {
            var appointment = await _context.PatientAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { error = "Appointment not found" });

            appointment.Status = "Completed";
            appointment.DoctorNotes = dto.DoctorNotes;
            await _context.SaveChangesAsync();

            await SendAppointmentNotification(appointment.PatientId, "Completed", id);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error completing appointment: {ex.Message}");
            return StatusCode(500, new { error = "Failed to complete appointment" });
        }
    }

    /// <summary>
    /// Cancel appointment.
    /// </summary>
    [HttpPost("appointments/{id}/cancel")]
    public async Task<IActionResult> CancelAppointment(int id)
    {
        try
        {
            var appointment = await _context.PatientAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { error = "Appointment not found" });

            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();

            await SendAppointmentNotification(appointment.PatientId, "Cancelled", id);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error cancelling appointment: {ex.Message}");
            return StatusCode(500, new { error = "Failed to cancel appointment" });
        }
    }

    /// <summary>
    /// Get doctors for a hospital
    /// </summary>
    [HttpGet("doctors/{userId}")]
    public async Task<IActionResult> GetDoctors(int userId)
    {
        try
        {
            var hospitalId = await GetHospitalIdFromUser(userId);
            if (hospitalId == null)
                return BadRequest(new { success = false, message = "Hospital staff not found" });

            var doctors = await _context.Doctors
                .Where(d => d.HospitalId == hospitalId.Value)
                .Select(d => new
                {
                    doctorId = d.DoctorId,
                    doctorName = d.DoctorName,
                    specialization = d.Specialization ?? "",
                    contactNumber = d.ContactNumber ?? ""
                })
                .ToListAsync();

            return Ok(new { success = true, data = doctors });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching doctors: {ex.Message}");
            // Return empty list instead of error to prevent UI crashes
            return Ok(new { success = true, data = new List<object>() });
        }
    }

    /// <summary>
    /// Update appointment details
    /// </summary>
    [HttpPut("appointments/{id}")]
    public async Task<IActionResult> UpdateAppointment(int id, [FromBody] UpdateAppointmentDto dto)
    {
        try
        {
            var appointment = await _context.PatientAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { error = "Appointment not found" });

            appointment.DoctorId = dto.DoctorId;
            appointment.AppointmentDate = dto.AppointmentDate;
            appointment.DoctorNotes = dto.DoctorNotes;
            await _context.SaveChangesAsync();

            await SendAppointmentNotification(appointment.PatientId, "Updated", id);

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating appointment: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update appointment" });
        }
    }

    /// <summary>
    /// Get donor requests for hospital staff
    /// </summary>
    [HttpGet("donor-requests/{userId}")]
    public async Task<IActionResult> GetDonorRequests(int userId)
    {
        try
        {
            // Show all pending requests regardless of hospital_id for testing
            var requests = await _context.DonationRequests
                .Where(dr => string.IsNullOrEmpty(dr.Status) || dr.Status == "Pending")
                .Select(dr => new
                {
                    donationId = dr.DonationId,
                    donorName = "Donor " + dr.DonorId,
                    donorEmail = "donor@example.com",
                    donorPhone = "123-456-7890",
                    bloodType = "O+",
                    unitsRequested = dr.UnitsRequired,
                    status = dr.Status ?? "Pending",
                    requestedDate = dr.RequestedDate.ToString("yyyy-MM-dd"),
                    notes = "",
                    hospitalId = dr.HospitalId // Keep for debugging
                })
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Approve donor request
    /// </summary>
    [HttpPost("donor-requests/{id}/approve")]
    public async Task<IActionResult> ApproveDonorRequest(int id, [FromBody] ApproveRequestDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            _logger.LogInformation($"Attempting to approve donation request {id}");
            
            var donorRequest = await _context.DonationRequests.FindAsync(id);
            if (donorRequest == null)
            {
                _logger.LogError($"Donation request {id} not found");
                return NotFound(new { success = false, message = "Donor request not found" });
            }

            _logger.LogInformation($"Found donation request {id}: DonorId={donorRequest.DonorId}, HospitalId={donorRequest.HospitalId}, CurrentStatus={donorRequest.Status}");

            // Update donation request status and mark as modified
            donorRequest.Status = "Accepted";
            _context.DonationRequests.Update(donorRequest);
            _logger.LogInformation($"Setting status to 'Accepted' for donation request {id}");
            
            // Create appointment in donor_appointments table
            var appointment = new DonorAppointment
            {
                DonorId = donorRequest.DonorId,
                DonationId = id,
                HospitalId = donorRequest.HospitalId,
                AppointmentDate = dto.AppointmentDate.Date,
                AppointmentTime = dto.AppointmentDate.TimeOfDay,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DoctorId = dto.DoctorId > 0 ? dto.DoctorId : null
            };
            
            _logger.LogInformation($"Creating appointment for donation {id}");
            _context.DonorAppointments.Add(appointment);
            
            // Save both changes in transaction
            var saveResult = await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            _logger.LogInformation($"Transaction committed: {saveResult} records affected");
            
            _logger.LogInformation($"Successfully approved donation {id} and created appointment {appointment.AppointmentId}");

            return Ok(new { success = true, message = "Donor request approved and appointment scheduled.", appointmentId = appointment.AppointmentId });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError($"Error approving donor request {id}: {ex.Message}");
            _logger.LogError($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = $"Failed to approve donor request: {ex.Message}" });
        }
    }

    /// <summary>
    /// Reject donor request
    /// </summary>
    [HttpPost("donor-requests/{id}/reject")]
    public async Task<IActionResult> RejectDonorRequest(int id, [FromBody] RejectRequestDto dto)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var donorRequest = await _context.DonationRequests.FindAsync(id);
            if (donorRequest == null)
                return NotFound(new { success = false, message = "Donor request not found" });

            // Update donation request status and mark as modified
            donorRequest.Status = "Rejected";
            _context.DonationRequests.Update(donorRequest);
            
            // Create appointment in donor_appointments table with Cancelled status
            var appointment = new DonorAppointment
            {
                DonorId = donorRequest.DonorId,
                DonationId = id,
                HospitalId = donorRequest.HospitalId,
                AppointmentDate = DateTime.Today.AddDays(1), // Default to tomorrow
                AppointmentTime = TimeSpan.FromHours(9), // Default to 9 AM
                Status = "Cancelled",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DoctorNotes = dto.RejectionNotes
            };
            
            _context.DonorAppointments.Add(appointment);
            
            // Save both changes in transaction
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { success = true, message = "Donor request rejected and appointment cancelled.", appointmentId = appointment.AppointmentId });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError($"Error rejecting donor request: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to reject donor request" });
        }
    }

    /// <summary>
    /// Get donor appointments for hospital staff
    /// </summary>
    [HttpGet("donor-appointments/{userId}")]
    public async Task<IActionResult> GetDonorAppointments(int userId)
    {
        try
        {
            // Get all donor appointments for debugging
            var appointmentCount = await _context.DonorAppointments.CountAsync();
            _logger.LogInformation($"Total donor appointments in database: {appointmentCount}");

            if (appointmentCount == 0)
            {
                return Ok(new { success = true, data = new List<object>() });
            }

            // Get raw data first, then format on client side
            var rawAppointments = await _context.DonorAppointments
                .GroupJoin(_context.DonorProfiles, 
                    da => da.DonorId, 
                    dp => dp.DonorId, 
                    (da, dp) => new { da, dp })
                .SelectMany(x => x.dp.DefaultIfEmpty(), (x, dp) => new { x.da, dp })
                .GroupJoin(_context.Users, 
                    x => x.dp != null ? x.dp.UserId : 0, 
                    u => u.Id, 
                    (x, u) => new { x.da, x.dp, u })
                .SelectMany(x => x.u.DefaultIfEmpty(), (x, u) => new
                {
                    appointmentId = x.da.AppointmentId,
                    donorName = u != null ? u.FullName : "Unknown Donor",
                    bloodType = x.dp != null ? x.dp.BloodType : "Unknown",
                    appointmentDate = x.da.AppointmentDate,
                    appointmentTime = x.da.AppointmentTime,
                    status = x.da.Status ?? "Scheduled",
                    createdAt = x.da.CreatedAt,
                    hospitalId = x.da.HospitalId // Add for debugging
                })
                .OrderByDescending(x => x.appointmentDate)
                .ToListAsync();

            // Format dates after query execution
            var appointments = rawAppointments.Select(a => new
            {
                appointmentId = a.appointmentId,
                donorName = a.donorName,
                bloodType = a.bloodType,
                appointmentDate = a.appointmentDate.ToString("yyyy-MM-dd"),
                appointmentTime = a.appointmentTime.ToString(@"hh\:mm"),
                status = a.status,
                createdAt = a.createdAt.ToString("yyyy-MM-dd HH:mm"),
                hospitalId = a.hospitalId
            }).ToList();

            _logger.LogInformation($"Successfully retrieved {appointments.Count} donor appointments");
            return Ok(new { success = true, data = appointments });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching donor appointments: {ex.Message}");
            return Ok(new { success = false, message = $"Failed to fetch donor appointments: {ex.Message}" });
        }
    }

    /// <summary>
    /// Create donor appointment
    /// </summary>
    [HttpPost("donor-appointments/create")]
    public async Task<IActionResult> CreateDonorAppointment([FromBody] CreateDonorAppointmentDto dto)
    {
        try
        {
            var donorRequest = await _context.DonationRequests.FindAsync(dto.DonationId);
            if (donorRequest == null || donorRequest.Status != "Approved")
                return BadRequest(new { success = false, message = "Invalid or non-approved donor request" });

            var appointment = new DonorAppointment
            {
                DonorId = donorRequest.DonorId,
                DonationId = dto.DonationId,
                HospitalId = donorRequest.HospitalId,
                AppointmentDate = dto.AppointmentDate,
                AppointmentTime = dto.AppointmentTime,
                Status = "Upcoming",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.DonorAppointments.Add(appointment);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, appointmentId = appointment.AppointmentId });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating donor appointment: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to create donor appointment" });
        }
    }

    /// <summary>
    /// Complete donor appointment
    /// </summary>
    [HttpPost("donor-appointments/{id}/complete")]
    public async Task<IActionResult> CompleteDonorAppointment(int id)
    {
        try
        {
            var appointment = await _context.DonorAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { success = false, message = "Donor appointment not found" });

            appointment.Status = "Completed";
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Donor appointment marked as completed" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error completing donor appointment: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to complete donor appointment" });
        }
    }

    /// <summary>
    /// Cancel donor appointment
    /// </summary>
    [HttpPost("donor-appointments/{id}/cancel")]
    public async Task<IActionResult> CancelDonorAppointment(int id)
    {
        try
        {
            var appointment = await _context.DonorAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { success = false, message = "Donor appointment not found" });

            appointment.Status = "Cancelled";
            appointment.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Donor appointment cancelled" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error cancelling donor appointment: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to cancel donor appointment" });
        }
    }

    /// <summary>
    /// Get hospital staff profile
    /// </summary>
    [HttpGet("staff-profile/{userId}")]
    public async Task<IActionResult> GetStaffProfile(int userId)
    {
        try
        {
            var profile = await _context.HospitalStaff
                .Where(hs => hs.UserId == userId)
                .Join(_context.Users, hs => hs.UserId, u => u.Id, (hs, u) => new { hs, u })
                .Join(_context.Hospitals, x => x.hs.HospitalId, h => h.HospitalId, (x, h) => new
                {
                    userId = x.u.Id,
                    fullName = x.u.FullName,
                    email = x.u.Email,
                    phone = x.u.Phone,
                    position = x.hs.Position,
                    hospitalId = h.HospitalId,
                    hospitalName = h.HospitalName,
                    hospitalAddress = h.Address,
                    hospitalContact = h.ContactNumber,
                    contactPerson = h.ContactPerson
                })
                .FirstOrDefaultAsync();

            if (profile == null)
                return NotFound(new { success = false, message = "Hospital staff profile not found" });

            return Ok(new { success = true, data = profile });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching staff profile: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch staff profile" });
        }
    }

    /// <summary>
    /// Update hospital staff profile
    /// </summary>
    [HttpPut("staff-profile/{userId}")]
    public async Task<IActionResult> UpdateStaffProfile(int userId, [FromBody] UpdateStaffProfileDto dto)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            var staff = await _context.HospitalStaff.FirstOrDefaultAsync(hs => hs.UserId == userId);
            
            if (user == null || staff == null)
                return NotFound(new { success = false, message = "Hospital staff not found" });

            // Update user information
            if (!string.IsNullOrEmpty(dto.FullName))
                user.FullName = dto.FullName;
            if (!string.IsNullOrEmpty(dto.Email))
                user.Email = dto.Email;
            if (!string.IsNullOrEmpty(dto.Phone))
                user.Phone = dto.Phone;

            // Update staff position
            if (!string.IsNullOrEmpty(dto.Position))
                staff.Position = dto.Position;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Profile updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating staff profile: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to update profile" });
        }
    }


    private async Task SendAppointmentNotification(int patientId, string status, int appointmentId)
    {
        try
        {
            var patient = await _context.PatientProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.PatientId == patientId);

            if (patient == null) return;

            var message = status.ToLower() switch
            {
                "completed" => $"Your appointment #{appointmentId} has been completed.",
                "cancelled" => $"Your appointment #{appointmentId} has been cancelled. Please contact the hospital for rescheduling.",
                "updated" => $"Your appointment #{appointmentId} details have been updated. Please check your appointments.",
                _ => $"Your appointment #{appointmentId} status has been updated to {status}."
            };

            // Send SNS email notification
            await _snsService.SendAppointmentNotification(patient.User.Email, status, appointmentId, patient.UserId);

            // Create in-app notification
            var notification = new Notification
            {
                UserId = patient.UserId,
                Title = $"Appointment {status}",
                Message = message,
                Type = "appointment_update",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                AppointmentId = appointmentId
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error sending appointment notification: {ex.Message}");
        }
    }

}

public class AddInventoryRequest
{
    public int HospitalId { get; set; }
    public string BloodType { get; set; } = string.Empty;
    public int? Units { get; set; }
}

public class UpdateInventoryRequest
{
    public int? Units { get; set; }
}

public class RejectRequestDto
{
    public string? RejectionNotes { get; set; }
}

public class HospitalDonorRequestDto
{
    public int DonationId { get; set; }
    public string DonorName { get; set; } = "";
    public string DonorEmail { get; set; } = "";
    public string DonorPhone { get; set; } = "";
    public string BloodType { get; set; } = "";
    public int UnitsRequested { get; set; }
    public string Status { get; set; } = "";
    public DateTime RequestedDate { get; set; }
    public string Notes { get; set; } = "";
}

public class ApproveRequestDto
{
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
}

public class CreateDonorAppointmentDto
{
    public int DonationId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
}

public class CompleteDonorAppointmentDto
{
    public int UnitsCollected { get; set; }
}

public class CompleteAppointmentDto
{
    public string? DoctorNotes { get; set; }
}

public class UpdateAppointmentDto
{
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? DoctorNotes { get; set; }
}

public class AppointmentWithNamesDto
{
    public int AppointmentId { get; set; }
    public int? RequestId { get; set; }
    public string PatientName { get; set; } = "";
    public string PatientPhone { get; set; } = "";
    public string BloodType { get; set; } = "";
    public string DoctorName { get; set; } = "";
    public int? DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string Status { get; set; } = "";
    public string DoctorNotes { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class UpdateStaffProfileDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Position { get; set; }
}

public class LinkHospitalRequest
{
    public int HospitalId { get; set; }
    public string? Position { get; set; }
}


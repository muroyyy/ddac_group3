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
    private readonly ILogger<HospitalController> _logger;

    public HospitalController(ApplicationDbContext context, NotificationService notificationService, ILogger<HospitalController> logger)
    {
        _context = context;
        _notificationService = notificationService;
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
        _logger.LogInformation($"Looking up hospital ID for user {userId}");
        
        // First check if user is hospital staff
        var staff = await _context.HospitalStaff
            .FirstOrDefaultAsync(s => s.UserId == userId);
        if (staff != null)
        {
            _logger.LogInformation($"Found hospital staff record: Hospital ID {staff.HospitalId}");
            return staff.HospitalId;
        }

        // Fallback: check if user is directly a hospital user
        var hospital = await _context.Hospitals
            .FirstOrDefaultAsync(h => h.UserId == userId);
        if (hospital != null)
        {
            _logger.LogInformation($"Found direct hospital record: Hospital ID {hospital.HospitalId}");
            return hospital.HospitalId;
        }
        
        _logger.LogWarning($"No hospital association found for user {userId}");
        return null;
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
                return BadRequest(new { error = "Hospital staff not found" });

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
                .SumAsync(bi => bi.QuantityUnits);

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
            return StatusCode(500, new { success = false, message = "Failed to fetch dashboard stats" });
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
            _logger.LogInformation($"Getting blood requests for user ID: {userId}");
            
            // Get hospital ID for this user
            var hospitalId = await GetHospitalIdFromUser(userId);
            _logger.LogInformation($"Hospital ID for user {userId}: {hospitalId}");
            
            if (hospitalId == null)
            {
                _logger.LogWarning($"No hospital staff record found for user ID: {userId}");
                return BadRequest(new { success = false, message = "Hospital staff not found" });
            }

            // Simple approach - just get blood requests without complex joins for now
            var bloodRequests = await _context.Set<BloodRequest>()
                .Where(br => br.HospitalId == hospitalId.Value)
                .ToListAsync();

            var results = bloodRequests.Select(br => new
            {
                requestId = br.RequestId,
                patientName = "Patient " + br.PatientId, // Temporary placeholder
                patientEmail = "",
                patientPhone = "",
                bloodType = br.BloodType ?? "",
                unitsRequired = br.UnitsRequired,
                status = br.Status ?? "",
                urgencyLevel = br.UrgencyLevel ?? "",
                notes = br.Notes ?? "",
                rejectionNotes = br.RejectionNotes ?? "",
                createdAt = br.CreatedAt?.ToString("yyyy-MM-dd HH:mm") ?? "",
                emergencyContact = "",
                allergies = "",
                medicalCondition = ""
            }).OrderByDescending(x => x.createdAt).ToList();

            _logger.LogInformation($"Found {results.Count} blood requests for hospital {hospitalId}");
            return Ok(new { success = true, data = results });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching blood requests for user {userId}: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch blood requests", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all blood requests from the blood_requests table for hospital staff
    /// </summary>
    [HttpGet("all-blood-requests/{userId}")]
    public async Task<IActionResult> GetAllBloodRequests(int userId)
    {
        try
        {
            _logger.LogInformation($"Getting all blood requests for user ID: {userId}");
            
            // Get hospital ID for this user
            var hospitalId = await GetHospitalIdFromUser(userId);
            _logger.LogInformation($"Hospital ID for user {userId}: {hospitalId}");
            
            if (hospitalId == null)
            {
                _logger.LogWarning($"No hospital staff record found for user ID: {userId}");
                return BadRequest(new { success = false, message = "Hospital staff not found" });
            }

            var requests = await _context.BloodRequests
                .Where(br => br.HospitalId == hospitalId.Value)
                .Join(_context.PatientProfiles, br => br.PatientId, pp => pp.PatientId, (br, pp) => new { br, pp })
                .Join(_context.Users, x => x.pp.UserId, u => u.Id, (x, u) => new
                {
                    requestId = x.br.RequestId,
                    patientId = x.br.PatientId,
                    hospitalId = x.br.HospitalId,
                    patientName = u.FullName ?? "",
                    patientEmail = u.Email ?? "",
                    patientPhone = u.Phone ?? "",
                    bloodType = x.br.BloodType ?? "",
                    unitsRequired = x.br.UnitsRequired,
                    status = x.br.Status ?? "",
                    urgencyLevel = x.br.UrgencyLevel ?? "",
                    notes = x.br.Notes ?? "",
                    createdAt = x.br.CreatedAt.HasValue ? x.br.CreatedAt.Value.ToString("yyyy-MM-dd HH:mm:ss") : ""
                })
                .OrderByDescending(x => x.createdAt)
                .ToListAsync();

            _logger.LogInformation($"Found {requests.Count} blood requests for hospital {hospitalId}");
            return Ok(new { success = true, data = requests });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching all blood requests for user {userId}: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch all blood requests", error = ex.Message });
        }
    }

    /// <summary>
    /// Approve blood request.
    /// </summary>
    [HttpPost("requests/{id}/approve")]
    public async Task<IActionResult> ApproveRequest(int id)
    {
        try
        {
            var bloodRequest = await _context.Set<BloodRequest>().FindAsync(id);
            if (bloodRequest == null)
                return NotFound(new { error = "Request not found" });

            bloodRequest.Status = "Approved";
            _context.Set<BloodRequest>().Update(bloodRequest);
            await _context.SaveChangesAsync();

            await SendBloodRequestNotification(bloodRequest.PatientId, "Approved", id);

            return Ok(new { success = true, message = "Request approved. Please create appointment." });
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
    /// Create appointment after approval.
    /// </summary>
    [HttpPost("appointments/create")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
    {
        try
        {
            var bloodRequest = await _context.Set<BloodRequest>().FindAsync(dto.RequestId);
            if (bloodRequest == null || bloodRequest.Status != "Approved")
                return BadRequest(new { error = "Invalid or non-approved request" });

            var appointment = new PatientAppointment
            {
                RequestId = dto.RequestId,
                PatientId = bloodRequest.PatientId,
                HospitalId = bloodRequest.HospitalId,
                AppointmentDate = dto.AppointmentDate,
                Status = "Upcoming",
                DoctorNotes = dto.InitialNotes,
                CreatedAt = DateTime.UtcNow
            };

            _context.PatientAppointments.Add(appointment);
            await _context.SaveChangesAsync();

            await _notificationService.SendAppointmentNotification(appointment.AppointmentId, "Created");

            return Ok(new { success = true, appointmentId = appointment.AppointmentId });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error creating appointment: {ex.Message}");
            return StatusCode(500, new { error = "Failed to create appointment" });
        }
    }

    /// <summary>
    /// Get hospital appointments.
    /// </summary>
    [HttpGet("appointments/{userId}")]
    public async Task<IActionResult> GetAppointments(int userId)
    {
        try
        {
            _logger.LogInformation($"Getting appointments for user ID: {userId}");
            
            // Get hospital ID from hospital staff table
            var hospitalId = await GetHospitalIdFromUser(userId);
            _logger.LogInformation($"Hospital ID for user {userId}: {hospitalId}");
            
            if (hospitalId == null)
            {
                _logger.LogWarning($"No hospital staff record found for user ID: {userId}");
                return BadRequest(new { success = false, message = "Hospital staff not found" });
            }

            var appointments = await _context.PatientAppointments
                .Where(a => a.HospitalId == hospitalId.Value)
                .Join(_context.Set<BloodRequest>(), a => a.RequestId, br => br.RequestId, (a, br) => new { a, br })
                .Join(_context.Set<PatientProfile>(), x => x.br.PatientId, pp => pp.PatientId, (x, pp) => new { x.a, x.br, pp })
                .Join(_context.Users, x => x.pp.UserId, u => u.Id, (x, u) => new { x.a, x.br, x.pp, u })
                .GroupJoin(_context.Doctors, x => x.a.DoctorId, d => d.DoctorId, (x, doctors) => new { x.a, x.br, x.pp, x.u, doctors })
                .SelectMany(x => x.doctors.DefaultIfEmpty(), (x, d) => new
                {
                    appointmentId = x.a.AppointmentId,
                    patientName = x.u.FullName ?? "",
                    doctorName = d != null ? d.DoctorName : "Not Assigned",
                    appointmentDate = x.a.AppointmentDate.ToString("yyyy-MM-dd HH:mm"),
                    status = x.a.Status ?? "",
                    bloodType = x.br.BloodType ?? "",
                    doctorNotes = x.a.DoctorNotes ?? ""
                })
                .OrderByDescending(x => x.appointmentDate)
                .ToListAsync();

            _logger.LogInformation($"Found {appointments.Count} appointments for hospital {hospitalId}");
            return Ok(new { success = true, data = appointments });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error fetching appointments for user {userId}: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch appointments", error = ex.Message });
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

            await _notificationService.SendAppointmentNotification(id, "Completed");

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

            await _notificationService.SendAppointmentNotification(id, "Cancelled");

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
                    specialization = d.Specialization,
                    contactNumber = d.ContactNumber
                })
                .ToListAsync();

            return Ok(new { success = true, data = doctors });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching doctors: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch doctors" });
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
            var hospitalId = await GetHospitalIdFromUser(userId);
            if (hospitalId == null)
                return BadRequest(new { success = false, message = "Hospital staff not found" });

            var requests = await _context.DonationRequests
                .Where(dr => dr.HospitalId == hospitalId.Value)
                .Join(_context.DonorProfiles, dr => dr.DonorId, dp => dp.DonorId, (dr, dp) => new { dr, dp })
                .Join(_context.Users, x => x.dp.UserId, u => u.Id, (x, u) => new
                {
                    donationId = x.dr.DonationId,
                    donorName = u.FullName,
                    donorEmail = u.Email,
                    donorPhone = u.Phone,
                    bloodType = x.dp.BloodType,
                    unitsRequired = x.dr.UnitsRequired,
                    status = x.dr.Status,
                    requestedDate = x.dr.RequestedDate.ToString("yyyy-MM-dd"),
                    donationDate = x.dr.DonationDate.HasValue ? x.dr.DonationDate.Value.ToString("yyyy-MM-dd") : null,
                    location = x.dp.Location,
                    totalDonations = x.dp.TotalDonations,
                    isAvailable = x.dp.IsAvailable
                })
                .OrderByDescending(x => x.requestedDate)
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching donor requests: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch donor requests" });
        }
    }

    /// <summary>
    /// Approve donor request
    /// </summary>
    [HttpPost("donor-requests/{id}/approve")]
    public async Task<IActionResult> ApproveDonorRequest(int id)
    {
        try
        {
            var donorRequest = await _context.DonationRequests.FindAsync(id);
            if (donorRequest == null)
                return NotFound(new { success = false, message = "Donor request not found" });

            donorRequest.Status = "Approved";
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Donor request approved. Please create appointment." });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error approving donor request: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to approve donor request" });
        }
    }

    /// <summary>
    /// Reject donor request
    /// </summary>
    [HttpPost("donor-requests/{id}/reject")]
    public async Task<IActionResult> RejectDonorRequest(int id, [FromBody] RejectRequestDto dto)
    {
        try
        {
            var donorRequest = await _context.DonationRequests.FindAsync(id);
            if (donorRequest == null)
                return NotFound(new { success = false, message = "Donor request not found" });

            donorRequest.Status = "Rejected";
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Donor request rejected." });
        }
        catch (Exception ex)
        {
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
            var hospitalId = await GetHospitalIdFromUser(userId);
            if (hospitalId == null)
                return BadRequest(new { success = false, message = "Hospital staff not found" });

            var appointments = await _context.DonorAppointments
                .Where(da => da.HospitalId == hospitalId.Value)
                .Join(_context.DonorProfiles, da => da.DonorId, dp => dp.DonorId, (da, dp) => new { da, dp })
                .Join(_context.Users, x => x.dp.UserId, u => u.Id, (x, u) => new
                {
                    appointmentId = x.da.AppointmentId,
                    donorName = u.FullName,
                    bloodType = x.dp.BloodType,
                    appointmentDate = x.da.AppointmentDate.ToString("yyyy-MM-dd"),
                    appointmentTime = x.da.AppointmentTime.ToString(@"hh\:mm"),
                    status = x.da.Status,
                    createdAt = x.da.CreatedAt.ToString("yyyy-MM-dd HH:mm")
                })
                .OrderByDescending(x => x.appointmentDate)
                .ToListAsync();

            return Ok(new { success = true, data = appointments });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching donor appointments: {ex.Message}");
            return StatusCode(500, new { success = false, message = "Failed to fetch donor appointments" });
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
    /// Complete donor appointment and update inventory
    /// </summary>
    [HttpPost("donor-appointments/{id}/complete")]
    public async Task<IActionResult> CompleteDonorAppointment(int id, [FromBody] CompleteDonorAppointmentDto dto)
    {
        try
        {
            var appointment = await _context.DonorAppointments
                .Include(da => da.Donor)
                .FirstOrDefaultAsync(da => da.AppointmentId == id);
            
            if (appointment == null)
                return NotFound(new { success = false, message = "Donor appointment not found" });

            // Update appointment status
            appointment.Status = "Completed";
            appointment.UpdatedAt = DateTime.UtcNow;

            // Update blood inventory
            var inventory = await _context.BloodInventory
                .FirstOrDefaultAsync(bi => bi.HospitalId == appointment.HospitalId && bi.BloodType == appointment.Donor.BloodType);
            
            if (inventory != null)
            {
                inventory.QuantityUnits += dto.UnitsCollected;
                inventory.LastUpdated = DateTime.UtcNow;
            }
            else
            {
                // Create new inventory entry if doesn't exist
                inventory = new BloodInventory
                {
                    HospitalId = appointment.HospitalId,
                    BloodType = appointment.Donor.BloodType,
                    QuantityUnits = dto.UnitsCollected,
                    Status = "Available",
                    LastUpdated = DateTime.UtcNow
                };
                _context.BloodInventory.Add(inventory);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Donor appointment completed and inventory updated" });
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
                    hospitalContact = h.ContactNumber
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

    /// <summary>
    /// Debug endpoint to check user hospital associations
    /// </summary>
    [HttpGet("debug/user/{userId}")]
    public async Task<IActionResult> DebugUserAssociations(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            var staff = await _context.HospitalStaff.FirstOrDefaultAsync(hs => hs.UserId == userId);
            var hospital = await _context.Hospitals.FirstOrDefaultAsync(h => h.UserId == userId);
            
            return Ok(new {
                userId = userId,
                userExists = user != null,
                userRole = user?.Role.ToString(),
                staffRecord = staff != null ? new { staff.StaffId, staff.HospitalId, staff.Position } : null,
                hospitalRecord = hospital != null ? new { hospital.HospitalId, hospital.HospitalName } : null
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in debug endpoint: {ex.Message}");
            return StatusCode(500, new { error = ex.Message });
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

public class CreateAppointmentDto
{
    public int RequestId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public string? InitialNotes { get; set; }
}

public class CompleteAppointmentDto
{
    public string? DoctorNotes { get; set; }
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



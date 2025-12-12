using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers;

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
    /// Get dashboard stats for a hospital (total inventory, pending approvals, low stock alerts, system health).
    /// </summary>
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats([FromQuery] int hospitalId)
    {
        try
        {
            // Total blood units in inventory
            var totalInventory = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId)
                .SumAsync(bi => bi.QuantityUnits);

            // Pending blood requests from active_blood_requests table
            var pendingApprovals = await _context.Set<ActiveBloodRequest>()
                .Where(abr => abr.Status == "Pending")
                .CountAsync();

            // Low stock count (blood types with less than 10 units)
            var lowStockCount = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId && bi.QuantityUnits < 10)
                .CountAsync();

            var stats = new
            {
                totalInventory = totalInventory,
                pendingApprovals = pendingApprovals,
                lowStockCount = lowStockCount,
                systemHealth = "Healthy"
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching dashboard stats: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch dashboard stats" });
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
    /// Get pending approval requests (blood requests) for a hospital.
    /// </summary>
    [HttpGet("approval-requests")]
    public async Task<IActionResult> GetApprovalRequests([FromQuery] int hospitalId = 0)
    {
        try
        {
            var requests = await _context.Set<BloodRequest>()
                .Where(br => hospitalId == 0 || br.HospitalId == hospitalId)
                .Join(_context.Set<PatientProfile>(), br => br.PatientId, pp => pp.PatientId, (br, pp) => new { br, pp })
                .Join(_context.Users, x => x.pp.UserId, u => u.Id, (x, u) => new { x.br, x.pp, u })
                .GroupJoin(_context.Set<PatientAppointment>(), x => x.br.RequestId, pa => pa.RequestId, (x, appointments) => new { x.br, x.pp, x.u, appointments })
                .SelectMany(x => x.appointments.DefaultIfEmpty(), (x, appointment) => new
                {
                    id = x.br.RequestId,
                    userId = x.br.PatientId,
                    userName = x.u.FullName,
                    userEmail = x.u.Email,
                    requestType = "Blood Request",
                    bloodType = x.br.BloodType,
                    status = x.br.Status,
                    createdAt = x.br.CreatedAt,
                    doctorNote = appointment != null ? appointment.DoctorNotes ?? "" : ""
                })
                .ToListAsync();

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching approval requests: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch approval requests" });
        }
    }

    /// <summary>
    /// Update approval request status.
    /// </summary>
    [HttpPut("approval-requests/{id}")]
    public async Task<IActionResult> UpdateApprovalRequest(int id, [FromBody] UpdateApprovalRequest request)
    {
        try
        {
            var bloodRequest = await _context.Set<BloodRequest>().FindAsync(id);
            if (bloodRequest == null)
                return NotFound(new { error = "Request not found" });

            var oldStatus = bloodRequest.Status;
            bloodRequest.Status = request.Status ?? bloodRequest.Status;

            _context.Set<BloodRequest>().Update(bloodRequest);
            await _context.SaveChangesAsync();

            // Send notification for status change
            if (oldStatus != bloodRequest.Status && !string.IsNullOrEmpty(bloodRequest.Status))
            {
                await SendBloodRequestNotification(bloodRequest.PatientId, bloodRequest.Status, id);
            }

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating approval request: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update approval request" });
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
            var profile = await _context.Set<Hospital>()
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
    /// Update appointment status with notification.
    /// </summary>
    [HttpPut("appointments/{appointmentId}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int appointmentId, [FromBody] UpdateAppointmentStatusRequest request)
    {
        try
        {
            var appointment = await _context.PatientAppointments.FindAsync(appointmentId);
            if (appointment == null)
                return NotFound(new { error = "Appointment not found" });

            appointment.Status = request.Status;
            if (!string.IsNullOrEmpty(request.DoctorNotes))
                appointment.DoctorNotes = request.DoctorNotes;

            await _context.SaveChangesAsync();

            // Send notification
            await _notificationService.SendAppointmentNotification(appointmentId, request.Status);

            return Ok(new { success = true, message = "Appointment status updated and notification sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating appointment status: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update appointment status" });
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

public class UpdateApprovalRequest
{
    public string? Status { get; set; }
    public int? ReviewedBy { get; set; }
}

public class UpdateAppointmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? DoctorNotes { get; set; }
}



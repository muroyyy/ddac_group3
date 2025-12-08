using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers;

[Route("api/patient-appointments")]
[ApiController]
public class PatientAppointmentController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ISNSService _snsService;
    private readonly ILogger<PatientAppointmentController> _logger;

    public PatientAppointmentController(ApplicationDbContext context, ISNSService snsService, ILogger<PatientAppointmentController> logger)
    {
        _context = context;
        _snsService = snsService;
        _logger = logger;
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusRequest request)
    {
        try
        {
            var appointment = await _context.PatientAppointments.FindAsync(id);
            if (appointment == null)
                return NotFound(new { error = "Appointment not found" });

            var oldStatus = appointment.Status;
            appointment.Status = request.Status;
            appointment.DoctorNotes = request.DoctorNotes;

            await _context.SaveChangesAsync();

            // Get patient details for notification
            var patient = await _context.Users
                .Join(_context.Set<PatientProfile>(), u => u.Id, pp => pp.UserId, (u, pp) => new { u, pp })
                .Where(x => x.pp.PatientId == appointment.PatientId)
                .Select(x => new { x.u.Phone, x.u.Email, x.u.FullName, x.u.Id })
                .FirstOrDefaultAsync();

            if (patient != null)
            {
                // Create notification message
                var message = request.Status.ToLower() switch
                {
                    "completed" => $"Your appointment with Dr. {appointment.DoctorName} has been completed. Thank you for visiting us.",
                    "cancelled" => $"Your appointment scheduled for {appointment.AppointmentDate:MMM dd, yyyy} has been cancelled. {request.DoctorNotes}",
                    _ => $"Your appointment status has been updated to {request.Status}."
                };

                // Send SNS notification
                await _snsService.SendAppointmentNotificationAsync(patient.Phone, patient.Email, message);

                // Create in-app notification
                var notification = new Notification
                {
                    UserId = patient.Id,
                    Message = message,
                    Type = request.Status.ToLower() == "cancelled" ? "Alert" : "Reminder",
                    AppointmentId = appointment.AppointmentId,
                    IsRead = false
                };

                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, message = "Appointment status updated and notification sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment status");
            return StatusCode(500, new { error = "Failed to update appointment status" });
        }
    }
}

public class UpdateAppointmentStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? DoctorNotes { get; set; }
}
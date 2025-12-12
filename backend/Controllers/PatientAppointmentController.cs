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
    private readonly NotificationService _notificationService;
    private readonly ILogger<PatientAppointmentController> _logger;

    public PatientAppointmentController(ApplicationDbContext context, NotificationService notificationService, ILogger<PatientAppointmentController> logger)
    {
        _context = context;
        _notificationService = notificationService;
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

            // Send notification using NotificationService
            await _notificationService.SendAppointmentNotification(appointment.AppointmentId, request.Status);

            return Ok(new { success = true, message = "Appointment status updated and notification sent" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment status");
            return StatusCode(500, new { error = "Failed to update appointment status" });
        }
    }
}


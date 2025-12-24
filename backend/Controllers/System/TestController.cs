using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BCrypt.Net;

namespace BloodLine.Controllers.System;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TestController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("link-hospital-user/{userId}")]
    public async Task<IActionResult> LinkHospitalUser(int userId, [FromBody] LinkHospitalRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.Role != UserRole.Hospital)
            {
                return BadRequest(new { error = "Hospital user not found" });
            }

            // Check if already linked
            var existingStaff = await _context.HospitalStaff
                .FirstOrDefaultAsync(hs => hs.UserId == userId);
            
            if (existingStaff != null)
            {
                return Ok(new { success = true, message = "User already linked", staffId = existingStaff.StaffId });
            }

            // Create hospital staff record
            var hospitalStaff = new HospitalStaff
            {
                UserId = userId,
                HospitalId = request.HospitalId,
                Position = request.Position ?? "Staff"
            };

            _context.HospitalStaff.Add(hospitalStaff);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Hospital user linked successfully", staffId = hospitalStaff.StaffId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("diagnose-appointments/{userId}")]
    public async Task<IActionResult> DiagnoseAppointments(int userId)
    {
        try
        {
            var result = new
            {
                userId = userId,
                userExists = await _context.Users.AnyAsync(u => u.Id == userId),
                patientProfileExists = await _context.PatientProfiles.AnyAsync(p => p.UserId == userId),
                appointmentsTableExists = true, // Will fail if table doesn't exist
                appointmentCount = await _context.PatientAppointments.CountAsync(),
                userAppointmentCount = 0
            };

            // Get patient ID
            var patientProfile = await _context.PatientProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
            
            if (patientProfile != null)
            {
                var userAppointmentCount = await _context.PatientAppointments
                    .CountAsync(a => a.PatientId == patientProfile.PatientId);
                
                return Ok(new { 
                    success = true, 
                    data = new {
                        result.userId,
                        result.userExists,
                        result.patientProfileExists,
                        patientId = patientProfile.PatientId,
                        result.appointmentsTableExists,
                        result.appointmentCount,
                        userAppointmentCount
                    }
                });
            }

            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return Ok(new { 
                success = false, 
                error = ex.Message,
                stackTrace = ex.StackTrace
            });
        }
    }

    [HttpGet("list-users")]
    public async Task<IActionResult> ListUsers()
    {
        try
        {
            var users = await _context.Users
                .Select(u => new {
                    u.Id,
                    u.FullName,
                    u.Email,
                    Role = u.Role.ToString(),
                    u.Status,
                    u.VerificationStatus
                })
                .ToListAsync();

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("create-hospital-staff")]
    public async Task<IActionResult> CreateHospitalStaff([FromBody] CreateStaffRequest request)
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { error = "Email already exists" });
            }

            // Create user with Hospital role
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12),
                Role = UserRole.Hospital,
                Status = UserStatus.Active,
                VerificationStatus = VerificationStatus.Approved,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create hospital staff record
            var hospitalStaff = new HospitalStaff
            {
                UserId = user.Id,
                HospitalId = request.HospitalId,
                Position = request.Position
            };

            _context.HospitalStaff.Add(hospitalStaff);
            await _context.SaveChangesAsync();

            return Ok(new { 
                success = true, 
                message = "Hospital staff created successfully",
                userId = user.Id,
                staffId = hospitalStaff.StaffId
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class CreateStaffRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public int HospitalId { get; set; }
    public string Position { get; set; } = string.Empty;
}
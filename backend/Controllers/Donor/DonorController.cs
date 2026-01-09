using Microsoft.AspNetCore.Mvc;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Models.System;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DonorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("profile/{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                bloodType = profile?.BloodType ?? "",
                location = profile?.Location ?? ""
            });
        }

        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, [FromBody] DonorUpdateProfileRequest request)
        {
            var profile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            if (profile == null)
            {
                profile = new DonorProfile
                {
                    UserId = userId,
                    BloodType = request.BloodType,
                    Location = request.Location,
                    IsAvailable = request.IsAvailable
                };
                _context.DonorProfiles.Add(profile);
            }
            else
            {
                if (!string.IsNullOrEmpty(request.BloodType))
                    profile.BloodType = request.BloodType;
                profile.Location = request.Location;
                profile.IsAvailable = request.IsAvailable;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpGet("dashboard-stats/{userId}")]
        public async Task<IActionResult> GetDashboardStats(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            
            var pendingCount = 0;
            var completedCount = 0;
            var lastDonationDate = (string?)null;
            var isAvailable = true;
            var availabilityStatus = "Available for Immediate Donation";
            var eligibleForImmediate = true;
            
            if (donorProfile != null)
            {
                pendingCount = await _context.Database
                    .SqlQuery<int>($"SELECT COUNT(*) as Value FROM donation_requests WHERE donor_id = {donorProfile.DonorId} AND status = 'Pending'")
                    .FirstOrDefaultAsync();
                    
                completedCount = await _context.Database
                    .SqlQuery<int>($"SELECT COUNT(*) as Value FROM donor_appointments WHERE donor_id = {donorProfile.DonorId} AND status = 'Completed'")
                    .FirstOrDefaultAsync();
                    
                var lastDonation = await _context.Database
                    .SqlQueryRaw<DateTime?>($"SELECT appointment_date as Value FROM donor_appointments WHERE donor_id = {donorProfile.DonorId} AND status = 'Completed' ORDER BY appointment_date DESC LIMIT 1")
                    .FirstOrDefaultAsync();
                    
                if (lastDonation.HasValue)
                {
                    lastDonationDate = lastDonation.Value.ToString("yyyy-MM-dd");
                    // Check if 3 months have passed since last donation
                    var threeMonthsAgo = DateTime.Now.AddMonths(-3);
                    eligibleForImmediate = lastDonation.Value <= threeMonthsAgo;
                    
                    if (!eligibleForImmediate)
                    {
                        availabilityStatus = "Available for Future Appointments";
                    }
                }
                
                // Override with profile availability setting
                isAvailable = donorProfile.IsAvailable ?? true;
                if (!isAvailable)
                {
                    availabilityStatus = "Unavailable";
                }
            }

            return Ok(new
            {
                totalDonations = completedCount,
                pendingRequests = pendingCount,
                bloodType = donorProfile?.BloodType ?? "N/A",
                lastDonation = lastDonationDate,
                isAvailable = isAvailable,
                availabilityStatus = availabilityStatus,
                eligibleForImmediate = eligibleForImmediate,
                urgentAlerts = 0
            });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            try
            {
                var hospitals = await _context.Database
                    .SqlQueryRaw<HospitalDto>(
                        @"SELECT hospital_id as Id, hospital_name as Name, 
                          address as Location, contact_number as Phone
                          FROM hospital")
                    .ToListAsync();
                
                return Ok(hospitals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading hospitals", error = ex.Message });
            }
        }

        [HttpGet("donation-requests/{userId}")]
        public async Task<IActionResult> GetDonationRequests(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null) 
            {
                return Ok(new List<DonationRequestDto>()); // Return empty array instead of 404
            }

            var requests = await _context.Database
                .SqlQueryRaw<DonationRequestDto>(
                    @"SELECT dr.donation_id as Id, dr.status as Status, 
                      dp.blood_type as BloodType, dr.units_required as UnitsRequested,
                      dr.requested_date as CreatedAt, dr.donation_date as UpdatedAt,
                      h.hospital_name as HospitalName, '' as Notes
                      FROM donation_requests dr
                      JOIN donor_profile dp ON dr.donor_id = dp.donor_id
                      JOIN hospital h ON dr.hospital_id = h.hospital_id
                      WHERE dr.donor_id = {0} AND dr.status = 'Pending'
                      ORDER BY dr.requested_date DESC", donorProfile.DonorId)
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost("donation-request")]
        public async Task<IActionResult> CreateDonationRequest([FromQuery] int userId, [FromBody] CreateDonationRequestDto request)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return BadRequest(new { message = "Donor profile not found. Please complete your profile first." });
            }

            await _context.Database.ExecuteSqlRawAsync(
                @"INSERT INTO donation_requests (donor_id, hospital_id, status, requested_date, units_required) 
                  VALUES ({0}, {1}, 'Pending', {2}, {3})",
                donorProfile.DonorId, request.HospitalId, DateTime.Now, request.UnitsRequested);

            return Ok(new { message = "Donation request submitted successfully" });
        }

        [HttpGet("appointments/{userId}")]
        public async Task<IActionResult> GetAppointments(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return Ok(new { success = true, data = new List<object>() });
            }

            var appointments = await _context.Database
                .SqlQueryRaw<DonorAppointmentResponseDto>(
                    @"SELECT da.appointment_id as Id, h.hospital_name as HospitalName,
                      da.appointment_date as Date, da.appointment_time as Time,
                      da.status as Status, dp.blood_type as BloodType, 1 as Units,
                      da.doctor_notes as DoctorNotes
                      FROM donor_appointments da
                      JOIN hospital h ON da.hospital_id = h.hospital_id
                      JOIN donor_profile dp ON da.donor_id = dp.donor_id
                      WHERE da.donor_id = {0} AND da.status = 'Scheduled'
                      ORDER BY da.appointment_date ASC", donorProfile.DonorId)
                .ToListAsync();

            var formattedAppointments = appointments.Select(a => new
            {
                id = a.Id,
                hospitalName = a.HospitalName,
                date = a.Date.ToString("yyyy-MM-dd"),
                time = a.Time.ToString(@"hh\:mm"),
                status = a.Status,
                bloodType = a.BloodType ?? "Unknown",
                units = a.Units,
                doctorNotes = a.DoctorNotes ?? ""
            }).ToList();

            return Ok(new { success = true, data = formattedAppointments });
        }

        [HttpGet("appointment-history/{userId}")]
        public async Task<IActionResult> GetAppointmentHistory(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return Ok(new List<DonorAppointmentDto>());
            }

            var appointments = await _context.Database
                .SqlQueryRaw<DonorAppointmentDto>(
                    @"SELECT da.appointment_id as Id, h.hospital_name as HospitalName,
                      da.appointment_date as Date, da.appointment_time as Time,
                      da.status as Status, dp.blood_type as BloodType, 1 as Units
                      FROM donor_appointments da
                      JOIN hospital h ON da.hospital_id = h.hospital_id
                      JOIN donor_profile dp ON da.donor_id = dp.donor_id
                      WHERE da.donor_id = {0} AND da.status IN ('Completed', 'Cancelled')
                      ORDER BY da.appointment_date DESC", donorProfile.DonorId)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("completed-donations/{userId}")]
        public async Task<IActionResult> GetCompletedDonations(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return Ok(new List<CompletedDonationDto>());
            }

            var completedDonations = await _context.Database
                .SqlQueryRaw<CompletedDonationDto>(
                    @"SELECT 
                        da.appointment_id as Id,
                        da.donation_id as DonationId,
                        h.hospital_name as HospitalName,
                        da.appointment_date as Date,
                        da.appointment_time as Time,
                        dp.blood_type as BloodType,
                        dr.units_required as Units,
                        da.status as Status
                      FROM donor_appointments da
                      JOIN donation_requests dr ON da.donation_id = dr.donation_id
                      JOIN donor_profile dp ON dr.donor_id = dp.donor_id
                      JOIN hospital h ON da.hospital_id = h.hospital_id
                      WHERE da.donor_id = {0} AND da.status = 'Completed'
                      ORDER BY da.appointment_date DESC", donorProfile.DonorId)
                .ToListAsync();

            return Ok(completedDonations);
        }
    }

    public class HospitalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public string Phone { get; set; } = "";
    }

    public class DonorUpdateProfileRequest
    {
        public string? BloodType { get; set; }
        public string Location { get; set; } = "";
        public bool IsAvailable { get; set; } = true;
    }

    public class DonationRequestDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string HospitalName { get; set; } = "";
        public string Notes { get; set; } = "";
    }

    public class CreateDonationRequestDto
    {
        public string BloodType { get; set; } = "";
        public int UnitsRequested { get; set; }
        public string? Notes { get; set; }
        public int HospitalId { get; set; }
    }

    public class DonorAppointmentDto
    {
        public int Id { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
    }

    public class DonorAppointmentResponseDto
    {
        public int Id { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
        public string? DoctorNotes { get; set; }
    }

    public class CompletedDonationDto
    {
        public int Id { get; set; }
        public int DonationId { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
        public string Status { get; set; } = "";
    }
}
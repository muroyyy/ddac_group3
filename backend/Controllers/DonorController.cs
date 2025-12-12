using Microsoft.AspNetCore.Mvc;
using BloodLine.Data;
using BloodLine.Models;
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
                    Location = request.Location
                };
                _context.DonorProfiles.Add(profile);
            }
            else
            {
                profile.BloodType = request.BloodType;
                profile.Location = request.Location;
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
            
            if (donorProfile != null)
            {
                pendingCount = await _context.Database
                    .SqlQuery<int>($"SELECT COUNT(*) as Value FROM donation_requests WHERE donor_id = {donorProfile.DonorId} AND status = 'Pending'")
                    .FirstOrDefaultAsync();
                    
                completedCount = await _context.Database
                    .SqlQuery<int>($"SELECT COUNT(*) as Value FROM donor_appointments WHERE donor_id = {donorProfile.DonorId} AND status = 'Completed'")
                    .FirstOrDefaultAsync();
            }

            return Ok(new
            {
                totalDonations = completedCount,
                pendingRequests = pendingCount,
                bloodType = donorProfile?.BloodType ?? "N/A",
                lastDonation = (string?)null,
                urgentAlerts = 0
            });
        }

        [HttpGet("hospitals")]
        public async Task<IActionResult> GetHospitals()
        {
            var hospitals = await _context.Hospitals
                .Include(h => h.User)
                .Select(h => new
                {
                    id = h.HospitalId,
                    name = h.HospitalName,
                    location = h.Address,
                    phone = h.ContactNumber ?? "N/A",
                    email = h.User.Email
                })
                .ToListAsync();
            
            return Ok(hospitals);
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
                return Ok(new List<AppointmentDto>());
            }

            var appointments = await _context.Database
                .SqlQueryRaw<AppointmentDto>(
                    @"SELECT da.appointment_id as Id, h.hospital_name as HospitalName,
                      da.appointment_date as Date, da.appointment_time as Time,
                      da.status as Status, dp.blood_type as BloodType, 1 as Units
                      FROM donor_appointments da
                      JOIN hospital h ON da.hospital_id = h.hospital_id
                      JOIN donor_profile dp ON da.donor_id = dp.donor_id
                      WHERE da.donor_id = {0} AND da.status IN ('Scheduled', 'Cancelled')
                      ORDER BY da.appointment_date DESC", donorProfile.DonorId)
                .ToListAsync();

            return Ok(appointments);
        }

        [HttpGet("appointment-history/{userId}")]
        public async Task<IActionResult> GetAppointmentHistory(int userId)
        {
            var donorProfile = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
            if (donorProfile == null)
            {
                return Ok(new List<AppointmentDto>());
            }

            var appointments = await _context.Database
                .SqlQueryRaw<AppointmentDto>(
                    @"SELECT da.appointment_id as Id, h.hospital_name as HospitalName,
                      da.appointment_date as Date, da.appointment_time as Time,
                      da.status as Status, dp.blood_type as BloodType, 1 as Units
                      FROM donor_appointments da
                      JOIN hospital h ON da.hospital_id = h.hospital_id
                      JOIN donor_profile dp ON da.donor_id = dp.donor_id
                      WHERE da.donor_id = {0} AND da.status != 'Scheduled'
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

    public class DonorUpdateProfileRequest
    {
        public string BloodType { get; set; } = "";
        public string Location { get; set; } = "";
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

    public class AppointmentDto
    {
        public int Id { get; set; }
        public string HospitalName { get; set; } = "";
        public DateTime Date { get; set; }
        public TimeSpan Time { get; set; }
        public string Status { get; set; } = "";
        public string BloodType { get; set; } = "";
        public int Units { get; set; }
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
using Microsoft.AspNetCore.Mvc;
using BloodLine.Data;
using BloodLine.Models;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("overview")]
        public async Task<IActionResult> GetOverview()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalDonors = await _context.Users.CountAsync(u => u.Role == UserRole.Donor);
            var totalPatients = await _context.Users.CountAsync(u => u.Role == UserRole.Patient);
            var totalHospitals = await _context.Users.CountAsync(u => u.Role == UserRole.Hospital);

            return Ok(new
            {
                totalUsers,
                totalDonors,
                totalPatients,
                totalHospitals,
                activeUsers = await _context.Users.CountAsync(u => u.IsActive),
                newUsersToday = await _context.Users.CountAsync(u => u.CreatedAt.Date == DateTime.Today)
            });
        }

        [HttpGet("user-growth")]
        public async Task<IActionResult> GetUserGrowth()
        {
            var last30Days = DateTime.Now.AddDays(-30);
            var userGrowth = await _context.Users
                .Where(u => u.CreatedAt >= last30Days)
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new
                {
                    date = g.Key.ToString("yyyy-MM-dd"),
                    count = g.Count()
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            return Ok(userGrowth);
        }

        [HttpGet("user-distribution")]
        public async Task<IActionResult> GetUserDistribution()
        {
            var distribution = await _context.Users
                .GroupBy(u => u.Role)
                .Select(g => new
                {
                    role = g.Key.ToString(),
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(distribution);
        }

        [HttpGet("blood-type-distribution")]
        public async Task<IActionResult> GetBloodTypeDistribution()
        {
            var distribution = await _context.Users
                .Where(u => u.Role == UserRole.Donor && !string.IsNullOrEmpty(u.BloodType))
                .GroupBy(u => u.BloodType)
                .Select(g => new
                {
                    bloodType = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(distribution);
        }
    }
}
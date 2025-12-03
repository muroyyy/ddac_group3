using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Patient;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Services
{
    public class PatientService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PatientService> _logger;

        public PatientService(ApplicationDbContext context, ILogger<PatientService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Create a blood request
        public async Task<BloodRequest> CreateBloodRequestAsync(int patientId, BloodRequestCreateDto dto)
        {
            var request = new BloodRequest
            {
                PatientId = patientId,
                HospitalId = dto.HospitalId,
                BloodType = dto.BloodType,
                UnitsRequired = dto.UnitsRequired,
                UrgencyLevel = dto.UrgencyLevel,
                // Reason = dto.Reason,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.BloodRequests.Add(request);
            await _context.SaveChangesAsync();

            return request;
        }

        // Get all requests of a patient
        public async Task<List<BloodRequest>> GetRequestsAsync(int patientId)
        {
            return await _context.BloodRequests
                .Where(r => r.PatientId == patientId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // Dashboard data
        public async Task<PatientDashboardDto> GetDashboardAsync(int patientId)
        {
            try
            {
                var q = _context.BloodRequests.Where(r => r.PatientId == patientId);

                var total = await q.CountAsync();
                var pending = await q.CountAsync(r => r.Status == "Pending");
                var approved = await q.CountAsync(r => r.Status == "Approved");
                var rejected = await q.CountAsync(r => r.Status == "Rejected");
                var fulfilled = await q.CountAsync(r => r.Status == "Fulfilled");

                return new PatientDashboardDto
                {
                    TotalRequests = total,
                    Pending = pending,
                    Approved = approved,
                    Rejected = rejected,
                    Fulfilled = fulfilled
                };
            }
            catch (Exception ex)
            {
                // Log and return a safe empty dashboard
                _logger?.LogError(ex, "Failed to compute dashboard for patient {PatientId}", patientId);
                return new PatientDashboardDto
                {
                    TotalRequests = 0,
                    Pending = 0,
                    Approved = 0,
                    Rejected = 0,
                    Fulfilled = 0
                };
            }
        }
    }
}

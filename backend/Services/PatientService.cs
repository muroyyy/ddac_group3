using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Patient;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Services
{
    public class PatientService
    {
        private readonly ApplicationDbContext _context;

        public PatientService(ApplicationDbContext context)
        {
            _context = context;
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
            var q = _context.BloodRequests.Where(r => r.PatientId == patientId);

            return new PatientDashboardDto
            {
                TotalRequests = await q.CountAsync(),
                Pending = await q.CountAsync(r => r.Status == "Pending"),
                Approved = await q.CountAsync(r => r.Status == "Approved"),
                Rejected = await q.CountAsync(r => r.Status == "Rejected"),
                Fulfilled = await q.CountAsync(r => r.Status == "Fulfilled")
            };
        }
    }
}

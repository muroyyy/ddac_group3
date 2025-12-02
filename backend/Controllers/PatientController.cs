using BloodLine.Models.Patient;
using BloodLine.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BloodLine.Controllers
{
    [ApiController]
    [Route("api/patient")]
    public class PatientController : ControllerBase
    {
        private readonly PatientService _patientService;

        public PatientController(PatientService patientService)
        {
            _patientService = patientService;
        }

        // POST: api/patient/{patientId}/request
        [HttpPost("{patientId}/request")]
        public async Task<IActionResult> CreateRequest(int patientId, [FromBody] BloodRequestCreateDto dto)
        {
            var request = await _patientService.CreateBloodRequestAsync(patientId, dto);

            return Ok(new
            {
                message = "Blood request created successfully.",
                data = request
            });
        }

        // GET: api/patient/{patientId}/requests
        [HttpGet("{patientId}/requests")]
        public async Task<IActionResult> GetRequests(int patientId)
        {
            var result = await _patientService.GetRequestsAsync(patientId);
            return Ok(result);
        }

        // GET: api/patient/{patientId}/dashboard
        [HttpGet("{patientId}/dashboard")]
        public async Task<IActionResult> Dashboard(int patientId)
        {
            var result = await _patientService.GetDashboardAsync(patientId);
            return Ok(result);
        }
    }
}

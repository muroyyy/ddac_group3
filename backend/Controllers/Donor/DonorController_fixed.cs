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

        // ... other methods remain the same
    }

    public class HospitalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Location { get; set; } = "";
        public string Phone { get; set; } = "";
    }
}
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;
using BloodLine.Models.Users;
using BloodLine.Models.Auth;
using BloodLine.Models.Hospital;
using BloodLine.Models.Blood;
using BloodLine.Models.Appointments;
using BloodLine.Services;

namespace BloodLine.Controllers.Hospital;

[ApiController]
[Route("api/[controller]")]
public class HospitalCodeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HospitalCodeController> _logger;
    private readonly IAuditLogService _auditLog;

    public HospitalCodeController(ApplicationDbContext context, ILogger<HospitalCodeController> logger, IAuditLogService auditLog)
    {
        _context = context;
        _logger = logger;
        _auditLog = auditLog;
    }

    [HttpGet("list")]
    public async Task<ActionResult<object>> GetAllCodes()
    {
        try
        {
            var codes = await _context.HospitalVerificationCodes
                .Include(c => c.Hospital)
                .Select(c => new
                {
                    c.CodeId,
                    c.HospitalId,
                    HospitalName = c.Hospital.HospitalName,
                    c.VerificationCode,
                    c.IsActive,
                    c.CreatedAt,
                    UsedCount = _context.HospitalStaff.Count(s => s.VerificationCodeUsed == c.VerificationCode)
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(new { success = true, data = codes });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching verification codes");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("generate")]
    public async Task<ActionResult<object>> GenerateCode([FromBody] GenerateCodeRequest request)
    {
        try
        {
            var hospital = await _context.Hospitals.FindAsync(request.HospitalId);
            if (hospital == null)
            {
                return NotFound(new { success = false, message = "Hospital not found" });
            }

            // Check if hospital already has an active code
            var existingCode = await _context.HospitalVerificationCodes
                .FirstOrDefaultAsync(c => c.HospitalId == request.HospitalId && c.IsActive);

            if (existingCode != null)
            {
                return Ok(new 
                { 
                    success = false, 
                    message = "Hospital already has an active verification code",
                    existingCode = existingCode.VerificationCode
                });
            }

            // Generate unique code
            string verificationCode;
            do
            {
                verificationCode = GenerateUniqueCode(hospital.HospitalName);
            } while (await _context.HospitalVerificationCodes.AnyAsync(c => c.VerificationCode == verificationCode));

            var newCode = new HospitalVerificationCode
            {
                HospitalId = request.HospitalId,
                VerificationCode = verificationCode,
                IsActive = true
            };

            _context.HospitalVerificationCodes.Add(newCode);
            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"Generated verification code for hospital: {hospital.HospitalName}");

            return Ok(new 
            { 
                success = true, 
                message = "Verification code generated successfully",
                data = new
                {
                    newCode.CodeId,
                    newCode.HospitalId,
                    HospitalName = hospital.HospitalName,
                    newCode.VerificationCode,
                    newCode.IsActive,
                    newCode.CreatedAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating verification code");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("validate")]
    public async Task<ActionResult<object>> ValidateCode([FromBody] ValidateCodeRequest request)
    {
        try
        {
            var code = await _context.HospitalVerificationCodes
                .Include(c => c.Hospital)
                .FirstOrDefaultAsync(c => c.VerificationCode == request.VerificationCode && 
                                         c.HospitalId == request.HospitalId &&
                                         c.IsActive);

            if (code == null)
            {
                return Ok(new { success = false, message = "Invalid verification code" });
            }

            return Ok(new 
            { 
                success = true, 
                message = "Verification code is valid",
                data = new
                {
                    code.HospitalId,
                    HospitalName = code.Hospital.HospitalName
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating verification code");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("deactivate/{codeId}")]
    public async Task<ActionResult<object>> DeactivateCode(int codeId)
    {
        try
        {
            var code = await _context.HospitalVerificationCodes
                .Include(c => c.Hospital)
                .FirstOrDefaultAsync(c => c.CodeId == codeId);

            if (code == null)
            {
                return NotFound(new { success = false, message = "Code not found" });
            }

            code.IsActive = false;
            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"Deactivated verification code for hospital: {code.Hospital.HospitalName}");

            return Ok(new { success = true, message = "Code deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating code");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    private static string GenerateUniqueCode(string hospitalName)
    {
        // Extract initials from hospital name
        var words = hospitalName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var prefix = string.Join("", words.Take(3).Select(w => w[0])).ToUpper();
        
        // Generate random alphanumeric suffix
        var random = new Random();
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var suffix = new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        
        return $"{prefix}-{suffix}";
    }
}

public class GenerateCodeRequest
{
    public int HospitalId { get; set; }
}

public class ValidateCodeRequest
{
    public string VerificationCode { get; set; } = string.Empty;
    public int HospitalId { get; set; }
}

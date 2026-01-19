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
using Amazon.S3;
using Amazon.S3.Model;

namespace BloodLine.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class VerificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<VerificationController> _logger;
    private readonly IAuditLogService _auditLog;
    private readonly IAmazonS3 _s3Client;
    private const string BucketName = "dev-bloodline-assets-8826eb40";

    public VerificationController(ApplicationDbContext context, ILogger<VerificationController> logger, IAuditLogService auditLog, IAmazonS3 s3Client)
    {
        _context = context;
        _logger = logger;
        _auditLog = auditLog;
        _s3Client = s3Client;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<object>> GetPendingVerifications()
    {
        try
        {
            var pendingUsers = await _context.Users
                .Include(u => u.Documents)
                .Where(u => u.VerificationStatus == VerificationStatus.Pending && 
                           (u.Role == UserRole.Donor || u.Role == UserRole.Patient || u.Role == UserRole.Hospital))
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Phone,
                    Role = u.Role.ToString(),
                    VerificationStatus = u.VerificationStatus.ToString(),
                    u.CreatedAt,
                    Documents = u.Documents.Select(d => new
                    {
                        d.Id,
                        d.FileName,
                        d.FilePath,
                        d.DocumentType,
                        d.UploadedAt
                    }).ToList()
                })
                .ToListAsync();

            return Ok(new { success = true, data = pendingUsers });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending verifications");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("approve/{userId}")]
    public async Task<ActionResult<object>> ApproveUser(int userId)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            user.VerificationStatus = VerificationStatus.Approved;

            // Get registration data
            var registrationData = await _context.UserRegistrationData
                .FirstOrDefaultAsync(r => r.UserId == userId);

            // Create role-specific profile based on user role
            if (user.Role == UserRole.Donor)
            {
                // Check if donor profile already exists
                var existingDonor = await _context.DonorProfiles.FirstOrDefaultAsync(d => d.UserId == userId);
                if (existingDonor == null)
                {
                    var donorProfile = new DonorProfile
                    {
                        UserId = userId,
                        BloodType = registrationData?.BloodType ?? "O+",
                        Location = registrationData?.Location ?? "",
                        TotalDonations = 0,
                        IsAvailable = true
                    };
                    _context.DonorProfiles.Add(donorProfile);
                }
            }
            else if (user.Role == UserRole.Patient)
            {
                // Check if patient profile already exists
                var existingPatient = await _context.PatientProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (existingPatient == null)
                {
                    var patientProfile = new PatientProfile
                    {
                        UserId = userId,
                        BloodTypeNeeded = registrationData?.BloodType ?? "O+",
                        UrgencyLevel = UrgencyLevel.Low
                    };
                    _context.PatientProfiles.Add(patientProfile);
                }
            }
            else if (user.Role == UserRole.Hospital && registrationData?.HospitalId.HasValue == true)
            {
                // Check if hospital staff profile already exists
                var existingStaff = await _context.HospitalStaff.FirstOrDefaultAsync(h => h.UserId == userId);
                if (existingStaff == null)
                {
                    var hospitalStaff = new HospitalStaff
                    {
                        UserId = userId,
                        HospitalId = registrationData.HospitalId.Value,
                        Position = registrationData.Position ?? "Staff",
                        VerificationCodeUsed = registrationData.VerificationCode
                    };
                    _context.HospitalStaff.Add(hospitalStaff);
                }
            }

            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"User Verification Approved: {user.Email} - Profile Created");

            return Ok(new { success = true, message = "User approved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving user");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("reject/{userId}")]
    public async Task<ActionResult<object>> RejectUser(int userId, [FromBody] RejectRequest request)
    {
        try
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            user.VerificationStatus = VerificationStatus.Rejected;
            await _context.SaveChangesAsync();
            await _auditLog.LogAsync($"User Verification Rejected: {user.Email} - Reason: {request.Reason}");

            return Ok(new { success = true, message = "User rejected successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting user");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpGet("document/{documentId}")]
    public async Task<IActionResult> GetDocument(int documentId)
    {
        try
        {
            var document = await _context.UserDocuments.FindAsync(documentId);
            if (document == null)
            {
                return NotFound(new { success = false, message = "Document not found" });
            }

            // Generate presigned URL valid for 5 minutes
            var request = new GetPreSignedUrlRequest
            {
                BucketName = BucketName,
                Key = document.FilePath,
                Expires = DateTime.UtcNow.AddMinutes(5)
            };
            
            var url = await _s3Client.GetPreSignedURLAsync(request);
            return Ok(new { success = true, data = new { url } });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching document");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}

public class RejectRequest
{
    public string Reason { get; set; } = string.Empty;
}
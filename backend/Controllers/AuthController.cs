using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;
using BCrypt.Net;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ApplicationDbContext context, ILogger<AuthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Login successful",
                User = new UserData
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    BloodType = null,
                    Location = ""
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Email already exists"
                });
            }

            if (!Enum.TryParse<UserRole>(request.Role, true, out var userRole))
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid role"
                });
            }

            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                Phone = request.Phone,
                PasswordHash = HashPassword(request.Password),
                Role = userRole
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Registration successful",
                User = new UserData
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    BloodType = request.BloodType,
                    Location = request.Location
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration error");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    private static string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                // Don't reveal if email exists for security
                return Ok(new AuthResponse
                {
                    Success = true,
                    Message = "If the email exists, a reset link has been sent"
                });
            }

            // Generate reset token (6-digit code)
            var resetToken = new Random().Next(100000, 999999).ToString();
            var resetExpiry = DateTime.UtcNow.AddMinutes(15); // 15 minutes expiry

            // Store reset token in user record (you might want a separate table for this)
            user.PasswordHash = $"{user.PasswordHash}|{resetToken}|{resetExpiry:yyyy-MM-dd HH:mm:ss}";
            await _context.SaveChangesAsync();

            // In a real app, send email here
            _logger.LogInformation($"Password reset token for {request.Email}: {resetToken}");

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "If the email exists, a reset code has been sent"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Forgot password error");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid reset request"
                });
            }

            // Parse reset token from password hash
            var hashParts = user.PasswordHash.Split('|');
            if (hashParts.Length != 3)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid or expired reset token"
                });
            }

            var originalHash = hashParts[0];
            var storedToken = hashParts[1];
            var expiryString = hashParts[2];

            if (!DateTime.TryParse(expiryString, out var expiry) || DateTime.UtcNow > expiry)
            {
                // Clean up expired token
                user.PasswordHash = originalHash;
                await _context.SaveChangesAsync();
                
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Reset token has expired"
                });
            }

            if (storedToken != request.ResetToken)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid reset token"
                });
            }

            // Reset password
            user.PasswordHash = HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Password reset successful"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Reset password error");
            return StatusCode(500, new AuthResponse
            {
                Success = false,
                Message = "Internal server error"
            });
        }
    }
}
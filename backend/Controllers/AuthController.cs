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
    public async Task<ActionResult<object>> ForgotPassword([FromBody] ForgotPasswordRequest request)
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
                    Message = "Email address not found in our system"
                });
            }

            // Clean up any existing tokens for this user
            var existingTokens = await _context.PasswordResetTokens
                .Where(t => t.UserId == user.Id && !t.Used)
                .ToListAsync();
            _context.PasswordResetTokens.RemoveRange(existingTokens);

            // Generate reset token
            var resetToken = Guid.NewGuid().ToString("N")[..8].ToUpper();
            var expiresAt = DateTime.UtcNow.AddMinutes(15);

            // Store reset token in database
            var passwordResetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Email = user.Email,
                Token = resetToken,
                ExpiresAt = expiresAt
            };

            _context.PasswordResetTokens.Add(passwordResetToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Password reset token for {request.Email}: {resetToken}");

            // Return mock email data for frontend
            return Ok(new
            {
                success = true,
                message = "Reset email sent",
                mockEmailData = new
                {
                    email = user.Email,
                    resetToken = resetToken,
                    expiresAt = expiresAt.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                }
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
            var resetToken = await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Email == request.Email && 
                                         t.Token == request.ResetToken && 
                                         !t.Used);

            if (resetToken == null)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid reset token"
                });
            }

            if (DateTime.UtcNow > resetToken.ExpiresAt)
            {
                return Ok(new AuthResponse
                {
                    Success = false,
                    Message = "Reset token has expired"
                });
            }

            // Reset password
            resetToken.User.PasswordHash = HashPassword(request.NewPassword);
            resetToken.Used = true;

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
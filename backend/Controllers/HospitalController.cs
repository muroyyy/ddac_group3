using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;
using BloodLine.Models;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HospitalController> _logger;

    public HospitalController(ApplicationDbContext context, ILogger<HospitalController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("dashboard/stats")]
    public async Task<ActionResult> GetDashboardStats([FromQuery] int hospitalId)
    {
        try
        {
            var totalInventory = await _context.BloodInventory
                .Where(i => i.HospitalId == hospitalId)
                .SumAsync(i => i.Units);
            
            var pendingApprovals = await _context.ApprovalRequests
                .CountAsync(r => r.Status == "pending");
            
            var lowStockCount = await _context.BloodInventory
                .Where(i => i.HospitalId == hospitalId && i.Units < 10)
                .CountAsync();

            return Ok(new
            {
                totalInventory,
                pendingApprovals,
                lowStockCount,
                systemHealth = "Operational"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching dashboard stats");
            return StatusCode(500, new { message = "Error fetching stats" });
        }
    }

    [HttpGet("blood-inventory")]
    public async Task<ActionResult> GetBloodInventory([FromQuery] int hospitalId)
    {
        try
        {
            var inventory = await _context.BloodInventory
                .Where(i => i.HospitalId == hospitalId)
                .OrderBy(i => i.BloodType)
                .ToListAsync();
            
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching inventory");
            return StatusCode(500, new { message = "Error fetching inventory" });
        }
    }

    [HttpPost("blood-inventory")]
    public async Task<ActionResult> AddBloodInventory([FromBody] BloodInventory item)
    {
        try
        {
            item.LastUpdated = DateTime.UtcNow;
            _context.BloodInventory.Add(item);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Inventory added" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding inventory");
            return StatusCode(500, new { success = false, message = "Error adding inventory" });
        }
    }

    [HttpPut("blood-inventory/{id}")]
    public async Task<ActionResult> UpdateBloodInventory(int id, [FromBody] BloodInventory item)
    {
        try
        {
            var existing = await _context.BloodInventory.FindAsync(id);
            if (existing == null) return NotFound(new { success = false, message = "Item not found" });
            
            existing.Units = item.Units;
            existing.Status = item.Status;
            existing.LastUpdated = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Inventory updated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating inventory");
            return StatusCode(500, new { success = false, message = "Error updating inventory" });
        }
    }

    [HttpDelete("blood-inventory/{id}")]
    public async Task<ActionResult> DeleteBloodInventory(int id)
    {
        try
        {
            var item = await _context.BloodInventory.FindAsync(id);
            if (item == null) return NotFound(new { success = false, message = "Item not found" });
            
            _context.BloodInventory.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Inventory deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting inventory");
            return StatusCode(500, new { success = false, message = "Error deleting inventory" });
        }
    }

    [HttpGet("approval-requests")]
    public async Task<ActionResult> GetApprovalRequests()
    {
        try
        {
            var requests = await _context.ApprovalRequests
                .Include(r => r.User)
                .Where(r => r.Status == "pending")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.UserId,
                    userName = r.User.FullName,
                    userEmail = r.User.Email,
                    r.RequestType,
                    r.BloodType,
                    r.Status,
                    r.CreatedAt
                })
                .ToListAsync();
            
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching approval requests");
            return StatusCode(500, new { message = "Error fetching requests" });
        }
    }

    [HttpPut("approval-requests/{id}")]
    public async Task<ActionResult> UpdateApprovalRequest(int id, [FromBody] ApprovalUpdateRequest request)
    {
        try
        {
            var approval = await _context.ApprovalRequests.FindAsync(id);
            if (approval == null) return NotFound(new { success = false, message = "Request not found" });
            
            approval.Status = request.Status;
            approval.ReviewedBy = request.ReviewedBy;
            approval.ReviewedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = $"Request {request.Status}" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating approval request");
            return StatusCode(500, new { success = false, message = "Error updating request" });
        }
    }
}

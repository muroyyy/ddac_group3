using BloodLine.Data;
using BloodLine.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BloodLine.Controllers;

[Route("api/hospital")]
[ApiController]
public class HospitalController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HospitalController> _logger;

    public HospitalController(ApplicationDbContext context, ILogger<HospitalController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get dashboard stats for a hospital (total inventory, pending approvals, low stock alerts, system health).
    /// </summary>
    [HttpGet("dashboard/stats")]
    public async Task<IActionResult> GetDashboardStats([FromQuery] int hospitalId)
    {
        try
        {
            // Total blood units in inventory
            var totalInventory = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId)
                .SumAsync(bi => bi.QuantityUnits);

            // Pending blood requests from active_blood_requests table
            var pendingApprovals = await _context.Set<ActiveBloodRequest>()
                .Where(abr => abr.Status == "Pending")
                .CountAsync();

            // Low stock alerts (blood types with less than 10 units)
            var lowStockAlerts = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId && bi.QuantityUnits < 10)
                .Select(bi => $"{bi.BloodType}: {bi.QuantityUnits}")
                .ToListAsync();

            var stats = new
            {
                totalInventory = totalInventory,
                pendingApprovals = pendingApprovals,
                lowStockAlerts = lowStockAlerts,
                systemHealth = "Healthy"
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching dashboard stats: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch dashboard stats" });
        }
    }

    /// <summary>
    /// Get blood inventory for a hospital.
    /// </summary>
    [HttpGet("blood-inventory")]
    public async Task<IActionResult> GetBloodInventory([FromQuery] int hospitalId)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>()
                .Where(bi => bi.HospitalId == hospitalId)
                .Select(bi => new
                {
                    id = bi.InventoryId,
                    bloodType = bi.BloodType,
                    units = bi.QuantityUnits,
                    status = bi.QuantityUnits < 5 ? "Low" : (bi.QuantityUnits < 10 ? "Medium" : "Good"),
                    lastUpdated = bi.LastUpdated,
                    hospitalId = bi.HospitalId
                })
                .ToListAsync();

            return Ok(inventory);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch blood inventory" });
        }
    }

    /// <summary>
    /// Add blood inventory for a hospital.
    /// </summary>
    [HttpPost("blood-inventory")]
    public async Task<IActionResult> AddBloodInventory([FromBody] AddInventoryRequest request)
    {
        try
        {
            if (request.HospitalId <= 0 || string.IsNullOrEmpty(request.BloodType))
                return BadRequest(new { error = "Invalid hospital ID or blood type" });

            var inventory = new BloodInventory
            {
                HospitalId = request.HospitalId,
                BloodType = request.BloodType,
                QuantityUnits = request.Units ?? 0,
                LastUpdated = DateTime.Now
            };

            _context.Set<BloodInventory>().Add(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error adding blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to add blood inventory" });
        }
    }

    /// <summary>
    /// Update blood inventory units.
    /// </summary>
    [HttpPut("blood-inventory/{id}")]
    public async Task<IActionResult> UpdateBloodInventory(int id, [FromBody] UpdateInventoryRequest request)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>().FindAsync(id);
            if (inventory == null)
                return NotFound(new { error = "Inventory not found" });

            inventory.QuantityUnits = request.Units ?? inventory.QuantityUnits;
            inventory.LastUpdated = DateTime.Now;

            _context.Set<BloodInventory>().Update(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update blood inventory" });
        }
    }

    /// <summary>
    /// Delete blood inventory.
    /// </summary>
    [HttpDelete("blood-inventory/{id}")]
    public async Task<IActionResult> DeleteBloodInventory(int id)
    {
        try
        {
            var inventory = await _context.Set<BloodInventory>().FindAsync(id);
            if (inventory == null)
                return NotFound(new { error = "Inventory not found" });

            _context.Set<BloodInventory>().Remove(inventory);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error deleting blood inventory: {ex.Message}");
            return StatusCode(500, new { error = "Failed to delete blood inventory" });
        }
    }

    /// <summary>
    /// Get pending approval requests (blood requests) for a hospital.
    /// </summary>
    [HttpGet("approval-requests")]
    public async Task<IActionResult> GetApprovalRequests([FromQuery] int hospitalId = 0)
    {
        try
        {
            var requests = await _context.Set<BloodRequest>()
                .Where(br => hospitalId == 0 || br.HospitalId == hospitalId)
                .Join(_context.Set<PatientProfile>(), br => br.PatientId, pp => pp.PatientId, (br, pp) => new { br, pp })
                .Join(_context.Users, x => x.pp.UserId, u => u.Id, (x, u) => new
                {
                    id = x.br.RequestId,
                    userId = x.br.PatientId,
                    userName = u.FullName,
                    userEmail = u.Email,
                    requestType = "Blood Request",
                    bloodType = x.br.BloodType,
                    status = x.br.Status,
                    createdAt = x.br.CreatedAt
                })
                .ToListAsync();

            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error fetching approval requests: {ex.Message}");
            return StatusCode(500, new { error = "Failed to fetch approval requests" });
        }
    }

    /// <summary>
    /// Update approval request status.
    /// </summary>
    [HttpPut("approval-requests/{id}")]
    public async Task<IActionResult> UpdateApprovalRequest(int id, [FromBody] UpdateApprovalRequest request)
    {
        try
        {
            var bloodRequest = await _context.Set<BloodRequest>().FindAsync(id);
            if (bloodRequest == null)
                return NotFound(new { error = "Request not found" });

            bloodRequest.Status = request.Status ?? bloodRequest.Status;

            _context.Set<BloodRequest>().Update(bloodRequest);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating approval request: {ex.Message}");
            return StatusCode(500, new { error = "Failed to update approval request" });
        }
    }
}

public class AddInventoryRequest
{
    public int HospitalId { get; set; }
    public string BloodType { get; set; } = string.Empty;
    public int? Units { get; set; }
}

public class UpdateInventoryRequest
{
    public int? Units { get; set; }
}

public class UpdateApprovalRequest
{
    public string? Status { get; set; }
    public int? ReviewedBy { get; set; }
}



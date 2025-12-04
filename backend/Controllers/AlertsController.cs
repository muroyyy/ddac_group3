using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BloodLine.Data;

namespace BloodLine.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
public class AlertsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AlertsController> _logger;

    public AlertsController(ApplicationDbContext context, ILogger<AlertsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetAlerts()
    {
        try
        {
            var alerts = new List<object>();

            // Critical: Low blood inventory
            var criticalInventory = await _context.Database
                .SqlQueryRaw<InventoryAlert>(@"
                    SELECT hospital_name, blood_type, quantity_units, last_updated
                    FROM blood_inventory_summary
                    WHERE stock_status = 'critical'
                ")
                .ToListAsync();

            foreach (var item in criticalInventory)
            {
                alerts.Add(new
                {
                    id = $"inv-crit-{item.hospital_name}-{item.blood_type}",
                    type = "critical",
                    category = "Inventory",
                    title = $"Critical: {item.blood_type} Blood Low at {item.hospital_name}",
                    message = $"Only {item.quantity_units} units remaining. Immediate restocking required.",
                    timestamp = item.last_updated.ToString("o"),
                    relatedEntity = "Inventory",
                    relatedId = 0
                });
            }

            // Critical: Critical blood requests
            var criticalRequests = await _context.Database
                .SqlQueryRaw<BloodRequestAlert>(@"
                    SELECT request_id, patient_name, blood_type, units_required, created_at
                    FROM active_blood_requests
                    WHERE urgency_level = 'Critical' AND status = 'Pending'
                ")
                .ToListAsync();

            foreach (var req in criticalRequests)
            {
                alerts.Add(new
                {
                    id = $"req-crit-{req.request_id}",
                    type = "critical",
                    category = "Blood Request",
                    title = $"Critical Blood Request: {req.blood_type}",
                    message = $"Patient {req.patient_name} urgently needs {req.units_required} units of {req.blood_type} blood.",
                    timestamp = req.created_at.ToString("o"),
                    relatedEntity = "BloodRequest",
                    relatedId = req.request_id
                });
            }

            // Warning: Low blood inventory
            var warningInventory = await _context.Database
                .SqlQueryRaw<InventoryAlert>(@"
                    SELECT hospital_name, blood_type, quantity_units, last_updated
                    FROM blood_inventory_summary
                    WHERE stock_status = 'warning'
                ")
                .ToListAsync();

            foreach (var item in warningInventory)
            {
                alerts.Add(new
                {
                    id = $"inv-warn-{item.hospital_name}-{item.blood_type}",
                    type = "warning",
                    category = "Inventory",
                    title = $"Low Stock: {item.blood_type} at {item.hospital_name}",
                    message = $"{item.quantity_units} units remaining. Consider restocking soon.",
                    timestamp = item.last_updated.ToString("o"),
                    relatedEntity = "Inventory",
                    relatedId = 0
                });
            }

            // Warning: Pending user verifications
            var pendingVerifications = await _context.Database
                .SqlQueryRaw<UserVerificationAlert>(@"
                    SELECT user_id, full_name, email, created_at
                    FROM users
                    WHERE verification_status = 'Pending' AND (role = 'Donor' OR role = 'Patient')
                    LIMIT 10
                ")
                .ToListAsync();

            foreach (var user in pendingVerifications)
            {
                alerts.Add(new
                {
                    id = $"verify-{user.user_id}",
                    type = "warning",
                    category = "User Verification",
                    title = $"Pending Verification: {user.full_name}",
                    message = $"User {user.email} is awaiting document verification.",
                    timestamp = user.created_at.ToString("o"),
                    relatedEntity = "User",
                    relatedId = user.user_id
                });
            }

            // Info: Pending donation requests
            var pendingDonations = await _context.Database
                .SqlQueryRaw<DonationAlert>(@"
                    SELECT dr.donation_id, dr.requested_date, dp.blood_type
                    FROM donation_requests dr
                    JOIN donor_profile dp ON dr.donor_id = dp.donor_id
                    WHERE dr.status = 'Pending'
                    LIMIT 5
                ")
                .ToListAsync();

            foreach (var donation in pendingDonations)
            {
                alerts.Add(new
                {
                    id = $"donation-{donation.donation_id}",
                    type = "info",
                    category = "Donation",
                    title = $"Pending Donation Request",
                    message = $"Donation request for {donation.blood_type} blood is awaiting approval.",
                    timestamp = donation.requested_date.ToString("o"),
                    relatedEntity = "Donation",
                    relatedId = donation.donation_id
                });
            }

            return Ok(new { success = true, data = alerts.OrderByDescending(a => ((dynamic)a).timestamp) });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching alerts");
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}

public class InventoryAlert
{
    public string hospital_name { get; set; } = string.Empty;
    public string blood_type { get; set; } = string.Empty;
    public int quantity_units { get; set; }
    public DateTime last_updated { get; set; }
}

public class BloodRequestAlert
{
    public int request_id { get; set; }
    public string patient_name { get; set; } = string.Empty;
    public string blood_type { get; set; } = string.Empty;
    public int units_required { get; set; }
    public DateTime created_at { get; set; }
}

public class UserVerificationAlert
{
    public int user_id { get; set; }
    public string full_name { get; set; } = string.Empty;
    public string email { get; set; } = string.Empty;
    public DateTime created_at { get; set; }
}

public class DonationAlert
{
    public int donation_id { get; set; }
    public string blood_type { get; set; } = string.Empty;
    public DateTime requested_date { get; set; }
}

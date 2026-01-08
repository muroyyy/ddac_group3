using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models.Blood;

[Table("blood_inventory")]
public class BloodInventory
{
    [Key]
    [Column("inventory_id")]
    public int InventoryId { get; set; }

    [Column("hospital_id")]
    public int HospitalId { get; set; }

    [Column("blood_type")]
    public string BloodType { get; set; } = string.Empty;

    [Column("quantity_units")]
    public int QuantityUnits { get; set; }

    [Column("status")]
    public string Status { get; set; } = "Approved";

    [Column("last_updated")]
    public DateTime? LastUpdated { get; set; }
}
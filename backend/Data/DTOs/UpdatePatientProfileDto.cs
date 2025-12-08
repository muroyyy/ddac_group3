namespace BloodLine.DTOs;

public class UpdatePatientProfileDto
{
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? BloodTypeNeeded { get; set; }
    public string? MedicalCondition { get; set; }
}

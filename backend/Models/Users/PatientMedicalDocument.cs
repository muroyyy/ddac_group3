using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BloodLine.Models.Users;

[Table("patient_medical_documents")]
public class PatientMedicalDocument
{
    [Key]
    [Column("document_id")]
    public int DocumentId { get; set; }

    [Required]
    [Column("patient_id")]
    public int PatientId { get; set; }

    [Required]
    [StringLength(255)]
    [Column("document_name")]
    public string DocumentName { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    [Column("s3_key")]
    public string S3Key { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    [Column("cloudfront_url")]
    public string CloudFrontUrl { get; set; } = string.Empty;

    [StringLength(100)]
    [Column("file_type")]
    public string? FileType { get; set; }

    [Column("file_size")]
    public long? FileSize { get; set; }

    [Column("uploaded_at")]
    public DateTime UploadedAt { get; set; }
}

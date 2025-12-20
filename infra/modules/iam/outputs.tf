output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "monitoring_readonly_access_key_id" {
  description = "Monitoring dashboard read-only IAM user access key ID"
  value       = aws_iam_access_key.monitoring_readonly.id
}

output "monitoring_readonly_secret_access_key" {
  description = "Monitoring dashboard read-only IAM user secret access key"
  value       = aws_iam_access_key.monitoring_readonly.secret
  sensitive   = true
}
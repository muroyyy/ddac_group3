output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}
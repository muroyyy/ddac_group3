output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "ec2_instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.main.id
}

output "ec2_public_ip" {
  description = "EC2 Public IP"
  value       = aws_instance.main.public_ip
}

output "rds_endpoint" {
  description = "RDS Endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_port" {
  description = "RDS Port"
  value       = aws_db_instance.main.port
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret name for RDS credentials"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_website_url" {
  description = "S3 website URL"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "deployment_bucket_name" {
  description = "S3 deployment bucket name"
  value       = aws_s3_bucket.deployment.bucket
}

output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}
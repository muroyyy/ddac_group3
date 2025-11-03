output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ec2_instance_id" {
  description = "EC2 Instance ID"
  value       = module.ec2.instance_id
}

output "ec2_public_ip" {
  description = "EC2 Elastic IP"
  value       = module.ec2.public_ip
}

output "rds_endpoint" {
  description = "RDS Endpoint"
  value       = module.rds.rds_endpoint
}

output "rds_port" {
  description = "RDS Port"
  value       = module.rds.rds_port
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret name for RDS credentials"
  value       = module.rds.secrets_manager_secret_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for frontend"
  value       = module.s3.bucket_name
}

output "s3_website_url" {
  description = "S3 website URL"
  value       = module.s3.website_endpoint
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "github_actions_access_key_id" {
  description = "GitHub Actions IAM user access key ID"
  value       = module.iam.github_actions_access_key_id
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions IAM user secret access key"
  value       = module.iam.github_actions_secret_access_key
  sensitive   = true
}

output "quicksight_dashboard_id" {
  description = "QuickSight dashboard ID"
  value       = module.quicksight.dashboard_id
}

output "quicksight_dashboard_arn" {
  description = "QuickSight dashboard ARN"
  value       = module.quicksight.dashboard_arn
}
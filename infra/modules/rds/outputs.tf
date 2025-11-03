output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret name"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "secrets_manager_secret_arn" {
  description = "Secrets Manager secret ARN"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "instance_id" {
  description = "RDS instance identifier"
  value       = aws_db_instance.main.identifier
}

output "db_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}
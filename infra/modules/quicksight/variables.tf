variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "rds_instance_id" {
  description = "RDS instance identifier"
  type        = string
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "quicksight_user" {
  description = "QuickSight user name"
  type        = string
}
variable "domain_name" {
  description = "Domain name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_website_endpoint" {
  description = "S3 website endpoint for frontend"
  type        = string
}

variable "ec2_public_dns" {
  description = "EC2 public DNS for API backend"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
}
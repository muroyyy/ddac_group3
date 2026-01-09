variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "bloodline"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "bloodline"
}



variable "domain_name" {
  description = "Custom domain name"
  type        = string
  default     = "bloodline.dev"
}

variable "waf_web_acl_arn" {
  description = "WAF Web ACL ARN for CloudFront (configured manually in AWS Console)"
  type        = string
  default     = "arn:aws:wafv2:us-east-1:007027391333:global/webacl/bloodline-production-waf/b97de16a-9d3e-40f3-8ea7-5211fbf7640e"
}
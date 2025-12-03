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

variable "origin_domain_name" {
  description = "Origin domain name (EC2 public DNS)"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate ARN"
  type        = string
}
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

variable "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  type        = string
}

variable "cloudfront_hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  type        = string
}

variable "api_cloudfront_domain_name" {
  description = "API CloudFront distribution domain name"
  type        = string
}

variable "api_cloudfront_hosted_zone_id" {
  description = "API CloudFront distribution hosted zone ID"
  type        = string
}
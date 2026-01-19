output "distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "hosted_zone_id" {
  description = "CloudFront distribution hosted zone ID"
  value       = aws_cloudfront_distribution.main.hosted_zone_id
}

output "api_distribution_id" {
  description = "API CloudFront distribution ID"
  value       = length(aws_cloudfront_distribution.api) > 0 ? aws_cloudfront_distribution.api[0].id : ""
}

output "api_domain_name" {
  description = "API CloudFront distribution domain name"
  value       = length(aws_cloudfront_distribution.api) > 0 ? aws_cloudfront_distribution.api[0].domain_name : ""
}

output "api_hosted_zone_id" {
  description = "API CloudFront distribution hosted zone ID"
  value       = length(aws_cloudfront_distribution.api) > 0 ? aws_cloudfront_distribution.api[0].hosted_zone_id : ""
}
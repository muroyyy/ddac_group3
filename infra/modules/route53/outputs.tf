output "hosted_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "name_servers" {
  description = "Route53 name servers"
  value       = aws_route53_zone.main.name_servers
}

output "zone_arn" {
  description = "Route53 hosted zone ARN"
  value       = aws_route53_zone.main.arn
}

output "query_log_group_name" {
  description = "Route53 query log group name"
  value       = aws_cloudwatch_log_group.route53_query_log.name
}

output "query_log_group_arn" {
  description = "Route53 query log group ARN"
  value       = aws_cloudwatch_log_group.route53_query_log.arn
}
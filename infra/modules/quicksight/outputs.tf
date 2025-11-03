output "dashboard_id" {
  description = "QuickSight dashboard ID"
  value       = aws_quicksight_dashboard.bloodbank_dashboard.dashboard_id
}

output "dashboard_arn" {
  description = "QuickSight dashboard ARN"
  value       = aws_quicksight_dashboard.bloodbank_dashboard.arn
}

output "data_source_arn" {
  description = "QuickSight data source ARN"
  value       = aws_quicksight_data_source.bloodbank_rds.arn
}
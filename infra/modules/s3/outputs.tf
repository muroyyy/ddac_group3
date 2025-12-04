output "bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend.bucket
}

output "bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}

output "website_endpoint" {
  description = "S3 website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "assets_bucket_name" {
  description = "S3 assets bucket name"
  value       = aws_s3_bucket.assets.bucket
}

output "assets_bucket_arn" {
  description = "S3 assets bucket ARN"
  value       = aws_s3_bucket.assets.arn
}
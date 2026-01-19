terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
      configuration_aliases = [aws.us_east_1]
    }
  }
}

resource "aws_route53_zone" "main" {
  name = var.domain_name

  tags = {
    Name        = "${var.project_name}-${var.environment}-zone"
    Environment = var.environment
    Project     = var.project_name
  }
}

# A record for root domain pointing to CloudFront
resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for www subdomain pointing to CloudFront
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

# A record for api subdomain pointing to API CloudFront
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.api_cloudfront_domain_name
    zone_id                = var.api_cloudfront_hosted_zone_id
    evaluate_target_health = false
  }

  depends_on = [aws_route53_zone.main]
}

# CloudWatch Log Group for Route53 Query Logging (must be in us-east-1)
resource "aws_cloudwatch_log_group" "route53_query_log" {
  provider = aws.us_east_1
  
  name              = "/aws/route53/${var.domain_name}"
  retention_in_days = 7  # Keep logs for 7 days to minimize costs

  tags = {
    Name        = "${var.project_name}-${var.environment}-route53-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

# Data source to get current AWS account ID
data "aws_caller_identity" "current" {}

# CloudWatch Logs resource policy for Route53
resource "aws_cloudwatch_log_resource_policy" "route53_query_log_policy" {
  provider = aws.us_east_1
  
  policy_name     = "route53-query-logging-policy"
  policy_document = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "route53.amazonaws.com"
        }
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:us-east-1:${data.aws_caller_identity.current.account_id}:log-group:/aws/route53/*"
      }
    ]
  })
}

# Route53 Query Logging Configuration
resource "aws_route53_query_log" "main" {
  depends_on = [
    aws_cloudwatch_log_group.route53_query_log,
    aws_cloudwatch_log_resource_policy.route53_query_log_policy
  ]

  cloudwatch_log_group_arn = aws_cloudwatch_log_group.route53_query_log.arn
  zone_id                  = aws_route53_zone.main.zone_id
}
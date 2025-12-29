resource "aws_iam_user" "github_actions" {
  name = "${var.environment}-${var.project_name}-github-actions"
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

resource "aws_iam_policy" "github_actions" {
  name = "${var.environment}-${var.project_name}-github-actions-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = [
          var.ecr_repository_arn,
          "*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand"
        ]
        Resource = [
          "arn:aws:ec2:${var.aws_region}:*:instance/${var.ec2_instance_id}",
          "arn:aws:ssm:${var.aws_region}:*:document/AWS-RunShellScript"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetCommandInvocation"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "github_actions" {
  user       = aws_iam_user.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}

# Monitoring Dashboard Read-Only User
resource "aws_iam_user" "monitoring_readonly" {
  name = "monitoring-dashboard-readonly"
}

resource "aws_iam_access_key" "monitoring_readonly" {
  user = aws_iam_user.monitoring_readonly.name
}

resource "aws_iam_policy" "monitoring_readonly" {
  name = "monitoring-dashboard-readonly-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:GetMetricStatistics",
          "cloudwatch:ListMetrics",
          "cloudwatch:GetMetricData",
          "cloudwatch:DescribeAlarms",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
          "rds:DescribeDBInstances",
          "lambda:ListFunctions",
          "lambda:GetFunction",
          "apigateway:GET",
          "s3:ListAllMyBuckets",
          "s3:GetBucketLocation",
          "s3:ListBucket",
          "cloudfront:GetDistribution",
          "cloudfront:ListDistributions"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "monitoring_readonly" {
  user       = aws_iam_user.monitoring_readonly.name
  policy_arn = aws_iam_policy.monitoring_readonly.arn
}
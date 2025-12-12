resource "aws_sns_topic" "notifications" {
  name         = "${var.environment}-${var.project_name}-notifications"
  display_name = "BloodLine Notifications"
}

resource "aws_sns_topic_policy" "notifications" {
  arn = aws_sns_topic.notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.notifications.arn
      }
    ]
  })
}

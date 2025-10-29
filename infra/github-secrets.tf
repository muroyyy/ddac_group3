# GitHub secrets setup script
resource "local_file" "github_secrets_script" {
  filename = "${path.module}/setup-github-secrets.sh"
  content = templatefile("${path.module}/setup-github-secrets.tpl", {
    aws_access_key_id     = aws_iam_access_key.github_actions.id
    aws_secret_access_key = aws_iam_access_key.github_actions.secret
    s3_bucket_name        = aws_s3_bucket.frontend.bucket
    deployment_bucket     = aws_s3_bucket.deployment.bucket
    ec2_instance_id       = aws_instance.main.id
  })
  file_permission = "0755"
}
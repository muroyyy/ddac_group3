resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.environment}-${var.project_name}-frontend-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "${var.environment}-${var.project_name}-frontend"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

# Assets bucket for file uploads and storage
resource "aws_s3_bucket" "assets" {
  bucket = "${var.environment}-${var.project_name}-assets-${random_id.bucket_suffix.hex}"

  tags = {
    Name = "${var.environment}-${var.project_name}-assets"
  }
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Create folder structure using S3 objects
resource "aws_s3_object" "admin_folder" {
  bucket = aws_s3_bucket.assets.id
  key    = "admin/"
  content = ""
}

resource "aws_s3_object" "donor_folder" {
  bucket = aws_s3_bucket.assets.id
  key    = "donor/"
  content = ""
}

resource "aws_s3_object" "patient_folder" {
  bucket = aws_s3_bucket.assets.id
  key    = "patient/"
  content = ""
}

resource "aws_s3_object" "hospital_folder" {
  bucket = aws_s3_bucket.assets.id
  key    = "hospital/"
  content = ""
}

# Schema backup bucket
resource "aws_s3_bucket" "schema_backups" {
  bucket = "bloodline-schema-backups-sha"

  tags = {
    Name = "${var.environment}-${var.project_name}-schema-backups"
  }
}

resource "aws_s3_bucket_versioning" "schema_backups" {
  bucket = aws_s3_bucket.schema_backups.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "schema_backups" {
  bucket = aws_s3_bucket.schema_backups.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "schema_backups" {
  bucket = aws_s3_bucket.schema_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
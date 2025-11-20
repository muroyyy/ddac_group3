resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-${var.project_name}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.environment}-${var.project_name}-db-subnet-group"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

resource "aws_db_instance" "main" {
  identifier     = "${var.environment}-${var.project_name}-rds"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "bloodline"
  username = var.db_username
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "${var.environment}-${var.project_name}-rds"
  }
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${var.environment}-${var.project_name}-db-credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    endpoint = aws_db_instance.main.endpoint
    username = aws_db_instance.main.username
    password = random_password.db_password.result
    database = aws_db_instance.main.db_name
  })
}
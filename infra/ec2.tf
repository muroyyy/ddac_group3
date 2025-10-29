data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_iam_role" "ec2_ssm_role" {
  name = "${var.environment}-${var.project_name}-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_ssm_policy" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.environment}-${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_ssm_role.name
}

resource "aws_instance" "main" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name

  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y awscli dotnet-runtime-8.0
    
    # Setup SSM Agent
    snap install amazon-ssm-agent --classic
    systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
    systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
    
    # Create bloodline user and directories
    useradd -r -s /bin/false bloodline
    mkdir -p /opt/bloodline/app
    chown bloodline:bloodline /opt/bloodline/app
    
    # Create systemd service
    cat > /etc/systemd/system/bloodline-api.service << 'EOL'
[Unit]
Description=BloodLine API
After=network.target

[Service]
Type=notify
User=bloodline
WorkingDirectory=/opt/bloodline/app
ExecStart=/usr/bin/dotnet BloodLine.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target
EOL
    
    systemctl daemon-reload
    systemctl enable bloodline-api
  EOF
  )

  tags = {
    Name = "${var.environment}-${var.project_name}-ec2"
  }
}
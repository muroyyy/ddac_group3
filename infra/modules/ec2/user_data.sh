#!/bin/bash
set -e

# Update system
apt-get update

# Install essential packages
apt-get install -y curl unzip mysql-client

# Install Docker
apt-get install -y docker.io
systemctl start docker
systemctl enable docker
usermod -aG docker ubuntu

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
rm -rf awscliv2.zip aws/

# Setup SSM Agent
snap install amazon-ssm-agent --classic
systemctl enable snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service

# Verify installations
docker --version
aws --version
mysql --version

# Create log file for debugging
echo "EC2 setup completed at $(date)" > /var/log/ec2-setup.log
echo "Docker: $(docker --version)" >> /var/log/ec2-setup.log
echo "AWS CLI: $(aws --version)" >> /var/log/ec2-setup.log
echo "MySQL Client: $(mysql --version)" >> /var/log/ec2-setup.log
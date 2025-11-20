# Infrastructure

Terraform configuration for the BloodLine development environment.

## Resources Created

- **VPC**: `dev-bloodline-vpc` with public/private subnets
- **EC2**: `dev-bloodline-ec2` (Ubuntu 22.04) with SSM access
- **RDS**: `dev-bloodline-rds` (MySQL 8.0)

## Usage

1. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` with your values

3. Initialize and apply:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

## Access

- EC2: Use AWS Systems Manager Session Manager
- RDS: Connect from EC2 instance using the endpoint from outputs
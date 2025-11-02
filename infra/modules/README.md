# Terraform Modules

This directory contains modular Terraform configurations for the BloodLine application infrastructure.

## Module Structure

### 🌐 VPC Module (`vpc/`)
- **Purpose**: Creates VPC, subnets, internet gateway, and routing
- **Resources**: VPC, public/private subnets, IGW, route tables
- **Outputs**: VPC ID, subnet IDs

### 🔒 Security Groups Module (`security_groups/`)
- **Purpose**: Manages security groups for EC2 and RDS
- **Resources**: EC2 security group (ports 80, 443, 5000), RDS security group (port 3306)
- **Outputs**: Security group IDs

### 🗄️ RDS Module (`rds/`)
- **Purpose**: MySQL database with automated credentials management
- **Resources**: RDS instance, DB subnet group, Secrets Manager
- **Outputs**: RDS endpoint, port, secrets ARN

### 📦 S3 Module (`s3/`)
- **Purpose**: Static website hosting for React frontend
- **Resources**: S3 bucket, website configuration, public access policy
- **Outputs**: Bucket name, ARN, website endpoint

### 🐳 ECR Module (`ecr/`)
- **Purpose**: Container registry for backend Docker images
- **Resources**: ECR repository, lifecycle policy
- **Outputs**: Repository URL, ARN

### 🖥️ EC2 Module (`ec2/`)
- **Purpose**: Application server with Docker and AWS CLI
- **Resources**: EC2 instance, IAM role, Elastic IP, user data script
- **Outputs**: Instance ID, public IP

### 👤 IAM Module (`iam/`)
- **Purpose**: GitHub Actions deployment permissions
- **Resources**: IAM user, access keys, policies for S3/ECR/SSM
- **Outputs**: Access key ID, secret access key

## Usage

### Migration from Monolithic Structure
```bash
# Run the migration script
./migrate-to-modules.sh

# Verify the plan
terraform plan

# Apply if everything looks correct
terraform apply
```

### Fresh Deployment
```bash
# Initialize Terraform
terraform init

# Plan the deployment
terraform plan

# Apply the configuration
terraform apply
```

## Module Dependencies

```
vpc → security_groups → rds
vpc → ec2
s3 (independent)
ecr (independent)
ec2 + s3 + ecr → iam
```

## Benefits of Modular Structure

1. **Reusability**: Modules can be reused across environments
2. **Maintainability**: Easier to update specific services
3. **Testing**: Individual modules can be tested separately
4. **Collaboration**: Teams can work on different modules independently
5. **Versioning**: Modules can be versioned and shared

## Customization

Each module accepts variables for customization:
- Environment-specific settings
- Instance sizes and storage
- Security configurations
- Naming conventions

See individual module `variables.tf` files for available options.
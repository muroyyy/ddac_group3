#!/bin/bash

# Script to migrate Terraform state from monolithic to modular structure
# This moves existing resources to their new module paths

set -e

echo "🔄 Starting Terraform state migration to modular structure..."

# Backup the current state
echo "📦 Creating state backup..."
cp terraform.tfstate terraform.tfstate.backup-$(date +%Y%m%d-%H%M%S)

echo "🔧 Moving resources to module paths..."

# VPC Module
terraform state mv aws_vpc.main module.vpc.aws_vpc.main
terraform state mv aws_internet_gateway.main module.vpc.aws_internet_gateway.main
terraform state mv 'aws_subnet.public[0]' 'module.vpc.aws_subnet.public[0]'
terraform state mv 'aws_subnet.public[1]' 'module.vpc.aws_subnet.public[1]'
terraform state mv 'aws_subnet.private[0]' 'module.vpc.aws_subnet.private[0]'
terraform state mv 'aws_subnet.private[1]' 'module.vpc.aws_subnet.private[1]'
terraform state mv aws_route_table.public module.vpc.aws_route_table.public
terraform state mv 'aws_route_table_association.public[0]' 'module.vpc.aws_route_table_association.public[0]'
terraform state mv 'aws_route_table_association.public[1]' 'module.vpc.aws_route_table_association.public[1]'

# Security Groups Module
terraform state mv aws_security_group.ec2 module.security_groups.aws_security_group.ec2
terraform state mv aws_security_group.rds module.security_groups.aws_security_group.rds

# RDS Module
terraform state mv aws_db_subnet_group.main module.rds.aws_db_subnet_group.main
terraform state mv random_password.db_password module.rds.random_password.db_password
terraform state mv aws_db_instance.main module.rds.aws_db_instance.main
terraform state mv aws_secretsmanager_secret.db_credentials module.rds.aws_secretsmanager_secret.db_credentials
terraform state mv aws_secretsmanager_secret_version.db_credentials module.rds.aws_secretsmanager_secret_version.db_credentials

# S3 Module
terraform state mv random_id.bucket_suffix module.s3.random_id.bucket_suffix
terraform state mv aws_s3_bucket.frontend module.s3.aws_s3_bucket.frontend
terraform state mv aws_s3_bucket_website_configuration.frontend module.s3.aws_s3_bucket_website_configuration.frontend
terraform state mv aws_s3_bucket_public_access_block.frontend module.s3.aws_s3_bucket_public_access_block.frontend
terraform state mv aws_s3_bucket_policy.frontend module.s3.aws_s3_bucket_policy.frontend

# ECR Module
terraform state mv aws_ecr_repository.backend module.ecr.aws_ecr_repository.backend
terraform state mv aws_ecr_lifecycle_policy.backend module.ecr.aws_ecr_lifecycle_policy.backend

# EC2 Module
terraform state mv aws_iam_role.ec2_ssm_role module.ec2.aws_iam_role.ec2_ssm_role
terraform state mv aws_iam_role_policy_attachment.ec2_ssm_policy module.ec2.aws_iam_role_policy_attachment.ec2_ssm_policy
terraform state mv aws_iam_role_policy_attachment.ec2_ecr_policy module.ec2.aws_iam_role_policy_attachment.ec2_ecr_policy
terraform state mv aws_iam_role_policy.ec2_secrets_policy module.ec2.aws_iam_role_policy.ec2_secrets_policy
terraform state mv aws_iam_instance_profile.ec2_profile module.ec2.aws_iam_instance_profile.ec2_profile
terraform state mv aws_instance.main module.ec2.aws_instance.main
terraform state mv aws_eip.main module.ec2.aws_eip.main
terraform state mv aws_eip_association.main module.ec2.aws_eip_association.main

# IAM Module
terraform state mv aws_iam_user.github_actions module.iam.aws_iam_user.github_actions
terraform state mv aws_iam_access_key.github_actions module.iam.aws_iam_access_key.github_actions
terraform state mv aws_iam_policy.github_actions module.iam.aws_iam_policy.github_actions
terraform state mv aws_iam_user_policy_attachment.github_actions module.iam.aws_iam_user_policy_attachment.github_actions

echo "✅ State migration completed!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'terraform plan' to verify no changes are needed"
echo "2. If plan shows 0 changes, migration was successful"
echo "3. If there are issues, restore from backup: terraform.tfstate.backup-*"
echo ""
echo "🔍 Verifying migration..."
terraform plan
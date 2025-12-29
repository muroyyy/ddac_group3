terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {
  state = "available"
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  environment        = var.environment
  project_name       = var.project_name
  availability_zones = slice(data.aws_availability_zones.available.names, 0, 2)
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security_groups"

  environment  = var.environment
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  environment           = var.environment
  project_name          = var.project_name
  private_subnet_ids    = module.vpc.private_subnet_ids
  rds_security_group_id = module.security_groups.rds_security_group_id
  db_username           = var.db_username
}

# S3 Module
module "s3" {
  source = "./modules/s3"

  environment  = var.environment
  project_name = var.project_name
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"

  environment  = var.environment
  project_name = var.project_name
}

# EC2 Module
module "ec2" {
  source = "./modules/ec2"

  environment                = var.environment
  project_name               = var.project_name
  public_subnet_id           = module.vpc.public_subnet_ids[0]
  ec2_security_group_id      = module.security_groups.ec2_security_group_id
  secrets_manager_secret_arn = module.rds.secrets_manager_secret_arn
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  environment        = var.environment
  project_name       = var.project_name
  aws_region         = var.aws_region
  s3_bucket_arn      = module.s3.bucket_arn
  ecr_repository_arn = module.ecr.repository_arn
  ec2_instance_id    = module.ec2.instance_id
}

# Route53 Module
module "route53" {
  source = "./modules/route53"

  domain_name               = var.domain_name
  project_name              = var.project_name
  environment               = var.environment
  cloudfront_domain_name    = module.cloudfront.domain_name
  cloudfront_hosted_zone_id = module.cloudfront.hosted_zone_id
}

# ACM Certificate Module
module "acm" {
  source = "./modules/acm"

  domain_name    = var.domain_name
  project_name   = var.project_name
  environment    = var.environment
  hosted_zone_id = module.route53.hosted_zone_id
}

# CloudFront Module
module "cloudfront" {
  source = "./modules/cloudfront"

  domain_name         = var.domain_name
  project_name        = var.project_name
  environment         = var.environment
  s3_website_endpoint = module.s3.website_endpoint
  ec2_public_dns      = module.ec2.public_dns
  certificate_arn     = module.acm.certificate_arn
}

# SNS Module
module "sns" {
  source = "./modules/sns"

  environment  = var.environment
  project_name = var.project_name
}
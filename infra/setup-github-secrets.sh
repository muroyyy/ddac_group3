#!/bin/bash

# GitHub Secrets Setup Script
# Run this after terraform apply to set up GitHub repository secrets

REPO_OWNER_REPO="$1"  # Format: owner/repo

if [ -z "$REPO_OWNER_REPO" ]; then
    echo "Usage: $0 <owner/repo>"
    echo "Example: $0 username/ddac_group3"
    exit 1
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "Please authenticate with GitHub CLI first:"
    echo "gh auth login"
    exit 1
fi

echo "Setting up GitHub secrets for repository: $REPO_OWNER_REPO"

# Get values from terraform outputs
echo "📥 Retrieving values from Terraform outputs..."
AWS_ACCESS_KEY_ID=$(terraform output -raw github_actions_access_key_id)
AWS_SECRET_ACCESS_KEY=$(terraform output -raw github_actions_secret_access_key)
S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
ECR_REPOSITORY_NAME=$(terraform output -raw ecr_repository_url | cut -d'/' -f2)
EC2_INSTANCE_ID=$(terraform output -raw ec2_instance_id)
EC2_PUBLIC_IP=$(terraform output -raw ec2_public_ip)

# Set secrets
gh secret set AWS_ACCESS_KEY_ID --body "$AWS_ACCESS_KEY_ID" --repo "$REPO_OWNER_REPO"
gh secret set AWS_SECRET_ACCESS_KEY --body "$AWS_SECRET_ACCESS_KEY" --repo "$REPO_OWNER_REPO"
gh secret set S3_BUCKET_NAME --body "$S3_BUCKET_NAME" --repo "$REPO_OWNER_REPO"
gh secret set ECR_REPOSITORY_NAME --body "$ECR_REPOSITORY_NAME" --repo "$REPO_OWNER_REPO"
gh secret set EC2_INSTANCE_ID --body "$EC2_INSTANCE_ID" --repo "$REPO_OWNER_REPO"
gh secret set VITE_EC2_PUBLIC_IP --body "$EC2_PUBLIC_IP" --repo "$REPO_OWNER_REPO"

echo "✅ GitHub secrets have been set successfully!"
echo ""
echo "Secrets created:"
echo "- AWS_ACCESS_KEY_ID"
echo "- AWS_SECRET_ACCESS_KEY"
echo "- S3_BUCKET_NAME"
echo "- ECR_REPOSITORY_NAME"
echo "- EC2_INSTANCE_ID"
echo "- VITE_EC2_PUBLIC_IP"

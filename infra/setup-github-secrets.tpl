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

# Set secrets
gh secret set AWS_ACCESS_KEY_ID --body "${aws_access_key_id}" --repo "$REPO_OWNER_REPO"
gh secret set AWS_SECRET_ACCESS_KEY --body "${aws_secret_access_key}" --repo "$REPO_OWNER_REPO"
gh secret set S3_BUCKET_NAME --body "${s3_bucket_name}" --repo "$REPO_OWNER_REPO"
gh secret set ECR_REPOSITORY_NAME --body "${ecr_repository_name}" --repo "$REPO_OWNER_REPO"
gh secret set EC2_INSTANCE_ID --body "${ec2_instance_id}" --repo "$REPO_OWNER_REPO"
gh secret set VITE_EC2_PUBLIC_IP --body "${ec2_public_ip}" --repo "$REPO_OWNER_REPO"

echo "✅ GitHub secrets have been set successfully!"
echo ""
echo "Secrets created:"
echo "- AWS_ACCESS_KEY_ID"
echo "- AWS_SECRET_ACCESS_KEY"
echo "- S3_BUCKET_NAME"
echo "- ECR_REPOSITORY_NAME"
echo "- EC2_INSTANCE_ID"
echo "- VITE_EC2_PUBLIC_IP"
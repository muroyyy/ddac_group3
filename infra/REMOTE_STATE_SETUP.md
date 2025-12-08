# Remote State Backend Setup

This solves the issue where Terraform state isn't synchronized between different locations (home PC vs campus laptop).

## What This Fixes

- **State Drift**: When working from different locations, local state files don't match actual infrastructure
- **Team Collaboration**: Multiple developers can work on the same infrastructure
- **State Locking**: Prevents concurrent modifications that could corrupt state

## Migration Steps

### 1. One-Time Setup (Run from your home PC first)

```bash
cd infra/
./migrate-to-remote-state.sh
```

This will:
- Create S3 bucket for state storage
- Create DynamoDB table for state locking
- Migrate your existing state to remote backend

### 2. Working from Any Location

After migration, from any new location:

```bash
cd infra/
terraform init  # Downloads remote state
terraform plan  # Works with actual infrastructure state
```

## Backend Configuration

The remote backend is configured in `backend.tf`:
- **S3 Bucket**: `bloodline-terraform-state-bucket`
- **DynamoDB Table**: `bloodline-terraform-locks`
- **Region**: `ap-southeast-1`
- **Encryption**: Enabled

## Security Features

- State file encryption at rest
- Versioning enabled for state recovery
- Public access blocked
- State locking prevents concurrent modifications

## Troubleshooting

If you get "bucket doesn't exist" error:
```bash
# Remove backend temporarily
mv backend.tf backend.tf.bak
terraform init
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_locks
mv backend.tf.bak backend.tf
terraform init -migrate-state
```
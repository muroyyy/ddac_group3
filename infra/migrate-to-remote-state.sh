#!/bin/bash

echo "🚀 Migrating Terraform state to remote backend..."

# Step 1: Temporarily disable backend
echo "📦 Disabling backend configuration..."
mv backend.tf backend.tf.bak

# Step 2: Initialize without backend
echo "🔧 Initializing without backend..."
terraform init

# Step 3: Create state infrastructure
echo "📦 Creating S3 bucket and DynamoDB table..."
terraform apply -target=aws_s3_bucket.terraform_state -target=aws_s3_bucket_versioning.terraform_state -target=aws_s3_bucket_server_side_encryption_configuration.terraform_state -target=aws_s3_bucket_public_access_block.terraform_state -target=aws_dynamodb_table.terraform_locks -auto-approve

# Step 4: Re-enable backend
echo "🔄 Re-enabling backend configuration..."
mv backend.tf.bak backend.tf

# Step 5: Initialize with remote backend
echo "🔄 Migrating to remote backend..."
terraform init -migrate-state

# Step 6: Verify migration
echo "✅ Verifying state migration..."
terraform plan

echo "🎉 Migration complete! You can now work from anywhere."
echo "💡 You can now safely delete local state files: terraform.tfstate and terraform.tfstate.backup"
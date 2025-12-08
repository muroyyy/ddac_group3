# Remote State Backend Configuration
terraform {
  backend "s3" {
    bucket         = "bloodline-terraform-state-bucket"
    key            = "terraform/state/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "bloodline-terraform-locks"
    encrypt        = true
  }
}
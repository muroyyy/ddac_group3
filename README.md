# BloodLine - Blood Donation Management System

A cloud-native blood donation management platform built with React, .NET Core, and AWS services.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: .NET Core 8.0 Web API
- **Database**: MySQL RDS
- **Infrastructure**: AWS (CloudFront, EC2, S3, RDS, Route53, ACM)
- **IaC**: Terraform
- **CI/CD**: GitHub Actions

## Project Structure

```
ddac_group3/
├── frontend/          # React frontend application
├── backend/           # .NET Core API
├── infra/             # Terraform infrastructure code
└── .github/workflows/ # CI/CD pipelines
```

## Features

- **Multi-role Authentication**: Admin, Donor, Patient, Hospital
- **Session Management**: 2-hour sessions with auto-expiry
- **Blood Request System**: Patients can request blood, donors can respond
- **Inventory Management**: Real-time blood inventory tracking
- **User Verification**: Document-based verification for donors and patients
- **Audit Logging**: Complete activity tracking
- **Secure Password Reset**: Time-limited tokens (15 minutes)

## Security

- BCrypt password hashing (strength 12)
- Session-based authentication
- HTTPS-only in production via CloudFront
- AWS Secrets Manager for credentials
- IAM roles for EC2 access control

## AWS Services Used

- **CloudFront**: CDN and HTTPS termination
- **EC2**: Backend API hosting
- **RDS MySQL**: Database
- **S3**: Frontend hosting and file storage
- **Route53**: DNS management
- **ACM**: SSL/TLS certificates
- **Secrets Manager**: Credential storage
- **ECR**: Docker image registry
- **Systems Manager**: EC2 remote access

## Deployment

### Prerequisites
- AWS Account
- Terraform >= 1.0
- Node.js >= 18
- .NET Core SDK 8.0
- Docker

### Infrastructure Setup
```bash
cd infra
terraform init
terraform apply
```

### Frontend Deployment
Automated via GitHub Actions on push to `dev` branch.

### Backend Deployment
Automated via GitHub Actions on push to `dev` branch.

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
dotnet restore
dotnet run
```

## Environment Variables

### Frontend
- `VITE_API_URL`: API base URL

### Backend
- `AWS_DEFAULT_REGION`: AWS region (default: ap-southeast-1)
- `ASPNETCORE_ENVIRONMENT`: Environment (Production/Development)

## Domain

Production: https://bloodline.dev

## Cost Optimization

- Removed Elastic IP (saves $3.60/month)
- CloudFront PriceClass_100 (US, Canada, Europe only)
- RDS db.t3.micro instance
- EC2 t2.micro instance

## License

Private project for educational purposes.

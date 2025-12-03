# Cloud-Based Blood Bank Management System

A cloud-hosted web application connecting donors, patients, and hospitals for real-time blood availability management. Developed for the CT071-3-3 Designing and Developing Cloud Applications (DDAC) module at Asia Pacific University (APU).

## Project Overview

This system addresses blood shortages by creating a digital platform for efficient blood supply matching and tracking through cloud-based infrastructure.

## User Roles

- **Donor**: Register, update profile, donate blood, view donation history
- **Patient**: Register, request blood by type and urgency, track request status
- **Hospital**: Manage inventory, approve requests, generate reports
- **Admin**: Manage user permissions, monitor system performance

## Tech Stack

- **Frontend**: ReactJS + Tailwind CSS
- **Backend**: ASP.NET (C#)
- **Database**: Amazon RDS (MySQL)
- **Storage**: Amazon S3
- **CDN**: Amazon CloudFront
- **DNS**: Amazon Route53
- **Security**: AWS IAM, SSL/TLS certificates
- **CI/CD**: GitHub Actions
- **Hosting**: Amazon EC2

## Architecture

- Frontend hosted on S3 with CloudFront distribution
- Backend API running on EC2 in Docker containers
- MySQL database on Amazon RDS
- Custom domain with SSL certificate
- Automated deployment via GitHub Actions

## Repository Structure

```
ddac_group3/
├── frontend/          # ReactJS application
├── backend/           # ASP.NET API
├── infra/             # Terraform infrastructure
├── .github/workflows/ # CI/CD pipelines
└── README.md
```

## Deployment

- **Live URL**: https://bloodline.dev
- **Backend API**: https://bloodline.dev/api
- **Database**: Amazon RDS MySQL
- **Infrastructure**: Managed via Terraform

## Development Setup

1. Clone repository
2. Install dependencies: `npm install` (frontend), `dotnet restore` (backend)
3. Configure environment variables
4. Run locally: `npm run dev` (frontend), `dotnet run` (backend)

## Contributors

| Name | Role |
|------|------|
| Amirul Faiz | Admin |
| Sahi Khan | Donor |
| Sharveen Kaur Sidhu | Patient |
| Wong Yi Ren | Hospital Staff |
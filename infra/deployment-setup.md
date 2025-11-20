# Deployment Setup

## .NET Backend Deployment Options on EC2

### Option 1: Systemd Service (Recommended)
Run as a Linux service with automatic restart:

```bash
# On EC2 instance
sudo useradd -r -s /bin/false bloodline
sudo mkdir -p /opt/bloodline/app
sudo chown bloodline:bloodline /opt/bloodline/app

# Create systemd service file
sudo tee /etc/systemd/system/bloodline-api.service > /dev/null <<EOF
[Unit]
Description=BloodLine API
After=network.target

[Service]
Type=notify
User=bloodline
WorkingDirectory=/opt/bloodline/app
ExecStart=/usr/bin/dotnet BloodLine.dll
Restart=always
RestartSec=10
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:5000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
```

### Option 2: Docker (Alternative)
```bash
# Install Docker on EC2
sudo apt update && sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Create Dockerfile in backend/
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY publish/ .
EXPOSE 5000
ENTRYPOINT ["dotnet", "BloodLine.dll"]
```

### Option 3: Direct dotnet run
```bash
# Simple but not production-ready
cd /opt/bloodline/app
nohup dotnet BloodLine.dll &
```

## GitHub Secrets

### Automatic Setup (Recommended)
After `terraform apply`, run the generated script:
```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Run the generated script
./setup-github-secrets.sh username/ddac_group3
```

### Manual Setup
Alternatively, add these secrets manually in GitHub repository settings:
- `AWS_ACCESS_KEY_ID` (from terraform output)
- `AWS_SECRET_ACCESS_KEY` (from terraform output)
- `S3_BUCKET_NAME` (from terraform output)
- `DEPLOYMENT_BUCKET` (from terraform output)
- `EC2_INSTANCE_ID` (from terraform output)

## EC2 Prerequisites

Install on EC2 instance:
```bash
sudo apt update
sudo apt install -y dotnet-runtime-8.0 awscli
```
#!/bin/bash

# Setup Nginx with SSL for api.bloodline.dev
# This script should be run on the EC2 instance

set -e  # Exit on error

echo "🔧 Starting Nginx setup for api.bloodline.dev..."

# Update package list
echo "📦 Updating package list..."
sudo apt-get update

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt-get install -y nginx

# Install Certbot for Let's Encrypt
echo "📦 Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Create directory for certbot challenges
sudo mkdir -p /var/www/certbot

# Copy Nginx configuration
echo "📄 Setting up Nginx configuration..."
sudo cp /home/ubuntu/backend/nginx/api.bloodline.dev.conf /etc/nginx/sites-available/api.bloodline.dev

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "🗑️  Removing default Nginx site..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# Create symlink to enable site
echo "🔗 Enabling site..."
sudo ln -sf /etc/nginx/sites-available/api.bloodline.dev /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "✅ Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
sudo systemctl restart nginx

# Enable Nginx to start on boot
echo "🚀 Enabling Nginx on boot..."
sudo systemctl enable nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
sudo certbot --nginx -d api.bloodline.dev --non-interactive --agree-tos --email admin@bloodline.dev

# Setup auto-renewal
echo "⏰ Setting up certificate auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "✅ Nginx setup complete!"
echo "🌐 Your API is now available at https://api.bloodline.dev"

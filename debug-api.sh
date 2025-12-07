#!/bin/bash

echo "🔍 BloodLine API Debugging Script"
echo "=================================="

# Get EC2 public IP (you'll need to replace this with your actual IP)
EC2_IP="18.142.248.14"  # Replace with your actual EC2 public IP
API_BASE="http://$EC2_IP:5000"

echo "📍 Target: $API_BASE"
echo ""

echo "1️⃣ CHECKING DOCKER CONTAINERS"
echo "------------------------------"
echo "Running containers:"
sudo docker ps

echo ""
echo "All containers (including stopped):"
sudo docker ps -a

echo ""
echo "2️⃣ CHECKING PORT MAPPING"
echo "-------------------------"
echo "Docker port mappings:"
sudo docker port $(sudo docker ps -q --filter "name=bloodline-api") 2>/dev/null || echo "❌ No bloodline-api container found"

echo ""
echo "3️⃣ CHECKING NETWORK CONNECTIVITY"
echo "---------------------------------"
echo "Testing port 5000 connectivity:"
ss -tlnp | grep :5000 || echo "❌ Port 5000 not listening"

echo ""
echo "4️⃣ TESTING API ENDPOINTS"
echo "-------------------------"
echo "Testing health endpoint:"
curl -v -m 10 "$API_BASE/api/health" 2>&1 | head -20

echo ""
echo "Testing patient endpoint (should return 404 for GET):"
curl -v -m 10 "$API_BASE/api/patient" 2>&1 | head -10

echo ""
echo "5️⃣ CHECKING CONTAINER LOGS"
echo "---------------------------"
echo "Recent container logs:"
sudo docker logs --tail 50 bloodline-api 2>/dev/null || echo "❌ Cannot read bloodline-api logs"

echo ""
echo "6️⃣ TESTING FROM INSIDE CONTAINER"
echo "---------------------------------"
echo "Testing localhost from inside container:"
sudo docker exec bloodline-api curl -s http://localhost:8080/api/health 2>/dev/null || echo "❌ Cannot test inside container"

echo ""
echo "7️⃣ CHECKING DOCKERFILE CONFIGURATION"
echo "------------------------------------"
echo "Container environment variables:"
sudo docker exec bloodline-api env | grep -E "(ASPNETCORE|PORT)" 2>/dev/null || echo "❌ Cannot read container env"

echo ""
echo "8️⃣ TESTING SPECIFIC PATIENT ENDPOINT"
echo "------------------------------------"
echo "Testing POST to patient endpoint (with sample data):"
curl -X POST "$API_BASE/api/patient/blood-request/1" \
  -H "Content-Type: application/json" \
  -d '{
    "bloodType": "A+",
    "unitsRequired": 2,
    "urgencyLevel": "High",
    "hospitalId": 1,
    "notes": "Test request"
  }' \
  -v -m 10 2>&1 | head -20

echo ""
echo "9️⃣ SECURITY GROUP CHECK"
echo "-----------------------"
echo "Checking if port 5000 is accessible from outside:"
timeout 5 nc -zv $EC2_IP 5000 2>&1 || echo "❌ Port 5000 not accessible from outside"

echo ""
echo "🔟 FIREWALL CHECK"
echo "-----------------"
echo "Checking local firewall rules:"
sudo iptables -L INPUT | grep 5000 || echo "ℹ️ No specific iptables rules for port 5000"

echo ""
echo "📋 SUMMARY & NEXT STEPS"
echo "========================"
echo "1. If container is not running: Check deployment logs"
echo "2. If port mapping is wrong: Fix docker run command"
echo "3. If health endpoint fails: Check container startup"
echo "4. If patient endpoint returns 404: Check controller registration"
echo "5. If CORS errors: Check Program.cs CORS configuration"
echo "6. If security group blocks: Open port 5000 in AWS console"
echo ""
echo "🚀 Quick fixes to try:"
echo "- Restart container: sudo docker restart bloodline-api"
echo "- Check AWS Security Group: Allow inbound port 5000"
echo "- Verify CORS origins include your S3/CloudFront domain"
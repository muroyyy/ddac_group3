@echo off
echo 🔍 BloodLine API Local Debug
echo ============================

REM Replace with your actual EC2 public IP
set EC2_IP=18.142.248.14
set API_BASE=http://%EC2_IP%:5000

echo 📍 Target: %API_BASE%
echo.

echo 1️⃣ TESTING HEALTH ENDPOINT
echo ---------------------------
curl -v -m 10 "%API_BASE%/api/health"
echo.

echo 2️⃣ TESTING PATIENT ENDPOINT
echo ----------------------------
curl -X POST "%API_BASE%/api/patient/blood-request/1" ^
  -H "Content-Type: application/json" ^
  -d "{\"bloodType\":\"A+\",\"unitsRequired\":2,\"urgencyLevel\":\"High\",\"hospitalId\":1,\"notes\":\"Test\"}" ^
  -v -m 10
echo.

echo 3️⃣ TESTING PORT CONNECTIVITY
echo -----------------------------
telnet %EC2_IP% 5000
echo.

echo 📋 If all tests fail, check:
echo - AWS Security Group allows port 5000
echo - EC2 instance is running
echo - Docker container is running
echo - Backend deployment succeeded
# Backend 500 Error Debugging

## Test the Backend Directly

**1. Test Health Endpoint:**
```bash
curl http://18.142.248.14:5000/api/health
```
Should return: `{"status":"healthy",...}`

**2. Test Patient Endpoint (Simple GET):**
```bash
curl http://18.142.248.14:5000/api/patient
```
Should return: 404 or method not allowed (not 500)

**3. Test Patient POST with Sample Data:**
```bash
curl -X POST http://18.142.248.14:5000/api/patient/blood-request/15 \
  -H "Content-Type: application/json" \
  -d '{
    "bloodType": "A+",
    "unitsRequired": 2,
    "urgencyLevel": "High", 
    "hospitalId": 1,
    "notes": "Test request"
  }'
```

## Possible Causes of 500 Error:

1. **Backend deployment not complete** - Still running old code
2. **Database connection issue** - Can't connect to MySQL
3. **Missing database table** - `blood_requests` table doesn't exist
4. **Field mismatch** - Frontend sending wrong field names
5. **User doesn't exist** - UserId 15 not found in database

## Check Backend Logs:
If you have access to EC2:
```bash
sudo docker logs bloodline-api --tail 50
```

## Quick Fix - Check Field Names:
The frontend might be sending wrong field names. Backend expects:
- `bloodType` ✓
- `unitsRequired` ✓  
- `urgencyLevel` ✓
- `hospitalId` ✓
- `notes` ✓

## Most Likely Issue:
Backend deployment hasn't completed with the latest PatientController fixes.
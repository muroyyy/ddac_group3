# 🚨 BloodLine API Issues Found

## Critical Issues Identified:

### 1. **Port Configuration Mismatch**
- **Dockerfile**: `EXPOSE 5000` 
- **Docker Run**: Maps `5000:8080` (from deployment script)
- **Problem**: Container listens on port 8080 internally, but Dockerfile exposes 5000

### 2. **Missing Port Configuration in Program.cs**
- **Issue**: No explicit port binding in Program.cs
- **Result**: ASP.NET Core defaults to port 8080 in container
- **Fix Needed**: Add `builder.WebHost.UseUrls("http://*:8080");`

### 3. **HTTPS Redirect in Production**
- **Issue**: `app.UseHttpsRedirection();` forces HTTPS
- **Problem**: Your API uses HTTP (port 5000), but app redirects to HTTPS
- **Fix**: Disable HTTPS redirect for API-only deployment

### 4. **CORS Configuration**
- **Current**: Only allows specific domains
- **Missing**: Your S3 website domain might not be in the list
- **Check**: Verify your S3 website URL is in CORS origins

## 🔧 Quick Fixes:

### Fix 1: Update Program.cs
```csharp
// Add this after var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://*:8080");

// Comment out HTTPS redirect
// app.UseHttpsRedirection();
```

### Fix 2: Update Dockerfile
```dockerfile
# Change from EXPOSE 5000 to:
EXPOSE 8080
```

### Fix 3: Verify Docker Command
```bash
# Should be (from deployment script):
docker run -d --name bloodline-api --restart unless-stopped -p 5000:8080 ...
```

## 🧪 Testing Commands:

### Test Health Endpoint:
```bash
curl http://18.142.248.14:5000/api/health
```

### Test Patient Endpoint:
```bash
curl -X POST http://18.142.248.14:5000/api/patient/blood-request/1 \
  -H "Content-Type: application/json" \
  -d '{"bloodType":"A+","unitsRequired":2,"urgencyLevel":"High","hospitalId":1,"notes":"Test"}'
```

### Check Container Status:
```bash
sudo docker ps
sudo docker logs bloodline-api
```

## 🎯 Root Cause:
The container is likely running but listening on the wrong port internally, causing the 404 errors.
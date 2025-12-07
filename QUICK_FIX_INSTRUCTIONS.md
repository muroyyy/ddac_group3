# Quick Fix for Patient Blood Request

## Problem
Patient API can't find user ID in session because it's using the wrong session system.

## Immediate Browser Fix (No Deployment Needed)

1. **Open browser console** (F12)
2. **Paste this code** to fix the API temporarily:

```javascript
// Override the patient API to use AuthContext data
if (window.patientAPI) {
  const originalCreateBloodRequest = window.patientAPI.createBloodRequest;
  window.patientAPI.createBloodRequest = async function(data) {
    // Get user from localStorage (AuthContext format)
    const session = localStorage.getItem('bloodline_session');
    if (!session) {
      throw new Error('Please log in first');
    }
    
    const parsed = JSON.parse(session);
    const userId = parsed.user?.id || parsed.id;
    
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    
    // Call API with userId
    const response = await fetch(`http://18.142.248.14:5000/api/patient/blood-request/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    return response.json();
  };
}
```

3. **Try submitting blood request** - should work now

## Permanent Fix Status
- ✅ Code fixed in repository
- ⏳ Waiting for GitHub Actions deployment
- 🔄 Alternative: Manual deployment needed

## Check Deployment Status
1. Go to GitHub repository
2. Click "Actions" tab
3. Look for "Deploy Frontend to S3" workflow
4. If not there, GitHub Actions might be disabled

## Manual Deployment Alternative
If GitHub Actions isn't working, you can:
1. Build locally: `npm run build` in frontend folder
2. Upload dist/ folder to S3 manually
3. Invalidate CloudFront cache
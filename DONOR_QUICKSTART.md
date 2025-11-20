# 🩸 Donor Module - Quick Start Guide

## 🚀 Setup Instructions

### 1. Database Setup
Run the migration to create donor tables:
```bash
mysql -h <your-rds-endpoint> -u <username> -p <database-name> < backend/migrations/001_create_donor_tables.sql
```

### 2. Start Backend
```bash
cd backend
dotnet run
```
Backend will run on: `http://localhost:5000`

### 3. Start Frontend
```bash
cd frontend
npm install  # if first time
npm run dev
```
Frontend will run on: `http://localhost:5173`

## 🔐 Demo Account

**Email**: `donor@demo.com`  
**Password**: `password123`

## 📋 Donor Features

### ✅ Implemented Features:
1. **Register & Profile Management**
   - Set blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)
   - Set location
   - Toggle availability status

2. **Login System**
   - Secure authentication
   - Role-based routing

3. **Donation Requests**
   - Submit request to donate blood
   - Specify blood type and units
   - Add optional notes
   - Track request status (Pending/Approved/Rejected)

4. **Donation History**
   - View completed donations
   - See hospital names and dates
   - Track total contributions

5. **Dashboard**
   - Total donations count
   - Pending requests count
   - Blood type display
   - Last donation date
   - Quick action buttons

### 🔮 Future Enhancements:
- Urgent blood alerts via AWS SNS
- Hospital matching algorithm
- Appointment scheduling
- Donation reminders

## 🎯 User Flow

1. Login with demo account
2. Complete profile (blood type + location)
3. Submit donation request
4. Wait for hospital approval
5. View history and track contributions

## 🛠️ API Endpoints (All Local)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donor/profile/{userId}` | Get donor profile |
| PUT | `/api/donor/profile/{userId}` | Update profile |
| POST | `/api/donor/donation-request?userId={userId}` | Create donation request |
| GET | `/api/donor/donation-requests/{userId}` | Get pending requests |
| GET | `/api/donor/donation-history/{userId}` | Get donation history |
| GET | `/api/donor/dashboard-stats/{userId}` | Get dashboard stats |

## 📁 File Structure

```
backend/
├── Controllers/DonorController.cs
├── Models/DonorModels.cs
└── migrations/001_create_donor_tables.sql

frontend/
└── src/
    └── modules/
        └── donor/
            ├── pages/
            │   ├── DonorDashboard.tsx
            │   ├── DonateBloodForm.tsx
            │   ├── DonationHistory.tsx
            │   └── DonorProfile.tsx
            └── services/
                └── donorAPI.ts
```

## 🧪 Testing Checklist

- [ ] Login with demo account
- [ ] View dashboard stats
- [ ] Update profile (blood type, location)
- [ ] Submit donation request
- [ ] View pending requests
- [ ] Check donation history
- [ ] Toggle availability status
- [ ] Logout and login again

## 💡 Tips

- Complete your profile before submitting donation requests
- You can donate every 3 months
- Keep your availability status updated
- Check pending requests regularly

## 🐛 Troubleshooting

**Backend not starting?**
- Check if port 5000 is available
- Verify database connection in appsettings.json

**Frontend not connecting?**
- Ensure backend is running on port 5000
- Check browser console for errors
- Verify API_BASE_URL in apiClient.ts

**Demo account not working?**
- Run the migration SQL file
- Check if user exists in database
- Verify password hash is correct

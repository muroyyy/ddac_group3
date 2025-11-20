# Donor Module Setup Guide

## Demo Account Credentials
- **Email**: `donor@demo.com`
- **Password**: `password123`

## Database Setup

Run the migration file to create donor tables:

```bash
mysql -h <your-rds-endpoint> -u <username> -p <database-name> < backend/migrations/001_create_donor_tables.sql
```

Or connect to your RDS instance and run the SQL manually.

## API Endpoints (Local: http://localhost:5000/api)

### Donor Profile
- `GET /donor/profile/{userId}` - Get donor profile
- `PUT /donor/profile/{userId}` - Update donor profile

### Donation Requests
- `POST /donor/donation-request?userId={userId}` - Create donation request
- `GET /donor/donation-requests/{userId}` - Get all donation requests

### Donation History
- `GET /donor/donation-history/{userId}` - Get donation history

### Dashboard
- `GET /donor/dashboard-stats/{userId}` - Get dashboard statistics

## Frontend Routes

- `/donor/dashboard` - Donor dashboard with stats
- `/donor/donate` - Submit blood donation request
- `/donor/history` - View donation history and pending requests
- `/donor/profile` - Update profile (blood type, location, availability)

## Features Implemented

1. ✅ Register and create profile (blood type / location)
2. ✅ Login with demo account
3. ✅ Send blood donation request to hospital
4. ✅ View donation history/contribution record
5. ⚠️ Receive alerts (requires SNS integration - future enhancement)

## Testing

1. Start backend: `cd backend && dotnet run`
2. Start frontend: `cd frontend && npm run dev`
3. Login with demo credentials
4. Navigate to donor dashboard
5. Complete profile with blood type and location
6. Submit donation requests
7. View history

## Notes

- All API endpoints use local URLs (localhost:5000)
- Demo account is auto-seeded on application start
- Blood type options: A+, A-, B+, B-, AB+, AB-, O+, O-

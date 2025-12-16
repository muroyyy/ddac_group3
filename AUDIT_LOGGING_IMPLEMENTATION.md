# Audit Logging System Implementation

## Overview
Comprehensive audit logging system that tracks all critical security and operational activities in the BloodLine blood bank management system.

## What System Administrators Should Monitor

### 🔐 Security & Access Control
- **Login/Logout Events** - Track who accessed the system and when
- **Failed Login Attempts** - Identify potential security threats or brute force attacks
- **Password Changes** - Monitor password reset activities
- **Role/Permission Changes** - Track modifications to user roles or access levels
- **Account Status Changes** - Monitor user suspensions/activations

### 🩸 Critical Operations
- **Blood Inventory Changes** - Track stock additions, removals, or adjustments
- **Blood Request Approvals/Rejections** - Monitor hospital staff decisions
- **Donation Request Status Changes** - Track donor request lifecycle
- **Emergency Alerts** - Log critical/urgent blood requests
- **Data Exports** - Track who downloaded sensitive reports

### 👥 User Management
- **New User Registrations** - Monitor new donor, patient, hospital, admin accounts
- **Profile Updates** - Track changes to user information
- **Account Deletions** - Log user removal from system

### 📊 Compliance & Reporting
- **Report Generation** - Track who accessed analytics or inventory reports
- **Configuration Changes** - Monitor system settings modifications
- **API Access** - Log external integrations or unusual API calls

---

## Implementation Details

### Backend Components

#### 1. **AnalyticsLog Model** (`backend/Models/AnalyticsLog.cs`)
Maps to the `analytics_log` database table:
```csharp
- log_id (int, PK, auto_increment)
- action_type (varchar(100), NOT NULL)
- performed_by (int, FK -> users.user_id)
- timestamp (datetime, DEFAULT CURRENT_TIMESTAMP)
```

#### 2. **AuditLogService** (`backend/Services/AuditLogService.cs`)
Centralized service for logging activities:
```csharp
public interface IAuditLogService
{
    Task LogAsync(string actionType, int? userId = null);
}
```
- Silent fail design - doesn't break app if logging fails
- Registered as scoped service in DI container

#### 3. **AuditController** (`backend/Controllers/AuditController.cs`)
API endpoints for audit log management:

**GET /api/audit/logs**
- Query parameters: `actionType`, `userId`, `startDate`, `endDate`, `page`, `pageSize`
- Returns paginated audit logs with user details
- Supports filtering by action type, user, and date range

**GET /api/audit/action-types**
- Returns distinct list of all action types in the system
- Used for filter dropdown in frontend

**GET /api/audit/export**
- Exports filtered audit logs as CSV file
- Same filter parameters as `/logs` endpoint
- Generates timestamped CSV file

#### 4. **Integration Points**
Audit logging integrated into:

**AuthController:**
- User Login (success)
- Failed Login Attempts
- New User Registration
- Password Reset Requested
- Password Reset Completed

**AdminController:**
- User Profile Updated
- User Status Changed (Active/Suspended)
- Admin Profile Updated
- Admin Password Changed

---

### Frontend Components

#### **Audit Logs Page** (`frontend/src/modules/admin/pages/AuditLogs.tsx`)

**Features:**
- Real-time audit log display with pagination (50 logs per page)
- Search functionality (by action type or user name)
- Advanced filters:
  - Action Type dropdown (populated from backend)
  - Date range filter (start date, end date)
- Color-coded severity indicators:
  - 🔴 Red: Delete, Suspend actions
  - 🟡 Yellow: Update, Change actions
  - 🔵 Blue: Login, View actions
  - 🟢 Green: Create, Add actions
- CSV export with current filters applied
- Auto-refresh capability
- Responsive table design

**Display Information:**
- Log ID
- Action Type (with severity badge)
- Performed By (user name + email)
- User Role
- Timestamp (formatted)

---

## Currently Logged Actions

### Authentication Events
- `User Login: {Role}` - Successful login
- `Failed Login Attempt: {Email}` - Failed login
- `New User Registration: {Role}` - New account created
- `Password Reset Requested` - User requested password reset
- `Password Reset Completed` - Password successfully reset

### User Management Events
- `User Updated: {UserName}` - Admin updated user profile
- `User Status Changed: {UserName} to {Status}` - Admin changed user status
- `Admin Profile Updated` - Admin updated their own profile
- `Admin Password Changed` - Admin changed their own password

---

## Future Enhancements (Recommended)

### Additional Events to Log:
1. **Blood Inventory:**
   - Blood Stock Added
   - Blood Stock Removed
   - Blood Stock Adjusted
   - Low Stock Alert Triggered

2. **Blood Requests:**
   - Blood Request Created
   - Blood Request Approved
   - Blood Request Rejected
   - Blood Request Fulfilled
   - Emergency Blood Request

3. **Donation Management:**
   - Donation Request Created
   - Donation Request Accepted
   - Donation Request Rejected
   - Donation Completed

4. **System Events:**
   - Report Generated
   - Data Export
   - Configuration Changed
   - System Alert Sent

### AWS CloudTrail Integration (Phase 2):
- Track AWS infrastructure events
- S3 bucket access logs
- RDS database access
- Cognito authentication events
- Lambda function invocations

---

## Usage Instructions

### For System Administrators:

1. **Access Audit Logs:**
   - Navigate to Admin Dashboard → Audit Logs

2. **Search for Specific Events:**
   - Use search bar to find actions by keyword or user name
   - Filter by action type using dropdown
   - Set date range to narrow results

3. **Export Audit Reports:**
   - Apply desired filters
   - Click "Export CSV" button
   - File downloads with timestamp: `audit_logs_YYYYMMDD_HHMMSS.csv`

4. **Monitor Security:**
   - Watch for multiple failed login attempts
   - Review password reset requests
   - Check for unauthorized status changes
   - Monitor after-hours activity

5. **Compliance Reporting:**
   - Export logs for specific date ranges
   - Filter by action type for compliance audits
   - Track user management activities

---

## Database Schema

The `analytics_log` table is already created in your database:

```sql
CREATE TABLE analytics_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(100) NOT NULL,
    performed_by INT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_action_type (action_type),
    INDEX idx_performed_by (performed_by),
    INDEX idx_timestamp (timestamp)
);
```

---

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit/logs` | GET | Fetch paginated audit logs with filters |
| `/api/audit/action-types` | GET | Get list of all action types |
| `/api/audit/export` | GET | Export audit logs as CSV |

---

## Testing the Implementation

1. **Login/Logout:**
   - Log in as admin → Check audit log for "User Login: Admin"
   - Try wrong password → Check for "Failed Login Attempt"

2. **User Management:**
   - Update a user → Check for "User Updated: {Name}"
   - Suspend a user → Check for "User Status Changed"

3. **Profile Changes:**
   - Update admin profile → Check for "Admin Profile Updated"
   - Change password → Check for "Admin Password Changed"

4. **Filtering:**
   - Filter by action type
   - Filter by date range
   - Search by user name

5. **Export:**
   - Apply filters and export CSV
   - Verify CSV contains correct data

---

## Security Considerations

1. **Audit Log Integrity:**
   - Logs cannot be modified or deleted through the application
   - Only INSERT operations allowed
   - Database-level constraints protect data integrity

2. **Access Control:**
   - Only Admin role can access audit logs
   - Protected routes in frontend
   - Backend validation required

3. **Data Retention:**
   - Consider implementing log rotation policy
   - Archive old logs to S3 for long-term storage
   - Implement retention policy (e.g., 90 days active, 7 years archived)

4. **Performance:**
   - Indexed columns for fast queries
   - Pagination prevents large data loads
   - Async logging doesn't block main operations

---

## Deployment Notes

After deploying this update:

1. **Backend:** Docker container will automatically pull latest image
2. **Frontend:** S3 bucket will be updated via GitHub Actions
3. **Database:** No schema changes needed (table already exists)
4. **Testing:** Verify audit logs appear after login/user actions

---

## Support & Maintenance

For issues or questions:
- Check CloudWatch logs for backend errors
- Verify database connectivity
- Ensure IAuditLogService is registered in Program.cs
- Confirm analytics_log table exists and has proper indexes

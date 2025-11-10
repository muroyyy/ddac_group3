# BloodLine Database Schema Reference

## Database: `bloodline`

### Core Tables

#### 1. users
Primary user authentication and basic info
```sql
user_id (int, PK, auto_increment)
full_name (varchar(100), NOT NULL)
email (varchar(100), NOT NULL, UNIQUE)
password_hash (varchar(255), NOT NULL)
phone (varchar(15), NULL)
role (enum: 'Donor','Patient','Hospital','Admin', NOT NULL)
created_at (datetime, DEFAULT CURRENT_TIMESTAMP)
status (enum: 'Active','Suspended', DEFAULT 'Active')
```

#### 2. donor_profile
Extended profile for donors (linked to users via user_id)
```sql
donor_id (int, PK, auto_increment)
user_id (int, NOT NULL, UNIQUE FK -> users.user_id)
blood_type (varchar(5), NOT NULL)
location (varchar(100), NULL)
total_donations (int, DEFAULT 0)
```

#### 3. patient_profile
Extended profile for patients (linked to users via user_id)
```sql
patient_id (int, PK, auto_increment)
user_id (int, NOT NULL, UNIQUE FK -> users.user_id)
blood_type_needed (varchar(5), NOT NULL)
condition_description (varchar(255), NULL)
urgency_level (enum: 'Low','Medium','High','Critical', NOT NULL)
```

#### 4. hospital
Hospital information (linked to users via user_id)
```sql
hospital_id (int, PK, auto_increment)
user_id (int, NOT NULL, UNIQUE FK -> users.user_id)
hospital_name (varchar(150), NOT NULL)
address (varchar(255), NOT NULL)
contact_person (varchar(100), NULL)
contact_number (varchar(15), NULL)
```

### Request & Donation Tables

#### 5. blood_requests
Patient blood requests
```sql
request_id (int, PK, auto_increment)
patient_id (int, NOT NULL, FK -> patient_profile.patient_id)
hospital_id (int, NOT NULL, FK -> hospital.hospital_id)
blood_type (varchar(5), NOT NULL)
units_required (int, NOT NULL)
status (enum: 'Pending','Approved','Rejected','Fulfilled', DEFAULT 'Pending')
urgency_level (enum: 'Low','Medium','High','Critical', NOT NULL)
created_at (datetime, DEFAULT CURRENT_TIMESTAMP)
```

#### 6. donation_requests
Donor donation requests
```sql
donation_id (int, PK, auto_increment)
donor_id (int, NOT NULL, FK -> donor_profile.donor_id)
hospital_id (int, NOT NULL, FK -> hospital.hospital_id)
status (enum: 'Pending','Accepted','Rejected','Completed', DEFAULT 'Pending')
requested_date (datetime, DEFAULT CURRENT_TIMESTAMP)
donation_date (datetime, NULL)
```

#### 7. active_blood_requests
Denormalized view of active requests
```sql
request_id (int, NOT NULL)
patient_name (varchar(100), NOT NULL)
patient_email (varchar(100), NOT NULL)
blood_type (varchar(5), NOT NULL)
units_required (int, NOT NULL)
urgency_level (enum: 'Low','Medium','High','Critical', NOT NULL)
status (enum: 'Pending','Approved','Rejected','Fulfilled', DEFAULT 'Pending')
hospital_name (varchar(150), NOT NULL)
created_at (datetime, DEFAULT CURRENT_TIMESTAMP)
```

### Inventory & Analytics

#### 8. blood_inventory_summary
Hospital blood inventory summary
```sql
hospital_name (varchar(150), NOT NULL)
blood_type (varchar(5), NOT NULL)
quantity_units (int, NOT NULL, DEFAULT 0)
last_updated (datetime, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
stock_status (varchar(10), NOT NULL)
```

#### 9. donor_contribution_summary
Donor statistics summary
```sql
full_name (varchar(100), NOT NULL)
email (varchar(100), NOT NULL)
blood_type (varchar(5), NOT NULL)
location (varchar(100), NULL)
total_donations (int, DEFAULT 0)
pending_requests (bigint, NOT NULL, DEFAULT 0)
last_donation_date (datetime, NULL)
```

#### 10. analytics_log
System activity logging
```sql
log_id (int, PK, auto_increment)
action_type (varchar(100), NOT NULL)
performed_by (int, NULL, FK -> users.user_id)
timestamp (datetime, DEFAULT CURRENT_TIMESTAMP)
```

### Communication

#### 11. notifications
User notifications
```sql
notification_id (int, PK, auto_increment)
user_id (int, NOT NULL, FK -> users.user_id)
message (varchar(255), NOT NULL)
type (enum: 'Donation','Request','System','Urgent Alert', NOT NULL)
is_read (tinyint(1), DEFAULT 0)
created_at (datetime, DEFAULT CURRENT_TIMESTAMP)
```

#### 12. password_reset_tokens
Password reset functionality
```sql
id (int, PK, auto_increment)
user_id (int, NOT NULL, FK -> users.user_id)
email (varchar(100), NOT NULL)
token (varchar(255), NOT NULL)
expires_at (datetime, NOT NULL)
used (tinyint(1), DEFAULT 0)
created_at (datetime, DEFAULT CURRENT_TIMESTAMP)
```

## Key Relationships

- Users have role-specific profiles (donor_profile, patient_profile, hospital)
- Blood requests link patients to hospitals
- Donation requests link donors to hospitals
- All activities are logged in analytics_log
- Notifications are sent to users for various events

## Important Notes

1. **No blood_type in users table** - Blood type is stored in role-specific profiles
2. **Role-based profiles** - Each user role has extended profile information
3. **Denormalized views** - Some tables like active_blood_requests are for performance
4. **Audit trail** - analytics_log tracks all system activities
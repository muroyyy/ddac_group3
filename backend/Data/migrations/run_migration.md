# Database Migration Instructions

## Run this SQL on your RDS MySQL database:

```sql
ALTER TABLE blood_requests 
ADD COLUMN notes TEXT NULL;
```

## Or connect via AWS CLI:
```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p bloodline < add_notes_to_blood_requests.sql
```

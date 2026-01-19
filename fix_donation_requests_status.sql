-- Fix donation_requests table status column
-- This script addresses NULL status values and adds proper constraints

-- Step 1: Update existing NULL or empty status values to 'Pending'
UPDATE donation_requests 
SET status = 'Pending' 
WHERE status IS NULL OR status = '';

-- Step 2: Add DEFAULT value for status column
ALTER TABLE donation_requests 
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Pending';

-- Step 3: Add check constraint for valid statuses
ALTER TABLE donation_requests 
ADD CONSTRAINT chk_donation_status 
CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'));

-- Step 4: Update approved requests based on existing appointments
UPDATE donation_requests dr
SET status = 'Approved'
WHERE dr.donation_id IN (
    SELECT DISTINCT da.donation_id 
    FROM donor_appointments da 
    WHERE da.status = 'Scheduled'
) AND dr.status = 'Pending';

-- Step 5: Update rejected requests based on cancelled appointments
UPDATE donation_requests dr
SET status = 'Rejected'
WHERE dr.donation_id IN (
    SELECT DISTINCT da.donation_id 
    FROM donor_appointments da 
    WHERE da.status = 'Cancelled'
) AND dr.status = 'Pending';

-- Verify the changes
SELECT 
    status,
    COUNT(*) as count
FROM donation_requests 
GROUP BY status
ORDER BY status;
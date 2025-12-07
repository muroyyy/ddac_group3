-- Add notes column to blood_requests table
ALTER TABLE blood_requests 
ADD COLUMN notes TEXT NULL;

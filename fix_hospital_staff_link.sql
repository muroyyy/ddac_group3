-- Check if the record already exists
SELECT * FROM hospital_staff WHERE user_id = 16;

-- Delete any existing record for user 16 (in case there's a conflict)
DELETE FROM hospital_staff WHERE user_id = 16;

-- Insert the correct record
INSERT INTO hospital_staff (user_id, hospital_id, position) VALUES (16, 1, 'Staff');

-- Verify the insertion
SELECT * FROM hospital_staff WHERE user_id = 16;
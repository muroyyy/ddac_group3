-- Insert hospital staff record to link user 16 to hospital 1
INSERT INTO hospital_staff (user_id, hospital_id, position) 
VALUES (16, 1, 'Staff');

-- Verify the record was created
SELECT * FROM hospital_staff WHERE user_id = 16;
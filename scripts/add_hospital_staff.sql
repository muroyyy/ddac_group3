-- Add Wong Yi Ren as hospital staff for hospital ID 1
-- User ID 16 for wongyiren33@gmail.com

INSERT INTO hospital_staff (user_id, hospital_id, position, created_at, updated_at) 
VALUES (16, 1, 'Hospital Staff', NOW(), NOW());

-- Verify the insertion
SELECT hs.*, u.full_name, u.email, h.hospital_name 
FROM hospital_staff hs
JOIN users u ON hs.user_id = u.id
JOIN hospital h ON hs.hospital_id = h.hospital_id
WHERE u.email = 'wongyiren33@gmail.com';
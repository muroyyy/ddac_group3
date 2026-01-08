-- Check hospital_staff table for Wong Yi Ren
SELECT hs.*, u.full_name, u.email, h.hospital_name 
FROM hospital_staff hs
JOIN users u ON hs.user_id = u.id
JOIN hospital h ON hs.hospital_id = h.hospital_id
WHERE u.email = 'wongyiren33@gmail.com';

-- Also check if there are any issues with the user ID mapping
SELECT * FROM hospital_staff WHERE user_id = 16;
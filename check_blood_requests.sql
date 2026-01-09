-- Check if there are blood requests for hospital 1
SELECT * FROM blood_requests WHERE hospital_id = 1;

-- Check if there are any pending blood requests for hospital 1
SELECT * FROM blood_requests WHERE hospital_id = 1 AND status = 'Pending';

-- Check all blood requests regardless of hospital
SELECT request_id, patient_id, hospital_id, blood_type, status FROM blood_requests ORDER BY request_id DESC LIMIT 10;
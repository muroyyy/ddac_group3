-- Check blood requests and their relationships
SELECT 
    br.request_id,
    br.patient_id,
    br.hospital_id,
    br.blood_type,
    br.status,
    pp.patient_id as profile_exists,
    u.user_id as user_exists,
    u.full_name
FROM blood_requests br
LEFT JOIN patient_profile pp ON br.patient_id = pp.patient_id
LEFT JOIN users u ON pp.user_id = u.user_id
WHERE br.hospital_id = 1 AND br.status = 'Pending'
ORDER BY br.created_at DESC;

-- Check if patient_profile records exist for blood request patient_ids
SELECT DISTINCT br.patient_id, pp.patient_id as profile_exists
FROM blood_requests br
LEFT JOIN patient_profile pp ON br.patient_id = pp.patient_id
WHERE br.hospital_id = 1 AND br.status = 'Pending';

-- Check total counts
SELECT 
    COUNT(*) as total_blood_requests,
    COUNT(CASE WHEN br.status = 'Pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN pp.patient_id IS NOT NULL THEN 1 END) as with_profiles
FROM blood_requests br
LEFT JOIN patient_profile pp ON br.patient_id = pp.patient_id
WHERE br.hospital_id = 1;
-- Insert test blood requests for hospital 1
INSERT INTO blood_requests (patient_id, hospital_id, blood_type, units_required, urgency_level, status, notes, created_at) VALUES
(1, 1, 'A+', 2, 'High', 'Pending', 'Urgent surgery required', NOW()),
(1, 1, 'O-', 1, 'Critical', 'Pending', 'Emergency transfusion needed', NOW()),
(1, 1, 'B+', 3, 'Medium', 'Pending', 'Scheduled procedure', NOW());
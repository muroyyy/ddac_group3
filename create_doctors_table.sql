-- Create doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    hospital_id INT NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- Insert sample doctors for hospital 1
INSERT IGNORE INTO doctors (hospital_id, doctor_name, specialization, contact_number) VALUES
(1, 'Dr. Sarah Johnson', 'Hematology', '+60123456789'),
(1, 'Dr. Michael Chen', 'Internal Medicine', '+60123456790'),
(1, 'Dr. Emily Rodriguez', 'Emergency Medicine', '+60123456791');
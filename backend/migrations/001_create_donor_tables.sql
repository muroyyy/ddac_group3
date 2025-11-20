-- Create donor_profiles table
CREATE TABLE IF NOT EXISTS donor_profiles (
    donor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    location VARCHAR(200) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    last_donation_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
);

-- Create donation_requests table
CREATE TABLE IF NOT EXISTS donation_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    hospital_id INT NULL,
    blood_type VARCHAR(5) NOT NULL,
    units_requested INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(donor_id) ON DELETE CASCADE
);

-- Create donation_history table
CREATE TABLE IF NOT EXISTS donation_history (
    donation_id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    hospital_id INT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    blood_type VARCHAR(5) NOT NULL,
    units_donated INT NOT NULL,
    donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Completed',
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(donor_id) ON DELETE CASCADE
);

-- Insert demo donor account (password: password123)
INSERT INTO users (full_name, email, phone, password_hash, role, status, created_at)
VALUES (
    'Demo Donor',
    'donor@demo.com',
    '+60123456789',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSWowUYu',
    'Donor',
    'Active',
    NOW()
)
ON DUPLICATE KEY UPDATE email = email;

-- Get the user_id for demo donor
SET @demo_user_id = (SELECT user_id FROM users WHERE email = 'donor@demo.com');

-- Insert demo donor profile
INSERT INTO donor_profiles (user_id, blood_type, location, is_available, created_at)
VALUES (
    @demo_user_id,
    'O+',
    'Kuala Lumpur',
    TRUE,
    NOW()
)
ON DUPLICATE KEY UPDATE blood_type = 'O+', location = 'Kuala Lumpur';

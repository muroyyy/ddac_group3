-- Migration: Add hospital verification codes system
-- Date: 2024
-- Description: Add verification code table and update hospital_staff table

-- Create hospital_verification_codes table
CREATE TABLE IF NOT EXISTS hospital_verification_codes (
    code_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    verification_code VARCHAR(12) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id) ON DELETE CASCADE,
    INDEX idx_verification_code (verification_code),
    INDEX idx_hospital_id (hospital_id)
);

-- Add verification_code_used column to hospital_staff table
ALTER TABLE hospital_staff 
ADD COLUMN IF NOT EXISTS verification_code_used VARCHAR(12);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_verification_code_used ON hospital_staff(verification_code_used);

-- Create patient_appointments table
CREATE TABLE `patient_appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `request_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `hospital_id` int NOT NULL,
  `doctor_id` int DEFAULT NULL,
  `appointment_date` datetime NOT NULL,
  `status` enum('Upcoming','Completed','Cancelled') DEFAULT 'Upcoming',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `doctor_notes` text,
  PRIMARY KEY (`appointment_id`),
  KEY `idx_request` (`request_id`),
  KEY `idx_patient` (`patient_id`),
  KEY `idx_hospital` (`hospital_id`),
  KEY `idx_doctor` (`doctor_id`),
  KEY `idx_status` (`status`),
  KEY `idx_appointment_date` (`appointment_date`),
  CONSTRAINT `patient_appointments_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`request_id`) ON DELETE CASCADE,
  CONSTRAINT `patient_appointments_ibfk_2` FOREIGN KEY (`hospital_id`) REFERENCES `hospital` (`hospital_id`) ON DELETE CASCADE,
  CONSTRAINT `patient_appointments_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`doctor_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
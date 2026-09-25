-- ==========================================================
-- Gym Management System - Events & Workshops Schema
-- Database: gym_management
-- ==========================================================

USE `gym_management`;

-- 1. Event Categories Table
CREATE TABLE IF NOT EXISTS `event_categories` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(80) NOT NULL UNIQUE,
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Events Table
CREATE TABLE IF NOT EXISTS `events` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT UNSIGNED NOT NULL,
    `title` VARCHAR(150) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `instructor_name` VARCHAR(100) NOT NULL,
    `event_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `location` VARCHAR(100) NOT NULL DEFAULT 'Main Fitness Studio',
    `max_capacity` INT UNSIGNED NOT NULL DEFAULT 20,
    `registered_count` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('scheduled', 'ongoing', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_event_date` (`event_date`),
    INDEX `idx_event_status` (`status`),
    CONSTRAINT `fk_event_category` FOREIGN KEY (`category_id`) REFERENCES `event_categories`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Event Registrations Table
CREATE TABLE IF NOT EXISTS `event_registrations` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT UNSIGNED NOT NULL,
    `member_id` INT UNSIGNED NOT NULL,
    `registration_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('registered', 'attended', 'cancelled') NOT NULL DEFAULT 'registered',
    `notes` VARCHAR(255) DEFAULT NULL,
    UNIQUE KEY `uk_event_member` (`event_id`, `member_id`),
    INDEX `idx_reg_event` (`event_id`),
    INDEX `idx_reg_member` (`member_id`),
    CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reg_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Seed Event Categories
INSERT INTO `event_categories` (`id`, `category_name`, `description`) VALUES
(1, 'HIIT Bootcamp', 'High-intensity interval conditioning and stamina workouts'),
(2, 'Yoga & Mobility', 'Flexibility, core stabilization, and recovery routines'),
(3, 'Powerlifting Clinic', 'Technique guidance on squat, bench press, and deadlift'),
(4, 'Nutrition Seminar', 'Meal preparation, hydration, and muscle gain nutrition')
ON DUPLICATE KEY UPDATE `category_name` = VALUES(`category_name`);

-- 5. Seed Sample Events
INSERT INTO `events` (`id`, `category_id`, `title`, `description`, `instructor_name`, `event_date`, `start_time`, `end_time`, `location`, `max_capacity`, `registered_count`, `status`) VALUES
(1, 1, 'Saturday Morning Blitz HIIT', 'Full-body metabolic circuit with battle ropes and kettlebells.', 'Coach Vikram Singh', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '07:00:00', '08:30:00', 'Studio A (Ground Floor)', 20, 2, 'scheduled'),
(2, 2, 'Sunrise Yoga & Spinal Mobility', 'Gentle dynamic stretching, core activation, and breathing drills.', 'Pooja Trainer', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '06:30:00', '07:45:00', 'Rooftop Deck', 15, 1, 'scheduled'),
(3, 3, 'Deadlift & Bench Press Masterclass', 'Biomechanics breakdown, bar path correction, and safety spotting.', 'Coach Aryan Roy', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '17:00:00', '19:00:00', 'Free Weights Arena', 12, 2, 'scheduled'),
(4, 4, 'Lean Muscle Meal Prep & Macros', 'Live cooking and macronutrient calculation workshop for gym athletes.', 'Dr. Simran Kaur', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '18:00:00', '19:30:00', 'Conference Room', 30, 1, 'scheduled')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 6. Seed Sample Registrations
INSERT INTO `event_registrations` (`event_id`, `member_id`, `status`) VALUES
(1, 1, 'registered'),
(1, 2, 'registered'),
(2, 2, 'registered'),
(3, 1, 'registered'),
(3, 3, 'registered'),
(4, 4, 'registered')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

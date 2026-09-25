-- ==========================================================
-- Gym Management System - Seed Data (College Project)
-- Database: gym_management
-- ==========================================================

USE `gym_management`;

-- 1. Default Admin User (admin@gym.com / admin123)
-- Hash generated via password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'Administrator', 'admin@gym.com', '$2y$10$8YZxiKZWrRoh47zH9hhPtOgbSyzcKJ.PilvQE1dzY6D8rDhulrHEm')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `password` = VALUES(`password`);

-- 2. Sample Plans
INSERT INTO `plans` (`id`, `plan_name`, `duration`, `price`) VALUES
(1, 'Monthly Basic (30 Days)', 30, 1500.00),
(2, 'Quarterly Fitness (90 Days)', 90, 4000.00),
(3, 'Annual Pro Athlete (365 Days)', 365, 12000.00)
ON DUPLICATE KEY UPDATE `plan_name` = VALUES(`plan_name`), `duration` = VALUES(`duration`), `price` = VALUES(`price`);

-- 3. Sample Members
INSERT INTO `members` (`id`, `name`, `email`, `phone`, `gender`, `join_date`, `status`) VALUES
(1, 'Rohan Shah', 'rohan@example.com', '9876543210', 'Male', '2026-01-15', 'active'),
(2, 'Pooja Patel', 'pooja@example.com', '9876543211', 'Female', '2026-02-10', 'active'),
(3, 'Aman Verma', 'aman@example.com', '9876543212', 'Male', '2025-11-01', 'inactive'),
(4, 'Neha Sharma', 'neha@example.com', '9876543213', 'Female', '2026-03-01', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `phone` = VALUES(`phone`);

-- 4. Sample Memberships & Payments
-- Member 1: Active Annual Plan
INSERT INTO `memberships` (`id`, `member_id`, `plan_id`, `start_date`, `end_date`, `amount`, `payment_method`) VALUES
(1, 1, 3, '2026-01-15', '2027-01-15', 12000.00, 'upi'),
-- Member 2: Active Quarterly Plan
(2, 2, 2, '2026-02-10', '2026-05-11', 4000.00, 'card'),
-- Member 3: Expired Monthly Plan (shows up as Expired in Dashboard!)
(3, 3, 1, '2025-11-01', '2025-12-01', 1500.00, 'cash'),
-- Member 4: Active Monthly Plan
(4, 4, 1, '2026-03-01', '2026-03-31', 1500.00, 'upi')
ON DUPLICATE KEY UPDATE `amount` = VALUES(`amount`);

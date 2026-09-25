-- ==========================================================
-- Gym Management System - Simplified Schema (College Project)
-- Database: gym_management
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `gym_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `gym_management`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop old / unused tables
DROP TABLE IF EXISTS `class_bookings`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `workout_plans`;
DROP TABLE IF EXISTS `diet_plans`;
DROP TABLE IF EXISTS `expenses`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `subscriptions`;
DROP TABLE IF EXISTS `memberships`;
DROP TABLE IF EXISTS `plans`;
DROP TABLE IF EXISTS `members`;
DROP TABLE IF EXISTS `users`;

-- 1. Users table (Admin Login)
CREATE TABLE `users` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Members table
CREATE TABLE `members` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `phone` VARCHAR(20) NOT NULL,
    `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
    `join_date` DATE NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_members_email` (`email`),
    INDEX `idx_members_status` (`status`)
) ENGINE=InnoDB;

-- 3. Membership Plans table
CREATE TABLE `plans` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `plan_name` VARCHAR(100) NOT NULL,
    `duration` INT UNSIGNED NOT NULL, -- Duration in days (e.g., 30, 90, 180, 365)
    `price` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Memberships table (Plan assignment & payment record combined)
CREATE TABLE `memberships` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT UNSIGNED NOT NULL,
    `plan_id` INT UNSIGNED NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('cash', 'card', 'upi') NOT NULL DEFAULT 'cash',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_membership_dates` (`start_date`, `end_date`),
    CONSTRAINT `fk_mem_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_mem_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

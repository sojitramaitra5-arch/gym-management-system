-- ==========================================================
-- Hulk Fitness - Advanced Features Schema & Seed Data
-- Database: gym_management
-- Includes: Member Password, Offers, Gym Rooms & Equipment, Supplements Store
-- ==========================================================

USE `gym_management`;

-- 1. Ensure members table has a password column for member portal login
-- Default password hash corresponds to 'member123' (bcrypt)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'gym_management' 
  AND TABLE_NAME = 'members' 
  AND COLUMN_NAME = 'password';

SET @alter_sql = IF(@col_exists = 0, 
    'ALTER TABLE `members` ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`', 
    'SELECT 1');
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing members with default password hash for 'member123' if null
-- Hash generated via password_hash('member123', PASSWORD_BCRYPT)
UPDATE `members` 
SET `password` = '$2y$10$tZzCiqr0vS.y6P5K5mQx2OGu9w8iZ1QxZ8v2K9b6P8L8QzVzQy5Ku' 
WHERE `password` IS NULL OR `password` = '';

-- 2. Gym Offers & Promotions Table
CREATE TABLE IF NOT EXISTS `offers` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(150) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `discount_percent` INT NOT NULL DEFAULT 10,
    `description` TEXT NOT NULL,
    `valid_until` DATE NOT NULL,
    `badge` VARCHAR(50) DEFAULT 'HOT DEAL',
    `status` ENUM('active', 'expired') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Gym Rooms Table
CREATE TABLE IF NOT EXISTS `gym_rooms` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `room_name` VARCHAR(100) NOT NULL UNIQUE,
    `floor` VARCHAR(50) NOT NULL DEFAULT 'Ground Floor',
    `description` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Equipment Inventory Table
CREATE TABLE IF NOT EXISTS `equipment` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `room_name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(60) NOT NULL, -- 'Cardio', 'Free Weights', 'Strength Machines', 'CrossFit & Functional', 'Recovery'
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `condition_status` ENUM('Working', 'Maintenance', 'Needs Inspection') NOT NULL DEFAULT 'Working',
    `target_muscle` VARCHAR(100) NOT NULL DEFAULT 'Full Body',
    `image_url` VARCHAR(500) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_equip_room` (`room_name`),
    INDEX `idx_equip_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Products / Supplements Store Table
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `category` ENUM('protein', 'creatine', 'bcaa', 'preworkout') NOT NULL,
    `brand` VARCHAR(100) NOT NULL,
    `flavor` VARCHAR(100) NOT NULL DEFAULT 'Unflavored',
    `weight_size` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `discount_price` DECIMAL(10, 2) NOT NULL,
    `stock` INT UNSIGNED NOT NULL DEFAULT 10,
    `badge` VARCHAR(50) DEFAULT 'Bestseller',
    `image_url` VARCHAR(500) DEFAULT NULL,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_prod_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Member Product Order Inquiries
CREATE TABLE IF NOT EXISTS `product_orders` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `member_id` INT UNSIGNED NOT NULL,
    `product_id` INT UNSIGNED NOT NULL,
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` ENUM('requested', 'ready_for_pickup', 'completed', 'cancelled') NOT NULL DEFAULT 'requested',
    `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_order_member` (`member_id`),
    CONSTRAINT `fk_order_member` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================================
-- SEED DATA
-- ==========================================================

-- Seed Offers
INSERT INTO `offers` (`id`, `title`, `code`, `discount_percent`, `description`, `valid_until`, `badge`, `status`) VALUES
(1, 'Summer Shred Special Deal', 'SUMMER25', 25, 'Get 25% instant discount on Quarterly and Annual athlete membership plans.', DATE_ADD(CURDATE(), INTERVAL 45 DAY), '25% OFF', 'active'),
(2, 'College Student Fitness Pass', 'STUDENT15', 15, 'Special flat 15% discount for verified college and university students with valid ID.', DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'STUDENT DEAL', 'active'),
(3, 'Muscle Stack Combo Voucher', 'STACK10', 10, 'Save 10% on bundled purchase of Whey Protein with Micronized Creatine at front desk.', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'COMBO 10%', 'active'),
(4, 'Annual Athlete Loyalty Renewal', 'HULKPRO30', 30, 'Existing members renewing for full 1 year get 30% discount plus free gym kit and shaker.', DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'LOYALTY REWARD', 'active'),
(5, 'Festival Power Week Pass', 'POWER20', 20, 'Flat 20% discount on all personal trainer and specialized workshop registrations.', DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'HOT DEAL', 'active')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `discount_percent` = VALUES(`discount_percent`), `valid_until` = VALUES(`valid_until`);

-- Seed Gym Rooms
INSERT INTO `gym_rooms` (`id`, `room_name`, `floor`, `description`) VALUES
(1, 'Room 1: Cardio Zone', 'Ground Floor', 'Dedicated high-energy cardio hall with rowers, treadmills, spin and air bikes.'),
(2, 'Room 2: Free Weights & Powerlifting', 'Ground Floor', 'Heavy power racks, competition Olympic barbells, dumbbell rack, and deadlift platforms.'),
(3, 'Room 3: Machine & Cable Arena', '1st Floor', 'Plate-loaded isolation machines, 8-station cable crossover, and leg press systems.'),
(4, 'Room 4: CrossFit Turf & Functional Area', '1st Floor', 'Rubber turf, battle ropes, kettlebells, medicine balls, and plyometric boxes.'),
(5, 'Room 5: Yoga & Recovery Deck', 'Rooftop Deck', 'Spacious open-air studio with mats, stretch bands, and foam rollers for cool-down.')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- Seed Gym Equipment
INSERT INTO `equipment` (`id`, `name`, `room_name`, `category`, `quantity`, `condition_status`, `target_muscle`, `image_url`) VALUES
(1, 'Commercial Treadmill Pro-X', 'Room 1: Cardio Zone', 'Cardio', 8, 'Working', 'Cardiovascular & Lower Body', 'http://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&auto=format&fit=crop&q=80'),
(2, 'Spin & Air Resistance Bikes', 'Room 1: Cardio Zone', 'Cardio', 6, 'Working', 'Stamina & Leg Endurance', 'http://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&auto=format&fit=crop&q=80'),
(3, 'Commercial Elliptical Cross Trainer', 'Room 1: Cardio Zone', 'Cardio', 5, 'Working', 'Low-Impact Cardio & Glutes', 'http://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'),
(4, 'Concept2 Indoor Water Rower', 'Room 1: Cardio Zone', 'Cardio', 4, 'Working', 'Full Body Endurance & Core', 'http://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'),
(5, 'Heavy Olympic Squat & Power Racks', 'Room 2: Free Weights & Powerlifting', 'Free Weights', 4, 'Working', 'Quads, Hamstrings & Glutes', 'http://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80'),
(6, 'Standard Olympic Barbells (20kg)', 'Room 2: Free Weights & Powerlifting', 'Free Weights', 12, 'Working', 'Full Body Compound Lifts', 'http://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop&q=80'),
(7, 'Olympic Bumper Plates Set (5kg-25kg)', 'Room 2: Free Weights & Powerlifting', 'Free Weights', 30, 'Working', 'Deadlifts & Squats', 'http://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&auto=format&fit=crop&q=80'),
(8, 'Rubber Hex Dumbbells Set (2.5kg to 50kg)', 'Room 2: Free Weights & Powerlifting', 'Free Weights', 22, 'Working', 'Chest, Shoulders & Arms', 'http://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=600&auto=format&fit=crop&q=80'),
(9, 'Adjustable Heavy Incline/Decline Benches', 'Room 2: Free Weights & Powerlifting', 'Free Weights', 6, 'Working', 'Pectorals & Deltoids', 'http://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80'),
(10, '45-Degree Plate-Loaded Leg Press', 'Room 3: Machine & Cable Arena', 'Strength Machines', 2, 'Working', 'Quadriceps, Adductors & Calves', 'http://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80'),
(11, '8-Station Dual Cable Crossover Tower', 'Room 3: Machine & Cable Arena', 'Strength Machines', 2, 'Working', 'Chest, Back & Arms', 'http://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&auto=format&fit=crop&q=80'),
(12, 'Lat Pulldown & Low Row Combo Unit', 'Room 3: Machine & Cable Arena', 'Strength Machines', 4, 'Working', 'Lats, Rhomboids & Biceps', 'http://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'),
(13, 'Pec Fly & Rear Delt Dual Machine', 'Room 3: Machine & Cable Arena', 'Strength Machines', 2, 'Working', 'Chest & Posterior Deltoid', 'http://images.unsplash.com/photo-1521804906057-1df8fdb718b7?w=600&auto=format&fit=crop&q=80'),
(14, 'Linear Bearing 3D Smith Machine', 'Room 3: Machine & Cable Arena', 'Strength Machines', 2, 'Working', 'Guided Squats & Presses', 'http://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80'),
(15, 'Heavy-Duty Battle Ropes & Floor Anchor', 'Room 4: CrossFit Turf & Functional Area', 'CrossFit & Functional', 4, 'Working', 'Shoulders, Arms & Conditioning', 'http://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80'),
(16, 'Cast Iron Competition Kettlebells (4-32kg)', 'Room 4: CrossFit Turf & Functional Area', 'CrossFit & Functional', 16, 'Working', 'Posterior Chain & Core Stability', 'http://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&auto=format&fit=crop&q=80'),
(17, '3-in-1 Wooden Plyometric Jump Boxes', 'Room 4: CrossFit Turf & Functional Area', 'CrossFit & Functional', 6, 'Working', 'Explosive Power & Calves', 'http://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&auto=format&fit=crop&q=80'),
(18, 'Heavy Prowler Sled & Push Track', 'Room 4: CrossFit Turf & Functional Area', 'CrossFit & Functional', 2, 'Working', 'Leg Drive & Sprint Speed', 'http://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop&q=80'),
(19, 'High-Density Trigger Point Foam Rollers', 'Room 5: Yoga & Recovery Deck', 'Recovery', 15, 'Working', 'Myofascial Release & Mobility', 'http://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80'),
(20, 'Anti-Slip Yoga & Stretching Mats', 'Room 5: Yoga & Recovery Deck', 'Recovery', 20, 'Working', 'Flexibility & Core Stretching', 'http://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80')
ON DUPLICATE KEY UPDATE `quantity` = VALUES(`quantity`), `condition_status` = VALUES(`condition_status`), `image_url` = VALUES(`image_url`);

-- Seed Supplements / Products (Whey Protein, Creatine, BCAA, Pre-Workout)
INSERT INTO `products` (`id`, `name`, `category`, `brand`, `flavor`, `weight_size`, `price`, `discount_price`, `stock`, `badge`, `image_url`, `description`) VALUES
(1, 'Optimum Nutrition Gold Standard 100% Whey', 'protein', 'Optimum Nutrition (ON)', 'Double Rich Chocolate', '2 kg / 4.4 lbs (74 Servings)', 6899.00, 5499.00, 18, 'BESTSELLER', 'http://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80', '24g blended whey isolate, concentrate, and peptides with 5.5g BCAAs and 4g glutamine per scoop.'),
(2, 'Dymatize ISO 100 Hydrolyzed Whey Isolate', 'protein', 'Dymatize', 'Gourmet Chocolate', '2.2 kg / 5 lbs (76 Servings)', 8499.00, 7199.00, 10, 'PREMIUM ISOLATE', 'http://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80', 'Ultra-pure hydrolyzed whey protein isolate for lightning fast absorption with zero sugar and ultra-low carbs.'),
(3, 'MuscleBlaze Biozyme Performance Whey', 'protein', 'MuscleBlaze', 'Rich Milk Chocolate', '2 kg (60 Servings)', 4999.00, 3899.00, 25, 'CLINICALLY TESTED', 'http://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80', 'Enhanced absorption formula clinically tested for 50% higher protein absorption and reduced stomach bloating.'),
(4, 'MyProtein Impact Whey Isolate', 'protein', 'MyProtein', 'Salted Caramel', '1 kg (40 Servings)', 3499.00, 2799.00, 14, 'LEAN MUSCLE', 'http://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80', 'Grade A whey isolate delivering 23g pure protein with less than 1g fat per serving.'),
(5, 'Optimum Nutrition Micronized Creatine Powder', 'creatine', 'Optimum Nutrition (ON)', 'Unflavored', '300 g (100 Servings)', 1499.00, 1099.00, 30, 'ESSENTIAL', 'http://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80', '100% pure micronized creatine monohydrate to support ATP production, explosive strength, and power.'),
(6, 'Creapure German Pure Creatine Monohydrate', 'creatine', 'Creapure', 'Unflavored', '250 g (83 Servings)', 1799.00, 1399.00, 20, '99.9% PURE', 'http://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 'Certified German Creapure pharmaceutical grade creatine for maximum bio-availability and muscle cell volumization.'),
(7, 'MuscleBlaze CreAMP Fast-Absorption Creatine', 'creatine', 'MuscleBlaze', 'Fruit Punch', '300 g (100 Servings)', 1299.00, 949.00, 22, 'RAPID GAINS', 'http://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80', 'Creatine monohydrate with CreAMP technology to minimize muscle breakdown and fuel heavy lifts.'),
(8, 'Scivation Xtend BCAA 2:1:1 + Electrolytes', 'bcaa', 'Scivation Xtend', 'Watermelon Explosion', '420 g (30 Servings)', 2699.00, 1999.00, 16, 'TOP RATED BCAA', 'http://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', '7g Branched Chain Amino Acids in 2:1:1 ratio with hydrating electrolytes to stop muscle breakdown intra-workout.'),
(9, 'MusclePharm Combat Core BCAA 3:1:2', 'bcaa', 'MusclePharm', 'Blue Raspberry', '30 Servings / 270 g', 2299.00, 1699.00, 12, 'ENDURANCE', 'http://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80', 'Patent-pending 3:1:2 leucine, isoleucine, valine blend designed to rebuild muscle tissue during high-intensity training.'),
(10, 'Fast&Up Instant BCAA Energy & Recovery', 'bcaa', 'Fast&Up', 'Green Apple', '300 g (30 Servings)', 1899.00, 1449.00, 18, 'FAST ABSORB', 'http://images.unsplash.com/photo-1546483875-ad9014c88eba?w=600&auto=format&fit=crop&q=80', 'Micro-pulverized instantized vegan BCAAs with taurine and L-glutamine for post-workout muscle soreness relief.'),
(11, 'Cellucor C4 Original Pre-Workout High Explosive', 'preworkout', 'Cellucor', 'Icy Blue Razz', '195 g (30 Servings)', 2499.00, 1899.00, 15, 'ENERGY BOOST', 'http://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80', 'Legendary pre-workout powder with CarnoSyn Beta-Alanine, Creatine Nitrate, and 150mg caffeine for focus.')
ON DUPLICATE KEY UPDATE `price` = VALUES(`price`), `discount_price` = VALUES(`discount_price`), `stock` = VALUES(`stock`), `image_url` = VALUES(`image_url`);

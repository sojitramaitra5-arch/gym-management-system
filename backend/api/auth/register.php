<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/User.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$name = trim(isset($input['name']) ? $input['name'] : '');
$email = trim(isset($input['email']) ? $input['email'] : '');
$password = trim(isset($input['password']) ? $input['password'] : '');
$role = trim(isset($input['role']) ? $input['role'] : 'owner'); // default to owner if not specified

if (empty($name) || empty($email) || empty($password)) {
    Response::error("Name, email and password are required.", null, 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("Invalid email format.", null, 422);
}

if (strlen($password) < 6) {
    Response::error("Password must be at least 6 characters.", null, 422);
}

$db = (new Database())->getConnection();

// Ensure password column exists on members table (migration safety)
try {
    $db->query("SELECT `password` FROM `members` LIMIT 1");
} catch (Exception $e) {
    try {
        $db->query("ALTER TABLE `members` ADD COLUMN `password` VARCHAR(255) NULL AFTER `email`");
    } catch (Exception $ignored) {}
}

$checkStmt = $db->prepare("SELECT id FROM members WHERE email = :email LIMIT 1");
$checkStmt->execute(array(':email' => $email));
if ($checkStmt->fetch()) {
    Response::error("This email is already registered. Please log in.", null, 409);
}

$phone = trim(isset($input['phone']) ? $input['phone'] : '');
$gender = trim(isset($input['gender']) ? $input['gender'] : 'Male');
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
$joinDate = date('Y-m-d');

$stmt = $db->prepare("
    INSERT INTO members (name, email, phone, gender, join_date, status, password) 
    VALUES (:name, :email, :phone, :gender, :join_date, 'active', :password)
");

$success = $stmt->execute(array(
    ':name'      => $name,
    ':email'     => $email,
    ':phone'     => !empty($phone) ? $phone : '9876543210',
    ':gender'    => $gender,
    ':join_date' => $joinDate,
    ':password'  => $hashedPassword
));

if (!$success) {
    Response::error("Failed to create account. Please try again.", null, 500);
}

$memberId = (int)$db->lastInsertId();

// Generate Token (Gym Member Role - NOT Admin!)
$tokenPayload = array(
    'user_id'   => $memberId,
    'member_id' => $memberId,
    'name'      => $name,
    'email'     => $email,
    'phone'     => $phone,
    'gender'    => $gender,
    'status'    => 'active',
    'role'      => 'member'
);

$jwt = JWT::encode($tokenPayload, 86400 * 7); // 7 days

Response::success("Registration successful! Welcome to Hulk Fitness.", array(
    'token' => $jwt,
    'user'  => array(
        'id'        => $memberId,
        'member_id' => $memberId,
        'name'      => $name,
        'email'     => $email,
        'phone'     => $phone,
        'gender'    => $gender,
        'status'    => 'active',
        'role'      => 'member'
    )
), 201);


<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Member.php";

JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

// Accept name or first_name + last_name
$name = '';
if (!empty($input['name'])) {
    $name = trim($input['name']);
} elseif (!empty($input['first_name'])) {
    $name = trim($input['first_name'] . ' ' . (isset($input['last_name']) ? $input['last_name'] : ''));
}

$email = isset($input['email']) ? trim($input['email']) : '';
$phone = isset($input['phone']) ? trim($input['phone']) : '';
$gender = isset($input['gender']) ? ucfirst(strtolower(trim($input['gender']))) : 'Male';
$joinDate = !empty($input['join_date']) ? $input['join_date'] : date('Y-m-d');
$status = !empty($input['status']) ? strtolower(trim($input['status'])) : 'active';

// Validation
if (empty($name)) {
    Response::error("Member name is required.", null, 422);
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("A valid email address is required.", null, 422);
}
if (empty($phone)) {
    Response::error("Phone number is required.", null, 422);
}

$db = (new Database())->getConnection();
$memberModel = new Member($db);

try {
    $id = $memberModel->create(array(
        'name'      => $name,
        'email'     => $email,
        'phone'     => $phone,
        'gender'    => $gender,
        'join_date' => $joinDate,
        'status'    => $status
    ));

    if (!$id) {
        throw new Exception("Could not insert member record.");
    }

    Response::success("Member added successfully", array('id' => $id), 201);
} catch (PDOException $e) {
    if ($e->getCode() === '23000' || strpos($e->getMessage(), 'Duplicate entry') !== false) {
        Response::error("A member with this email address already exists.", null, 409);
    }
    Response::error("Database error: " . $e->getMessage(), null, 500);
} catch (Exception $e) {
    Response::error("Failed to add member: " . $e->getMessage(), null, 500);
}

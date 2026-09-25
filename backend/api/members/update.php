<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Member.php";

JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error("Method Not Allowed", null, 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$input = json_decode(file_get_contents("php://input"), true);

if ($id <= 0 && isset($input['id'])) {
    $id = (int)$input['id'];
}

if ($id <= 0) {
    Response::error("Invalid member ID.", null, 400);
}

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

if (empty($name) || empty($email) || empty($phone)) {
    Response::error("Name, email, and phone number are required.", null, 422);
}

$db = (new Database())->getConnection();
$memberModel = new Member($db);

try {
    $success = $memberModel->update($id, array(
        'name'      => $name,
        'email'     => $email,
        'phone'     => $phone,
        'gender'    => $gender,
        'join_date' => $joinDate,
        'status'    => $status
    ));

    if ($success) {
        Response::success("Member updated successfully");
    } else {
        Response::error("Failed to update member.");
    }
} catch (PDOException $e) {
    if ($e->getCode() === '23000' || strpos($e->getMessage(), 'Duplicate entry') !== false) {
        Response::error("This email is already in use by another member.", null, 409);
    }
    Response::error("Update failed: " . $e->getMessage(), null, 500);
}

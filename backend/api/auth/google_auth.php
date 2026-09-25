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
$name  = trim(isset($input['name']) ? strip_tags($input['name']) : 'Google User');
$email = trim(isset($input['email']) ? strtolower($input['email']) : '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Response::error("A valid email address is required for Google authentication.", null, 422);
}

// Security: Prevent arbitrary empty or spoofed names
if (empty($name)) {
    $parts = explode('@', $email);
    $name = ucfirst($parts[0]);
}

$db = (new Database())->getConnection();

// Single authorized administrator
define('AUTHORIZED_ADMIN_EMAIL', 'sojitramaitra5@gmail.com');
$isOwnerAdmin = (strtolower($email) === strtolower(AUTHORIZED_ADMIN_EMAIL));

if ($isOwnerAdmin) {
    // Admin login path
    $userModel = new User($db);
    $user = $userModel->findByEmail($email);

    if (!$user) {
        $randomPass = "gauth_" . bin2hex(openssl_random_pseudo_bytes(16));
        $userId = $userModel->create($name, $email, $randomPass);
        if (!$userId) {
            Response::error("Could not complete Google account registration.", null, 500);
        }
        $user = array('id' => $userId, 'name' => $name, 'email' => $email);
    }

    $tokenPayload = array(
        'user_id' => $user['id'],
        'name'    => $user['name'],
        'email'   => $user['email'],
        'role'    => 'admin',
        'auth_provider' => 'google'
    );

    $jwt = JWT::encode($tokenPayload, 86400 * 7);

    Response::success("Google Sign-In successful", array(
        'token' => $jwt,
        'user'  => array(
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => 'admin'
        )
    ));
} else {
    // Member path for everyone else
    $stmt = $db->prepare("SELECT id, name, email, phone, gender, status FROM members WHERE email = :email LIMIT 1");
    $stmt->execute(array(':email' => $email));
    $member = $stmt->fetch();

    if (!$member) {
        // Automatically enroll as new member
        $ins = $db->prepare("INSERT INTO members (name, email, phone, gender, join_date, status) VALUES (:name, :email, '', 'Male', CURDATE(), 'active')");
        $ins->execute(array(':name' => $name, ':email' => $email));
        $memberId = (int)$db->lastInsertId();
        $member = array(
            'id' => $memberId,
            'name' => $name,
            'email' => $email,
            'phone' => '',
            'gender' => 'Male',
            'status' => 'active'
        );
    }

    $tokenPayload = array(
        'user_id'   => $member['id'],
        'member_id' => $member['id'],
        'name'      => $member['name'],
        'email'     => $member['email'],
        'role'      => 'member',
        'auth_provider' => 'google'
    );

    $jwt = JWT::encode($tokenPayload, 86400 * 7);

    Response::success("Google Member Login successful", array(
        'token' => $jwt,
        'user'  => array(
            'id'        => $member['id'],
            'member_id' => $member['id'],
            'name'      => $member['name'],
            'email'     => $member['email'],
            'role'      => 'member'
        )
    ));
}

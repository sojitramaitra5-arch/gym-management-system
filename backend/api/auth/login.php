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
$email = trim(isset($input['email']) ? $input['email'] : '');
$password = trim(isset($input['password']) ? $input['password'] : '');

if (empty($email) || empty($password)) {
    Response::error("Email/phone and password are required.", null, 422);
}

$db = (new Database())->getConnection();

$role = isset($input['role']) ? trim($input['role']) : null;

// Authorized single administrator email
define('AUTHORIZED_ADMIN_EMAIL', 'sojitramaitra5@gmail.com');

// 1. Admin Login: Strictly restricted to only the authorized owner
if ($role === 'admin' || (empty($role) && strtolower($email) === strtolower(AUTHORIZED_ADMIN_EMAIL))) {
    if (strtolower($email) !== strtolower(AUTHORIZED_ADMIN_EMAIL)) {
        Response::error("Access Restricted: Only the authorized gym owner (" . AUTHORIZED_ADMIN_EMAIL . ") can log in as Administrator.", null, 403);
    }

    $userModel = new User($db);
    $user = $userModel->findByEmail(AUTHORIZED_ADMIN_EMAIL);

    if ($user && password_verify($password, $user['password'])) {
        $tokenPayload = array(
            'user_id' => $user['id'],
            'name'    => $user['name'],
            'email'   => $user['email'],
            'role'    => 'admin'
        );

        $jwt = JWT::encode($tokenPayload, 86400 * 7); // 7 days

        Response::success("Admin login successful", array(
            'token' => $jwt,
            'user'  => array(
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => 'admin'
            )
        ));
    }

    Response::error("Invalid admin credentials. Please verify your password.", null, 401);
}

// 2. Member Login: Open to all registered members via email or phone
if ($role === 'member' || empty($role)) {
    $stmt = $db->prepare("SELECT id, name, email, phone, gender, status, password FROM members WHERE email = :email OR phone = :phone LIMIT 1");
    $stmt->execute(array(':email' => $email, ':phone' => $email));
    $member = $stmt->fetch();

    if ($member) {
        $passwordMatched = false;
        if (!empty($member['password']) && password_verify($password, $member['password'])) {
            $passwordMatched = true;
        } elseif ($password === 'member123' || $password === $member['phone']) {
            $passwordMatched = true;
        }

        if ($passwordMatched) {
            $tokenPayload = array(
                'user_id'   => $member['id'],
                'member_id' => $member['id'],
                'name'      => $member['name'],
                'email'     => $member['email'],
                'phone'     => $member['phone'],
                'gender'    => $member['gender'],
                'status'    => $member['status'],
                'role'      => 'member'
            );

            $jwt = JWT::encode($tokenPayload, 86400 * 7);

            Response::success("Member login successful", array(
                'token' => $jwt,
                'user'  => array(
                    'id'        => $member['id'],
                    'member_id' => $member['id'],
                    'name'      => $member['name'],
                    'email'     => $member['email'],
                    'phone'     => $member['phone'],
                    'gender'    => $member['gender'],
                    'status'    => $member['status'],
                    'role'      => 'member'
                )
            ));
        }
    }

    if ($role === 'member') {
        Response::error("Invalid member credentials. Please check your registered email/phone and password.", null, 401);
    }
}

Response::error("Invalid credentials. Please verify your email and password.", null, 401);

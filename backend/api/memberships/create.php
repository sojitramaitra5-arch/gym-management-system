<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Membership.php";

$auth = JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$userRole = isset($auth['role']) ? $auth['role'] : '';
if ($userRole === 'member') {
    $memberId = isset($auth['member_id']) ? (int)$auth['member_id'] : (isset($auth['user_id']) ? (int)$auth['user_id'] : 0);
} else {
    $memberId = isset($input['member_id']) ? (int)$input['member_id'] : 0;
}

$planId = isset($input['plan_id']) ? (int)$input['plan_id'] : 0;
$startDate = !empty($input['start_date']) ? $input['start_date'] : date('Y-m-d');
$paymentMethod = isset($input['payment_method']) ? strtolower(trim($input['payment_method'])) : 'cash';
$amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;

if ($memberId <= 0 || $planId <= 0) {
    Response::error("Member and Plan are required.", null, 422);
}

$db = (new Database())->getConnection();
$membershipModel = new Membership($db);

// Prevent duplicate entry: Check if member already has an active plan
$existingActive = $membershipModel->getActiveMembership($memberId, $startDate);
if ($existingActive) {
    $duplicateMsg = ($userRole === 'member')
        ? "You already have an active plan ('{$existingActive['plan_name']}') valid until {$existingActive['end_date']}. Duplicate subscription is not allowed while your plan is active."
        : "Member '{$existingActive['member_name']}' already has an active plan ('{$existingActive['plan_name']}') valid until {$existingActive['end_date']}. Duplicate plan entry is not allowed while a plan is active.";

    Response::error(
        $duplicateMsg,
        array(
            'existing_plan' => $existingActive['plan_name'],
            'end_date'      => $existingActive['end_date']
        ),
        409
    );
}

$id = $membershipModel->create(array(
    'member_id'      => $memberId,
    'plan_id'        => $planId,
    'start_date'     => $startDate,
    'amount'         => $amount,
    'payment_method' => $paymentMethod
));

if ($id) {
    $successMsg = ($userRole === 'member') ? "Membership activated successfully! Enjoy your workout." : "Membership assigned successfully";
    Response::success($successMsg, array('id' => $id), 201);
} else {
    Response::error("Failed to assign membership.", null, 500);
}

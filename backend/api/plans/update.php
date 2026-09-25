<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Plan.php";

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
    Response::error("Invalid plan ID.", null, 400);
}

$planName = isset($input['plan_name']) ? trim($input['plan_name']) : '';
$duration = isset($input['duration']) ? (int)$input['duration'] : 0;
$price = isset($input['price']) ? (float)$input['price'] : 0.0;

if (empty($planName) || $duration <= 0) {
    Response::error("Plan name and duration are required.", null, 422);
}

$db = (new Database())->getConnection();
$planModel = new Plan($db);

if ($planModel->update($id, array(
    'plan_name' => $planName,
    'duration'  => $duration,
    'price'     => $price
))) {
    Response::success("Plan updated successfully");
} else {
    Response::error("Failed to update plan.");
}

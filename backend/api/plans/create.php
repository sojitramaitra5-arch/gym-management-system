<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Plan.php";

JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$planName = isset($input['plan_name']) ? trim($input['plan_name']) : '';
$duration = isset($input['duration']) ? (int)$input['duration'] : 0;
$price = isset($input['price']) ? (float)$input['price'] : 0.0;

if (empty($planName)) {
    Response::error("Plan name is required.", null, 422);
}
if ($duration <= 0) {
    Response::error("Duration must be at least 1 day.", null, 422);
}
if ($price < 0) {
    Response::error("Price must be 0 or positive.", null, 422);
}

$db = (new Database())->getConnection();
$planModel = new Plan($db);

$id = $planModel->create(array(
    'plan_name' => $planName,
    'duration'  => $duration,
    'price'     => $price
));

if ($id) {
    Response::success("Plan created successfully", array('id' => $id), 201);
} else {
    Response::error("Failed to create plan.", null, 500);
}

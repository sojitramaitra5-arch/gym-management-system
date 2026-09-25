<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Plan.php";

JWT::requireAuth();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    Response::error("Invalid plan ID.", null, 400);
}

$db = (new Database())->getConnection();
$planModel = new Plan($db);

if ($planModel->delete($id)) {
    Response::success("Plan deleted successfully");
} else {
    Response::error("Failed to delete plan.");
}

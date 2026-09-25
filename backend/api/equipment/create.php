<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Equipment.php";

$auth = JWT::requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['name']) || empty($input['room_name']) || empty($input['category']) || !isset($input['quantity'])) {
    Response::error("Equipment name, room name, category, and quantity are required.", null, 422);
}

$db = (new Database())->getConnection();
$equipModel = new Equipment($db);

try {
    $id = $equipModel->create($input);
    if ($id) {
        Response::success("Equipment added successfully", array('id' => $id), 201);
    } else {
        Response::error("Failed to add equipment.");
    }
} catch (Exception $e) {
    Response::error("Error adding equipment: " . $e->getMessage());
}

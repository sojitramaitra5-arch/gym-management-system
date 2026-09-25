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
$id = isset($input['id']) ? (int)$input['id'] : 0;

if (!$id || empty($input['name']) || empty($input['room_name'])) {
    Response::error("Equipment ID, name, and room name are required.", null, 422);
}

$db = (new Database())->getConnection();
$equipModel = new Equipment($db);

if ($equipModel->update($id, $input)) {
    Response::success("Equipment updated successfully.");
} else {
    Response::error("Failed to update equipment.");
}

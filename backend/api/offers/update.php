<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Offer.php";

$auth = JWT::requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$id = isset($input['id']) ? (int)$input['id'] : 0;

if (!$id || empty($input['title']) || empty($input['code'])) {
    Response::error("Offer ID, title, and code are required.", null, 422);
}

$db = (new Database())->getConnection();
$offerModel = new Offer($db);

if ($offerModel->update($id, $input)) {
    $updated = $offerModel->getById($id);
    Response::success("Offer updated successfully", $updated);
} else {
    Response::error("Failed to update offer.");
}

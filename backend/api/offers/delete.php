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

if (!$id) {
    Response::error("Offer ID is required.", null, 422);
}

$db = (new Database())->getConnection();
$offerModel = new Offer($db);

if ($offerModel->delete($id)) {
    Response::success("Offer deleted successfully.");
} else {
    Response::error("Failed to delete offer.");
}

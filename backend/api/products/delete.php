<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Product.php";

$auth = JWT::requireRole('admin');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$id = isset($input['id']) ? (int)$input['id'] : 0;

if (!$id) {
    Response::error("Product ID is required.", null, 422);
}

$db = (new Database())->getConnection();
$productModel = new Product($db);

if ($productModel->delete($id)) {
    Response::success("Product deleted successfully.");
} else {
    Response::error("Failed to delete product.");
}

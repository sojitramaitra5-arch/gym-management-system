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

if (empty($input['name']) || empty($input['category']) || empty($input['brand']) || !isset($input['price']) || !isset($input['discount_price'])) {
    Response::error("Product name, category, brand, price, and discount price are required.", null, 422);
}

$db = (new Database())->getConnection();
$productModel = new Product($db);

try {
    $id = $productModel->create($input);
    if ($id) {
        $created = $productModel->getById($id);
        Response::success("Product added successfully", $created, 201);
    } else {
        Response::error("Failed to add product.");
    }
} catch (Exception $e) {
    Response::error("Error adding product: " . $e->getMessage());
}

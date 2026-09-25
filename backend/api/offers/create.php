<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Offer.php";

$auth = JWT::requireRole('admin'); // Only Admin can create offers

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

if (empty($input['title']) || empty($input['code']) || !isset($input['discount_percent']) || empty($input['valid_until'])) {
    Response::error("Title, code, discount percentage, and valid date are required.", null, 422);
}

$db = (new Database())->getConnection();
$offerModel = new Offer($db);

try {
    $id = $offerModel->create($input);
    if ($id) {
        $created = $offerModel->getById($id);
        Response::success("Offer created successfully", $created, 201);
    } else {
        Response::error("Failed to create offer.");
    }
} catch (Exception $e) {
    Response::error("Error creating offer: " . $e->getMessage());
}

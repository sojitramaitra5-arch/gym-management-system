<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

// Enforce JWT Authentication
JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
    Response::error("Invalid event ID", null, 422);
}

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("UPDATE events SET status = 'cancelled' WHERE id = :id");
    $success = $stmt->execute(array(':id' => $id));

    if ($success && $stmt->rowCount() > 0) {
        Response::success("Event has been cancelled");
    } else {
        Response::error("Event not found or already cancelled", null, 404);
    }
} catch (PDOException $e) {
    Response::error("Database error while cancelling event", null, 500);
}

<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Membership.php";

JWT::requireAuth();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    Response::error("Invalid membership ID.", null, 400);
}

$db = (new Database())->getConnection();
$membershipModel = new Membership($db);

if ($membershipModel->delete($id)) {
    Response::success("Membership deleted successfully");
} else {
    Response::error("Failed to delete membership.");
}

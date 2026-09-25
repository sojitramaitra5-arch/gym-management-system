<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Member.php";

JWT::requireAuth();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    Response::error("Invalid member ID.", null, 400);
}

$db = (new Database())->getConnection();
$memberModel = new Member($db);
$member = $memberModel->getById($id);

if (!$member) {
    Response::error("Member not found.", null, 404);
}

Response::success("Member retrieved successfully", $member);

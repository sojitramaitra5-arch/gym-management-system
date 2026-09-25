<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Member.php";

require_once __DIR__ . "/../../helpers/Permissions.php";

$auth = Permissions::requirePermission('delete_member');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    Response::error("Invalid member ID.", null, 400);
}

$db = (new Database())->getConnection();
$memberModel = new Member($db);

if ($memberModel->delete($id)) {
    Response::success("Member deleted successfully");
} else {
    Response::error("Failed to delete member.");
}

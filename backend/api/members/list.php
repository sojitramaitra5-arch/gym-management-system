<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Member.php";

JWT::requireAuth();

$search = isset($_GET['search']) ? $_GET['search'] : '';
$status = isset($_GET['status']) ? $_GET['status'] : '';

$db = (new Database())->getConnection();
$memberModel = new Member($db);
$members = $memberModel->getAll($search, $status);

Response::success("Members retrieved successfully", $members);

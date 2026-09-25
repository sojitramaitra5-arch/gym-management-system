<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

JWT::requireAuth();

$db = (new Database())->getConnection();

$stmt = $db->query("SELECT id, category_name, description FROM event_categories ORDER BY id ASC");
$categories = $stmt->fetchAll();

Response::success("Event categories retrieved", $categories);

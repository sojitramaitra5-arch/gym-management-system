<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Plan.php";

JWT::requireAuth();

$db = (new Database())->getConnection();
$planModel = new Plan($db);
$plans = $planModel->getAll();

Response::success("Plans retrieved successfully", $plans);

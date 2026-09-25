<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Membership.php";

JWT::requireAuth();

$db = (new Database())->getConnection();
$membershipModel = new Membership($db);
$memberships = $membershipModel->getAll();

Response::success("Memberships retrieved successfully", $memberships);

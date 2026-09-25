<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Offer.php";

$auth = JWT::requireAuth(); // Accessible by both Admin and Member

$status = isset($_GET['status']) ? trim($_GET['status']) : '';

$db = (new Database())->getConnection();
$offerModel = new Offer($db);
$offers = $offerModel->getAll($status);

Response::success("Offers fetched successfully", $offers);

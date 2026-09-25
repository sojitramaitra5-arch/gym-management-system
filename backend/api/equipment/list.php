<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Equipment.php";

$auth = JWT::requireAuth(); // Accessible by both Admin and Member

$room     = isset($_GET['room_name']) ? trim($_GET['room_name']) : '';
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$search   = isset($_GET['search']) ? trim($_GET['search']) : '';

$db = (new Database())->getConnection();
$equipModel = new Equipment($db);

$equipment = $equipModel->getAll($room, $category, $search);
$rooms = $equipModel->getRoomsWithStats();
$summary = $equipModel->getSummary();

Response::success("Equipment data fetched successfully", array(
    'equipment' => $equipment,
    'rooms'     => $rooms,
    'summary'   => $summary
));

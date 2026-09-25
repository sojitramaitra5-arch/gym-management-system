<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Product.php";

$auth = JWT::requireAuth(); // Both Admin & Member can browse products

$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$search   = isset($_GET['search']) ? trim($_GET['search']) : '';

$db = (new Database())->getConnection();
$productModel = new Product($db);
$products = $productModel->getAll($category, $search);

Response::success("Products fetched successfully", $products);

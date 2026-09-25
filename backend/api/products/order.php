<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";
require_once __DIR__ . "/../../models/Product.php";

$auth = JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$memberId = isset($auth['member_id']) ? (int)$auth['member_id'] : (isset($auth['user_id']) ? (int)$auth['user_id'] : 0);

if (!$memberId) {
    Response::error("Authentication required.", null, 401);
}

$items = array();
if (!empty($input['items']) && is_array($input['items'])) {
    foreach ($input['items'] as $item) {
        $pId = isset($item['product_id']) ? (int)$item['product_id'] : 0;
        $qty = isset($item['quantity']) ? max(1, (int)$item['quantity']) : 1;
        if ($pId > 0) {
            $items[] = array('product_id' => $pId, 'quantity' => $qty);
        }
    }
} elseif (!empty($input['product_id'])) {
    $items[] = array(
        'product_id' => (int)$input['product_id'],
        'quantity'   => isset($input['quantity']) ? max(1, (int)$input['quantity']) : 1
    );
}

if (empty($items)) {
    Response::error("Product items are required.", null, 422);
}

$db = (new Database())->getConnection();
$productModel = new Product($db);

$createdOrders = array();
foreach ($items as $item) {
    $orderId = $productModel->createOrder($memberId, $item['product_id'], $item['quantity']);
    if ($orderId) {
        $createdOrders[] = $orderId;
    }
}

if (!empty($createdOrders)) {
    Response::success("Order request placed successfully! You can collect it at the gym front desk.", array(
        'order_ids' => $createdOrders,
        'count'     => count($createdOrders)
    ), 201);
} else {
    Response::error("Failed to place product order request.");
}

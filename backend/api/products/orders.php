<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

$auth = JWT::requireAuth();

if (!isset($auth['role']) || $auth['role'] !== 'admin') {
    Response::error("Access denied. Administrator privileges required.", null, 403);
}

$db = (new Database())->getConnection();

// GET: Retrieve all member supplement reservations / orders
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $statusFilter = isset($_GET['status']) ? trim($_GET['status']) : '';
    
    $query = "
        SELECT po.id, po.member_id, po.product_id, po.quantity, po.total_amount, po.status, po.order_date,
               m.name AS member_name, m.email AS member_email, m.phone AS member_phone,
               p.name AS product_name, p.category AS product_category, p.brand, p.flavor, p.weight_size, p.image_url
        FROM product_orders po
        JOIN members m ON po.member_id = m.id
        JOIN products p ON po.product_id = p.id
        WHERE 1=1
    ";
    
    $params = array();
    if (!empty($statusFilter) && $statusFilter !== 'all') {
        $query .= " AND po.status = :status";
        $params[':status'] = $statusFilter;
    }
    
    $query .= " ORDER BY po.id DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $orders = $stmt->fetchAll();
    
    Response::success("Product orders retrieved successfully", $orders);
}

// POST: Update status of a product reservation
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    $orderId = isset($input['order_id']) ? (int)$input['order_id'] : (isset($input['id']) ? (int)$input['id'] : 0);
    $newStatus = isset($input['status']) ? trim($input['status']) : '';
    
    $allowedStatuses = array('requested', 'ready_for_pickup', 'completed', 'cancelled');
    
    if ($orderId <= 0 || !in_array($newStatus, $allowedStatuses)) {
        Response::error("Valid order_id and status ('requested', 'ready_for_pickup', 'completed', 'cancelled') are required.", null, 422);
    }
    
    $stmt = $db->prepare("UPDATE product_orders SET status = :status WHERE id = :id");
    $updated = $stmt->execute(array(
        ':status' => $newStatus,
        ':id'     => $orderId
    ));
    
    if ($updated) {
        Response::success("Order #{$orderId} status updated to '{$newStatus}' successfully.");
    } else {
        Response::error("Failed to update order status.");
    }
}

Response::error("Method Not Allowed", null, 405);

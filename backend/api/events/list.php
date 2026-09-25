<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

JWT::requireAuth();

$db = (new Database())->getConnection();

$search     = isset($_GET['search']) ? trim($_GET['search']) : '';
$categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
$status     = isset($_GET['status']) ? trim($_GET['status']) : '';

$query = "SELECT e.*, c.category_name,
                 (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id AND r.status = 'registered') AS current_registered,
                 (e.max_capacity - (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.id AND r.status = 'registered')) AS seats_left
          FROM events e
          LEFT JOIN event_categories c ON e.category_id = c.id
          WHERE 1=1";

$params = array();

if (!empty($search)) {
    $query .= " AND (e.title LIKE :search1 OR e.instructor_name LIKE :search2 OR e.location LIKE :search3)";
    $params[':search1'] = "%{$search}%";
    $params[':search2'] = "%{$search}%";
    $params[':search3'] = "%{$search}%";
}

if ($categoryId > 0) {
    $query .= " AND e.category_id = :cat_id";
    $params[':cat_id'] = $categoryId;
}

if (!empty($status)) {
    $query .= " AND e.status = :status";
    $params[':status'] = $status;
}

$query .= " ORDER BY e.event_date ASC, e.start_time ASC";

$stmt = $db->prepare($query);
$stmt->execute($params);
$events = $stmt->fetchAll();

Response::success("Events retrieved successfully", $events);

<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

// Enforce JWT Authentication
JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$categoryId     = isset($input['category_id']) ? (int)$input['category_id'] : 0;
$title          = isset($input['title']) ? trim($input['title']) : '';
$description    = isset($input['description']) ? trim($input['description']) : '';
$instructorName = isset($input['instructor_name']) ? trim($input['instructor_name']) : '';
$eventDate      = isset($input['event_date']) ? trim($input['event_date']) : '';
$startTime      = isset($input['start_time']) ? trim($input['start_time']) : '';
$endTime        = isset($input['end_time']) ? trim($input['end_time']) : '';
$location       = isset($input['location']) && !empty($input['location']) ? trim($input['location']) : 'Main Fitness Studio';
$maxCapacity    = isset($input['max_capacity']) ? (int)$input['max_capacity'] : 20;

if (empty($title) || empty($instructorName) || empty($eventDate) || empty($startTime) || empty($endTime) || $categoryId <= 0) {
    Response::error("Title, category, coach name, event date, and time slots are required.", null, 422);
}

if ($maxCapacity < 1) {
    $maxCapacity = 20;
}

$db = (new Database())->getConnection();

try {
    // Validate category exists
    $catStmt = $db->prepare("SELECT id FROM event_categories WHERE id = :cid LIMIT 1");
    $catStmt->execute(array(':cid' => $categoryId));
    if (!$catStmt->fetch()) {
        Response::error("Specified category does not exist.", null, 404);
    }

    $stmt = $db->prepare("
        INSERT INTO events (category_id, title, description, instructor_name, event_date, start_time, end_time, location, max_capacity, registered_count, status)
        VALUES (:category_id, :title, :description, :instructor_name, :event_date, :start_time, :end_time, :location, :max_capacity, 0, 'scheduled')
    ");

    $success = $stmt->execute(array(
        ':category_id'     => $categoryId,
        ':title'           => $title,
        ':description'     => $description,
        ':instructor_name' => $instructorName,
        ':event_date'      => $eventDate,
        ':start_time'      => $startTime,
        ':end_time'        => $endTime,
        ':location'        => $location,
        ':max_capacity'    => $maxCapacity
    ));

    if ($success) {
        $eventId = (int)$db->lastInsertId();
        Response::success("Event scheduled successfully", array('id' => $eventId), 201);
    } else {
        Response::error("Failed to create event", null, 500);
    }
} catch (PDOException $e) {
    Response::error("Database error while creating event", null, 500);
}

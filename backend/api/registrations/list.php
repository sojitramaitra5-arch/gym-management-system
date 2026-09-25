<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

// Enforce JWT Authentication to protect member contact information (PII)
JWT::requireAuth();

$eventId = isset($_GET['event_id']) ? (int)$_GET['event_id'] : 0;

if ($eventId <= 0) {
    Response::error("event_id is required", null, 422);
}

$db = (new Database())->getConnection();

try {
    $stmt = $db->prepare("
        SELECT r.id as registration_id, r.registration_date, r.status as registration_status, r.notes,
               m.id as member_id, m.name as member_name, m.email as member_email, m.phone as member_phone, m.gender
        FROM event_registrations r
        JOIN members m ON r.member_id = m.id
        WHERE r.event_id = :eid AND r.status = 'registered'
        ORDER BY r.registration_date DESC
    ");
    $stmt->execute(array(':eid' => $eventId));
    $attendees = $stmt->fetchAll();

    Response::success("Attendees retrieved", $attendees);
} catch (PDOException $e) {
    Response::error("Database error while fetching attendees", null, 500);
}

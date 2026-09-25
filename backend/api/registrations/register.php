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
$eventId  = isset($input['event_id']) ? (int)$input['event_id'] : 0;
$memberId = isset($input['member_id']) ? (int)$input['member_id'] : 0;
$notes    = isset($input['notes']) ? trim($input['notes']) : '';

if ($eventId <= 0 || $memberId <= 0) {
    Response::error("Both event_id and member_id are required.", null, 422);
}

$db = (new Database())->getConnection();

try {
    $db->beginTransaction();

    // 1. Check member exists and is active
    $mStmt = $db->prepare("SELECT id, name, status FROM members WHERE id = :mid LIMIT 1");
    $mStmt->execute(array(':mid' => $memberId));
    $member = $mStmt->fetch();

    if (!$member) {
        $db->rollBack();
        Response::error("Member record not found.", null, 404);
    }

    // 2. Check event status & capacity (Lock row for update)
    $stmt = $db->prepare("SELECT id, title, max_capacity, status FROM events WHERE id = :id LIMIT 1 FOR UPDATE");
    $stmt->execute(array(':id' => $eventId));
    $event = $stmt->fetch();

    if (!$event) {
        $db->rollBack();
        Response::error("Event not found.", null, 404);
    }

    if ($event['status'] === 'cancelled') {
        $db->rollBack();
        Response::error("This event is cancelled. Bookings are closed.", null, 400);
    }

    // 3. Check existing registration
    $checkStmt = $db->prepare("SELECT id, status FROM event_registrations WHERE event_id = :eid AND member_id = :mid LIMIT 1");
    $checkStmt->execute(array(':eid' => $eventId, ':mid' => $memberId));
    $existing = $checkStmt->fetch();

    if ($existing && $existing['status'] === 'registered') {
        $db->rollBack();
        Response::error("This member is already registered for this event.", null, 409);
    }

    // 4. Check current enrolled count
    $countStmt = $db->prepare("SELECT COUNT(*) as enrolled FROM event_registrations WHERE event_id = :eid AND status = 'registered'");
    $countStmt->execute(array(':eid' => $eventId));
    $countRow = $countStmt->fetch();
    $currentEnrolled = $countRow ? (int)$countRow['enrolled'] : 0;

    if ($currentEnrolled >= (int)$event['max_capacity']) {
        $db->rollBack();
        Response::error("Sorry, this event is already fully booked!", null, 400);
    }

    if ($existing) {
        // Reactivate registration
        $upd = $db->prepare("UPDATE event_registrations SET status = 'registered', registration_date = NOW(), notes = :notes WHERE id = :id");
        $upd->execute(array(':notes' => $notes, ':id' => $existing['id']));
    } else {
        // Insert new registration
        $ins = $db->prepare("INSERT INTO event_registrations (event_id, member_id, status, notes) VALUES (:eid, :mid, 'registered', :notes)");
        $ins->execute(array(':eid' => $eventId, ':mid' => $memberId, ':notes' => $notes));
    }

    // 5. Update registered_count cache column with actual recount
    $recountStmt = $db->prepare("SELECT COUNT(*) as cnt FROM event_registrations WHERE event_id = :eid AND status = 'registered'");
    $recountStmt->execute(array(':eid' => $eventId));
    $recountRow = $recountStmt->fetch();
    $newCount = $recountRow ? (int)$recountRow['cnt'] : ($currentEnrolled + 1);

    $updCount = $db->prepare("UPDATE events SET registered_count = :cnt WHERE id = :eid");
    $updCount->execute(array(':cnt' => $newCount, ':eid' => $eventId));

    $db->commit();

    Response::success("Member " . $member['name'] . " successfully enrolled in " . $event['title'], array(
        'event_id'         => $eventId,
        'member_id'        => $memberId,
        'registered_count' => $newCount
    ), 201);

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error("Database error processing enrollment", null, 500);
}

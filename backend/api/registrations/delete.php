<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

// Enforce JWT Authentication
JWT::requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error("Method Not Allowed", null, 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$regId    = isset($input['registration_id']) ? (int)$input['registration_id'] : 0;
$eventId  = isset($input['event_id']) ? (int)$input['event_id'] : 0;
$memberId = isset($input['member_id']) ? (int)$input['member_id'] : 0;

if ($regId <= 0 && ($eventId <= 0 || $memberId <= 0)) {
    Response::error("registration_id OR both (event_id and member_id) are required.", null, 422);
}

$db = (new Database())->getConnection();

try {
    $db->beginTransaction();

    $targetEventId = $eventId;

    if ($regId > 0) {
        // Fetch event_id before deleting
        $fStmt = $db->prepare("SELECT event_id FROM event_registrations WHERE id = :id LIMIT 1");
        $fStmt->execute(array(':id' => $regId));
        $row = $fStmt->fetch();
        if ($row) {
            $targetEventId = (int)$row['event_id'];
        }

        $stmt = $db->prepare("DELETE FROM event_registrations WHERE id = :id");
        $stmt->execute(array(':id' => $regId));
    } else {
        $stmt = $db->prepare("DELETE FROM event_registrations WHERE event_id = :eid AND member_id = :mid");
        $stmt->execute(array(':eid' => $eventId, ':mid' => $memberId));
    }

    if ($targetEventId > 0) {
        $cStmt = $db->prepare("SELECT COUNT(*) as cnt FROM event_registrations WHERE event_id = :eid AND status = 'registered'");
        $cStmt->execute(array(':eid' => $targetEventId));
        $cRow = $cStmt->fetch();
        $cnt = $cRow ? (int)$cRow['cnt'] : 0;

        $upd = $db->prepare("UPDATE events SET registered_count = :cnt WHERE id = :eid");
        $upd->execute(array(':cnt' => $cnt, ':eid' => $targetEventId));
    }

    $db->commit();
    Response::success("Registration removed successfully");

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    Response::error("Database error while removing registration", null, 500);
}

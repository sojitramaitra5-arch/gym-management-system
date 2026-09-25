<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

$auth = JWT::requireAuth();

// Determine member id
$memberId = isset($auth['member_id']) ? (int)$auth['member_id'] : (isset($auth['user_id']) ? (int)$auth['user_id'] : 0);

if (!$memberId) {
    Response::error("Member identifier not found in token.", null, 400);
}

$db = (new Database())->getConnection();

// 1. Fetch Member details
$mStmt = $db->prepare("SELECT id, name, email, phone, gender, join_date, status, created_at FROM members WHERE id = :id LIMIT 1");
$mStmt->execute(array(':id' => $memberId));
$member = $mStmt->fetch();

if (!$member) {
    Response::error("Member record not found.", null, 404);
}

// 2. Fetch Active or Latest Membership
$memStmt = $db->prepare("
    SELECT ms.*, p.plan_name, p.duration,
           DATEDIFF(ms.end_date, CURDATE()) as days_remaining,
           CASE 
               WHEN ms.end_date >= CURDATE() THEN 'Active'
               ELSE 'Expired'
           END AS current_status
    FROM memberships ms
    JOIN plans p ON ms.plan_id = p.id
    WHERE ms.member_id = :member_id
    ORDER BY ms.id DESC
    LIMIT 1
");
$memStmt->execute(array(':member_id' => $memberId));
$activeMembership = $memStmt->fetch();

// 3. Fetch Event Registrations for this member
$evStmt = $db->prepare("
    SELECT er.id as registration_id, er.status as registration_status, er.registration_date,
           e.id as event_id, e.title as event_title, e.event_date, e.start_time, e.end_time, e.location, e.instructor_name
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    WHERE er.member_id = :member_id
    ORDER BY e.event_date ASC
");
$evStmt->execute(array(':member_id' => $memberId));
$registeredEvents = $evStmt->fetchAll();

// 4. Fetch Active Offers Count
$offStmt = $db->query("SELECT COUNT(*) as total_offers FROM offers WHERE status = 'active' AND valid_until >= CURDATE()");
$offRow = $offStmt->fetch();

// 5. Fetch Total Equipment Count in Gym
$eqStmt = $db->query("SELECT COALESCE(SUM(quantity), 0) as total_machines, COUNT(DISTINCT room_name) as total_rooms FROM equipment WHERE condition_status = 'Working'");
$eqRow = $eqStmt->fetch();

Response::success("Member profile fetched successfully", array(
    'member'             => $member,
    'membership'         => $activeMembership ? $activeMembership : null,
    'registered_events'  => $registeredEvents,
    'total_active_offers'=> (int)$offRow['total_offers'],
    'gym_active_machines'=> (int)$eqRow['total_machines'],
    'gym_rooms_count'    => (int)$eqRow['total_rooms']
));

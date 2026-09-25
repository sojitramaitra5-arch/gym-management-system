<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

JWT::requireAuth();

$db = (new Database())->getConnection();

// 1. Total Members
$totalMembersStmt = $db->query("SELECT COUNT(*) FROM members");
$totalMembers = (int)$totalMembersStmt->fetchColumn();

// 2. Active Members (whose current membership end_date >= today)
$activeMembersStmt = $db->query("SELECT COUNT(DISTINCT member_id) FROM memberships WHERE end_date >= CURDATE()");
$activeMembers = (int)$activeMembersStmt->fetchColumn();

// 3. Expired Members (members without any active plan)
$expiredMembersStmt = $db->query("
    SELECT COUNT(*) FROM members 
    WHERE id NOT IN (SELECT DISTINCT member_id FROM memberships WHERE end_date >= CURDATE())
");
$expiredMembers = (int)$expiredMembersStmt->fetchColumn();

// 4. Total Plans
$totalPlansStmt = $db->query("SELECT COUNT(*) FROM plans");
$totalPlans = (int)$totalPlansStmt->fetchColumn();

// 5. Total Revenue (sum of all membership fees collected)
$revenueStmt = $db->query("SELECT COALESCE(SUM(amount), 0) FROM memberships");
$totalRevenue = (float)$revenueStmt->fetchColumn();

// Recent Memberships / Payments
$recentStmt = $db->query("
    SELECT ms.id, ms.amount, ms.payment_method, ms.start_date, ms.end_date, ms.created_at,
           m.name AS member_name, m.email AS member_email,
           p.plan_name,
           CASE 
               WHEN ms.end_date >= CURDATE() THEN 'Active'
               ELSE 'Expired'
           END AS status
    FROM memberships ms
    JOIN members m ON ms.member_id = m.id
    JOIN plans p ON ms.plan_id = p.id
    ORDER BY ms.id DESC
    LIMIT 5
");
$recentMemberships = $recentStmt->fetchAll();

Response::success("Dashboard metrics retrieved", array(
    'total_members'       => $totalMembers,
    'active_members'      => $activeMembers,
    'expired_members'     => $expiredMembers,
    'total_plans'         => $totalPlans,
    'total_revenue'       => $totalRevenue,
    'recent_memberships'  => $recentMemberships
));

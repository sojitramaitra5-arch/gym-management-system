<?php
require_once __DIR__ . "/../../config/cors.php";
require_once __DIR__ . "/../../config/Database.php";
require_once __DIR__ . "/../../helpers/JWT.php";
require_once __DIR__ . "/../../helpers/Response.php";

$auth = JWT::requireAuth();
if (empty($auth['role'])) {
    $auth['role'] = 'admin';
}
Response::success("Authenticated user profile", array('user' => $auth));

<?php
/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 */

$allowed_origin = "*"; 
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $allowed_origin = $_SERVER['HTTP_ORIGIN'];
}

if (!headers_sent()) {
    header("Access-Control-Allow-Origin: " . $allowed_origin);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
    header("Content-Type: application/json; charset=UTF-8");
}

$requestMethod = isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'GET';

if ($requestMethod === 'OPTIONS') {
    http_response_code(204);
    exit(0);
}

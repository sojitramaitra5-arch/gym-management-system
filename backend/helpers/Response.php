<?php
/**
 * Standardized API Response Helper
 * Compatible with PHP 5.5, 7.x, and 8.x
 */
class Response {
    public static function json($status, $message, $data = null, $httpCode = 200) {
        http_response_code($httpCode);
        echo json_encode(array(
            "status"  => $status,
            "message" => $message,
            "data"    => $data
        ));
        exit;
    }

    public static function success($message, $data = null, $httpCode = 200) {
        self::json("success", $message, $data, $httpCode);
    }

    public static function error($message, $data = null, $httpCode = 400) {
        self::json("error", $message, $data, $httpCode);
    }
}

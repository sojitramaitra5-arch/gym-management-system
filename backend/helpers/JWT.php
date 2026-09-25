<?php
/**
 * Lightweight Zero-Dependency JSON Web Token (JWT) Helper
 * Compatible with PHP 5.5, 7.x, and 8.x
 */
class JWT {
    private static $secret = "gymflow_super_secret_jwt_key_2026_x89f#9!";

    public static function setSecret($secret) {
        self::$secret = $secret;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function encode($payload, $expirySeconds = 86400) {
        $header = array('typ' => 'JWT', 'alg' => 'HS256');
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $expirySeconds;

        $encodedHeader = self::base64UrlEncode(json_encode($header));
        $encodedPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", self::$secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    public static function decode($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        $encodedHeader = $parts[0];
        $encodedPayload = $parts[1];
        $encodedSignature = $parts[2];

        $expectedSig = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", self::$secret, true);
        $expectedEncodedSig = self::base64UrlEncode($expectedSig);

        // PHP 5.5 hash_equals compatibility
        $isValid = false;
        if (function_exists('hash_equals')) {
            $isValid = hash_equals($expectedEncodedSig, $encodedSignature);
        } else {
            $isValid = ($expectedEncodedSig === $encodedSignature);
        }

        if (!$isValid) {
            return null; // Invalid signature
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Expired or malformed
        }

        return $payload;
    }

    public static function getBearerToken() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["REDIRECT_HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public static function requireAuth() {
        $token = self::getBearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(array(
                "status" => "error",
                "message" => "Authorization header missing or invalid format.",
                "data" => null
            ));
            exit;
        }

        $decoded = self::decode($token);
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(array(
                "status" => "error",
                "message" => "Session expired or invalid token. Please log in again.",
                "data" => null
            ));
            exit;
        }

        return $decoded;
    }

    public static function requireRole($allowedRoles) {
        $user = self::requireAuth();
        $userRole = isset($user['role']) ? $user['role'] : '';

        if (is_array($allowedRoles)) {
            if (!in_array($userRole, $allowedRoles)) {
                http_response_code(403);
                header("Content-Type: application/json; charset=UTF-8");
                echo json_encode(array(
                    "status" => "error",
                    "message" => "Access Denied: Restricted to roles [" . implode(', ', $allowedRoles) . "].",
                    "data" => null
                ));
                exit;
            }
        } elseif ($userRole !== $allowedRoles) {
            http_response_code(403);
            header("Content-Type: application/json; charset=UTF-8");
            echo json_encode(array(
                "status" => "error",
                "message" => "Access Denied: Restricted to role [{$allowedRoles}].",
                "data" => null
            ));
            exit;
        }

        return $user;
    }
}


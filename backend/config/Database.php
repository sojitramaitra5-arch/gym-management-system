<?php
/**
 * Database Connection Manager (PDO)
 * Compatible with PHP 5.5, 7.x, and 8.x
 */
class Database {
    private $host = "127.0.0.1";
    private $db_name = "gym_management";
    private $username = "root";
    private $password = "";
    private $port = 3306;
    private $conn = null;

    public function __construct() {
        // Load environment overrides if defined
        if (getenv('DB_HOST')) $this->host = getenv('DB_HOST');
        if (getenv('DB_NAME')) $this->db_name = getenv('DB_NAME');
        if (getenv('DB_USER')) $this->username = getenv('DB_USER');
        if (getenv('DB_PASS') !== false) $this->password = getenv('DB_PASS');
        if (getenv('DB_PORT')) $this->port = (int)getenv('DB_PORT');
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $options = array(
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Enforce true prepared statements
            );
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array(
                "status"  => "error",
                "message" => "Database connection error: " . $e->getMessage(),
                "data"    => null
            ));
            exit;
        }
        return $this->conn;
    }
}

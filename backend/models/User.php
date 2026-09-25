<?php
/**
 * User / Admin Model
 * Simple Admin management for College Project
 */
class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function findByEmail($email) {
        $stmt = $this->conn->prepare("SELECT id, name, email, password FROM {$this->table} WHERE email = :email LIMIT 1");
        $stmt->execute(array(':email' => $email));
        $user = $stmt->fetch();
        return $user ? $user : null;
    }

    public function findById($id) {
        $stmt = $this->conn->prepare("SELECT id, name, email, created_at FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->execute(array(':id' => $id));
        $user = $stmt->fetch();
        return $user ? $user : null;
    }

    public function create($name, $email, $password) {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->conn->prepare("INSERT INTO {$this->table} (name, email, password) VALUES (:name, :email, :password)");
        if ($stmt->execute(array(':name' => $name, ':email' => $email, ':password' => $hash))) {
            return (int)$this->conn->lastInsertId();
        }
        return false;
    }
}

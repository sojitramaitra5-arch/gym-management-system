<?php
/**
 * Plan Model
 * Simple Plan management for College Project
 */
class Plan {
    private $conn;
    private $table = "plans";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->query("SELECT id, plan_name, duration, price, created_at FROM {$this->table} ORDER BY price ASC");
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT id, plan_name, duration, price, created_at FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->execute(array(':id' => $id));
        $plan = $stmt->fetch();
        return $plan ? $plan : null;
    }

    public function create($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (plan_name, duration, price)
            VALUES (:plan_name, :duration, :price)
        ");
        $success = $stmt->execute(array(
            ':plan_name' => $data['plan_name'],
            ':duration'  => (int)$data['duration'],
            ':price'     => (float)$data['price']
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET plan_name = :plan_name,
                duration = :duration,
                price = :price
            WHERE id = :id
        ");
        return $stmt->execute(array(
            ':id'        => $id,
            ':plan_name' => $data['plan_name'],
            ':duration'  => (int)$data['duration'],
            ':price'     => (float)$data['price']
        ));
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }
}

<?php
/**
 * Membership Model
 * Simple Membership & Payment management for College Project
 */
class Membership {
    private $conn;
    private $table = "memberships";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $query = "
            SELECT ms.id, ms.member_id, ms.plan_id, ms.start_date, ms.end_date, 
                   ms.amount, ms.payment_method, ms.created_at,
                   m.name AS member_name, m.email AS member_email, m.phone AS member_phone,
                   p.plan_name, p.duration,
                   CASE 
                       WHEN ms.end_date >= CURDATE() THEN 'Active'
                       ELSE 'Expired'
                   END AS status
            FROM {$this->table} ms
            JOIN members m ON ms.member_id = m.id
            JOIN plans p ON ms.plan_id = p.id
            ORDER BY ms.id DESC
        ";
        $stmt = $this->conn->query($query);
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "
            SELECT ms.*, m.name AS member_name, p.plan_name, p.duration
            FROM {$this->table} ms
            JOIN members m ON ms.member_id = m.id
            JOIN plans p ON ms.plan_id = p.id
            WHERE ms.id = :id
            LIMIT 1
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array(':id' => $id));
        return $stmt->fetch();
    }

    public function getActiveMembership($memberId, $startDate = null) {
        if (!$startDate) {
            $startDate = date('Y-m-d');
        }
        $query = "
            SELECT ms.id, ms.member_id, ms.plan_id, ms.start_date, ms.end_date,
                   m.name AS member_name, p.plan_name
            FROM {$this->table} ms
            JOIN members m ON ms.member_id = m.id
            JOIN plans p ON ms.plan_id = p.id
            WHERE ms.member_id = :member_id
              AND ms.end_date >= :start_date
            ORDER BY ms.end_date DESC
            LIMIT 1
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array(
            ':member_id'   => (int)$memberId,
            ':start_date'  => $startDate
        ));
        return $stmt->fetch();
    }

    public function create($data) {
        // Automatically fetch plan duration and price if amount/end_date not provided
        $planStmt = $this->conn->prepare("SELECT duration, price FROM plans WHERE id = :plan_id LIMIT 1");
        $planStmt->execute(array(':plan_id' => $data['plan_id']));
        $plan = $planStmt->fetch();

        if (!$plan) {
            return false;
        }

        $startDate = !empty($data['start_date']) ? $data['start_date'] : date('Y-m-d');
        
        if (!empty($data['end_date'])) {
            $endDate = $data['end_date'];
        } else {
            $days = (int)$plan['duration'];
            $endDate = date('Y-m-d', strtotime("{$startDate} + {$days} days"));
        }

        $amount = isset($data['amount']) && (float)$data['amount'] > 0 ? (float)$data['amount'] : (float)$plan['price'];
        $paymentMethod = isset($data['payment_method']) ? strtolower($data['payment_method']) : 'cash';

        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (member_id, plan_id, start_date, end_date, amount, payment_method)
            VALUES (:member_id, :plan_id, :start_date, :end_date, :amount, :payment_method)
        ");

        $success = $stmt->execute(array(
            ':member_id'      => (int)$data['member_id'],
            ':plan_id'        => (int)$data['plan_id'],
            ':start_date'     => $startDate,
            ':end_date'       => $endDate,
            ':amount'         => $amount,
            ':payment_method' => $paymentMethod
        ));

        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }
}

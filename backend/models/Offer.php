<?php
/**
 * Offer Model
 * Gym Promotions, Deals & Coupons
 */
class Offer {
    private $conn;
    private $table = "offers";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($status = '') {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = array();

        if (!empty($status)) {
            $query .= " AND status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->execute(array(':id' => $id));
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (title, code, discount_percent, description, valid_until, badge, status)
            VALUES (:title, :code, :discount_percent, :description, :valid_until, :badge, :status)
        ");
        $success = $stmt->execute(array(
            ':title'            => $data['title'],
            ':code'             => strtoupper(trim($data['code'])),
            ':discount_percent' => (int)$data['discount_percent'],
            ':description'      => $data['description'],
            ':valid_until'      => $data['valid_until'],
            ':badge'            => isset($data['badge']) && !empty($data['badge']) ? $data['badge'] : 'HOT DEAL',
            ':status'           => isset($data['status']) ? $data['status'] : 'active'
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET title = :title,
                code = :code,
                discount_percent = :discount_percent,
                description = :description,
                valid_until = :valid_until,
                badge = :badge,
                status = :status
            WHERE id = :id
        ");
        return $stmt->execute(array(
            ':id'               => $id,
            ':title'            => $data['title'],
            ':code'             => strtoupper(trim($data['code'])),
            ':discount_percent' => (int)$data['discount_percent'],
            ':description'      => $data['description'],
            ':valid_until'      => $data['valid_until'],
            ':badge'            => isset($data['badge']) && !empty($data['badge']) ? $data['badge'] : 'HOT DEAL',
            ':status'           => isset($data['status']) ? $data['status'] : 'active'
        ));
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }
}

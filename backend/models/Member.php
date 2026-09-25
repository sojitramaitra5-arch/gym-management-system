<?php
/**
 * Member Model
 * Simple Member management for College Project
 */
class Member {
    private $conn;
    private $table = "members";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($search = '', $status = '') {
        $query = "SELECT m.id, m.name, m.email, m.phone, m.gender, m.join_date, m.status, m.created_at,
                         p.plan_name, ms.start_date, ms.end_date,
                         CASE 
                             WHEN ms.end_date >= CURDATE() THEN 'Active'
                             WHEN ms.end_date < CURDATE() THEN 'Expired'
                             ELSE 'No Plan'
                         END AS membership_status
                  FROM {$this->table} m
                  LEFT JOIN (
                      SELECT ms1.*
                      FROM memberships ms1
                      INNER JOIN (
                          SELECT member_id, MAX(id) as max_id FROM memberships GROUP BY member_id
                      ) ms2 ON ms1.id = ms2.max_id
                  ) ms ON m.id = ms.member_id
                  LEFT JOIN plans p ON ms.plan_id = p.id
                  WHERE 1=1";

        $params = array();
        if (!empty($search)) {
            $query .= " AND (m.name LIKE :search1 OR m.email LIKE :search2 OR m.phone LIKE :search3)";
            $params[':search1'] = "%{$search}%";
            $params[':search2'] = "%{$search}%";
            $params[':search3'] = "%{$search}%";
        }

        if (!empty($status)) {
            $query .= " AND m.status = :status";
            $params[':status'] = $status;
        }

        $query .= " ORDER BY m.id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute(array(':id' => $id));
        $member = $stmt->fetch();
        if (!$member) return null;

        // Fetch membership history
        $subStmt = $this->conn->prepare("
            SELECT ms.*, p.plan_name, p.duration 
            FROM memberships ms
            JOIN plans p ON ms.plan_id = p.id
            WHERE ms.member_id = :member_id
            ORDER BY ms.id DESC
        ");
        $subStmt->execute(array(':member_id' => $id));
        $member['memberships'] = $subStmt->fetchAll();

        return $member;
    }

    public function create($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (name, email, phone, gender, join_date, status)
            VALUES (:name, :email, :phone, :gender, :join_date, :status)
        ");
        $success = $stmt->execute(array(
            ':name'      => $data['name'],
            ':email'     => $data['email'],
            ':phone'     => $data['phone'],
            ':gender'    => isset($data['gender']) ? $data['gender'] : 'Male',
            ':join_date' => isset($data['join_date']) && !empty($data['join_date']) ? $data['join_date'] : date('Y-m-d'),
            ':status'    => isset($data['status']) ? $data['status'] : 'active'
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET name = :name,
                email = :email,
                phone = :phone,
                gender = :gender,
                join_date = :join_date,
                status = :status
            WHERE id = :id
        ");
        return $stmt->execute(array(
            ':id'        => $id,
            ':name'      => $data['name'],
            ':email'     => $data['email'],
            ':phone'     => $data['phone'],
            ':gender'    => isset($data['gender']) ? $data['gender'] : 'Male',
            ':join_date' => $data['join_date'],
            ':status'    => isset($data['status']) ? $data['status'] : 'active'
        ));
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }
}

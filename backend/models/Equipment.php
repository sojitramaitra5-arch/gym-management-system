<?php
/**
 * Equipment & Gym Rooms Model
 * Manages gym machines, counts, condition status, and room locations
 */
class Equipment {
    private $conn;
    private $table = "equipment";
    private $roomsTable = "gym_rooms";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($room = '', $category = '', $search = '') {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = array();

        if (!empty($room)) {
            $query .= " AND room_name = :room_name";
            $params[':room_name'] = $room;
        }

        if (!empty($category)) {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }

        if (!empty($search)) {
            $query .= " AND (name LIKE :search1 OR target_muscle LIKE :search2)";
            $params[':search1'] = "%{$search}%";
            $params[':search2'] = "%{$search}%";
        }

        $query .= " ORDER BY room_name ASC, id DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getRoomsWithStats() {
        $stmt = $this->conn->query("
            SELECT r.*,
                   COALESCE(SUM(e.quantity), 0) AS total_machines,
                   COUNT(e.id) AS equipment_types_count
            FROM {$this->roomsTable} r
            LEFT JOIN {$this->table} e ON r.room_name = e.room_name
            GROUP BY r.id, r.room_name, r.floor, r.description, r.created_at
            ORDER BY r.id ASC
        ");
        return $stmt->fetchAll();
    }

    public function getSummary() {
        $summary = array();

        // Total count of all machine units
        $stmt1 = $this->conn->query("SELECT COALESCE(SUM(quantity), 0) as total_units, COUNT(id) as total_types FROM {$this->table}");
        $row1 = $stmt1->fetch();
        $summary['total_units'] = (int)$row1['total_units'];
        $summary['total_types'] = (int)$row1['total_types'];

        // Working condition units
        $stmt2 = $this->conn->query("SELECT COALESCE(SUM(quantity), 0) as working_units FROM {$this->table} WHERE condition_status = 'Working'");
        $row2 = $stmt2->fetch();
        $summary['working_units'] = (int)$row2['working_units'];

        // Room count
        $stmt3 = $this->conn->query("SELECT COUNT(id) as total_rooms FROM {$this->roomsTable}");
        $row3 = $stmt3->fetch();
        $summary['total_rooms'] = (int)$row3['total_rooms'];

        return $summary;
    }

    public function create($data) {
        $stmt = $this->conn->prepare("
            INSERT INTO {$this->table} (name, room_name, category, quantity, condition_status, target_muscle, image_url)
            VALUES (:name, :room_name, :category, :quantity, :condition_status, :target_muscle, :image_url)
        ");
        $success = $stmt->execute(array(
            ':name'             => $data['name'],
            ':room_name'        => $data['room_name'],
            ':category'         => $data['category'],
            ':quantity'         => (int)$data['quantity'],
            ':condition_status' => isset($data['condition_status']) ? $data['condition_status'] : 'Working',
            ':target_muscle'    => isset($data['target_muscle']) ? $data['target_muscle'] : 'Full Body',
            ':image_url'         => isset($data['image_url']) ? $data['image_url'] : null
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET name = :name,
                room_name = :room_name,
                category = :category,
                quantity = :quantity,
                condition_status = :condition_status,
                target_muscle = :target_muscle,
                image_url = :image_url
            WHERE id = :id
        ");
        return $stmt->execute(array(
            ':id'               => $id,
            ':name'             => $data['name'],
            ':room_name'        => $data['room_name'],
            ':category'         => $data['category'],
            ':quantity'         => (int)$data['quantity'],
            ':condition_status' => isset($data['condition_status']) ? $data['condition_status'] : 'Working',
            ':target_muscle'    => isset($data['target_muscle']) ? $data['target_muscle'] : 'Full Body',
            ':image_url'         => isset($data['image_url']) ? $data['image_url'] : null
        ));
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }
}

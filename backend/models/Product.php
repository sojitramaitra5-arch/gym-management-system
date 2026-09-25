<?php
/**
 * Product / Supplement Model
 * Whey Protein, Creatine, BCAA, and Pre-workout products
 */
class Product {
    private $conn;
    private $table = "products";
    private $ordersTable = "product_orders";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($category = '', $search = '') {
        $query = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = array();

        if (!empty($category) && $category !== 'all') {
            $query .= " AND category = :category";
            $params[':category'] = $category;
        }

        if (!empty($search)) {
            $query .= " AND (name LIKE :search1 OR brand LIKE :search2 OR flavor LIKE :search3)";
            $params[':search1'] = "%{$search}%";
            $params[':search2'] = "%{$search}%";
            $params[':search3'] = "%{$search}%";
        }

        $query .= " ORDER BY id ASC";
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
            INSERT INTO {$this->table} (name, category, brand, flavor, weight_size, price, discount_price, stock, badge, image_url, description)
            VALUES (:name, :category, :brand, :flavor, :weight_size, :price, :discount_price, :stock, :badge, :image_url, :description)
        ");
        $success = $stmt->execute(array(
            ':name'           => $data['name'],
            ':category'       => $data['category'],
            ':brand'          => $data['brand'],
            ':flavor'         => isset($data['flavor']) && !empty($data['flavor']) ? $data['flavor'] : 'Unflavored',
            ':weight_size'    => $data['weight_size'],
            ':price'          => (float)$data['price'],
            ':discount_price' => (float)$data['discount_price'],
            ':stock'          => (int)$data['stock'],
            ':badge'          => isset($data['badge']) ? $data['badge'] : 'In Stock',
            ':image_url'      => isset($data['image_url']) ? $data['image_url'] : null,
            ':description'    => isset($data['description']) ? $data['description'] : ''
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare("
            UPDATE {$this->table}
            SET name = :name,
                category = :category,
                brand = :brand,
                flavor = :flavor,
                weight_size = :weight_size,
                price = :price,
                discount_price = :discount_price,
                stock = :stock,
                badge = :badge,
                image_url = :image_url,
                description = :description
            WHERE id = :id
        ");
        return $stmt->execute(array(
            ':id'             => $id,
            ':name'           => $data['name'],
            ':category'       => $data['category'],
            ':brand'          => $data['brand'],
            ':flavor'         => isset($data['flavor']) && !empty($data['flavor']) ? $data['flavor'] : 'Unflavored',
            ':weight_size'    => $data['weight_size'],
            ':price'          => (float)$data['price'],
            ':discount_price' => (float)$data['discount_price'],
            ':stock'          => (int)$data['stock'],
            ':badge'          => isset($data['badge']) ? $data['badge'] : 'In Stock',
            ':image_url'      => isset($data['image_url']) ? $data['image_url'] : null,
            ':description'    => isset($data['description']) ? $data['description'] : ''
        ));
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute(array(':id' => $id));
    }

    public function createOrder($memberId, $productId, $quantity) {
        $product = $this->getById($productId);
        if (!$product) return false;

        $totalAmount = (float)$product['discount_price'] * (int)$quantity;

        $stmt = $this->conn->prepare("
            INSERT INTO {$this->ordersTable} (member_id, product_id, quantity, total_amount, status)
            VALUES (:member_id, :product_id, :quantity, :total_amount, 'requested')
        ");
        $success = $stmt->execute(array(
            ':member_id'    => (int)$memberId,
            ':product_id'   => (int)$productId,
            ':quantity'     => (int)$quantity,
            ':total_amount' => $totalAmount
        ));
        return $success ? (int)$this->conn->lastInsertId() : false;
    }
}

<?php
/**
 * Role-Based Access Control Helper (Simplified for Admin-Only Project)
 */
class Permissions {
    public static function hasPermission($role, $permission) {
        return true;
    }

    public static function getPermissionsForRole($role = 'admin') {
        return array('admin_access', 'manage_members', 'manage_plans', 'manage_memberships', 'view_dashboard');
    }

    public static function requirePermission($permission = '', $userRole = null) {
        require_once __DIR__ . "/JWT.php";
        return JWT::requireAuth();
    }
}

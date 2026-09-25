// Client-side Role-Based Access Control (RBAC) definitions

export const ROLE_PERMISSIONS = {
  owner: [
    'view_members', 'add_member', 'edit_member', 'delete_member',
    'manage_attendance', 'manage_payments', 'view_reports', 'manage_expenses',
    'manage_trainers', 'manage_plans', 'manage_settings', 'manage_website',
    'manage_workouts', 'manage_diets', 'book_classes'
  ],
  admin: [
    'view_members', 'add_member', 'edit_member', 'delete_member',
    'manage_attendance', 'manage_payments', 'view_reports', 'manage_expenses',
    'manage_trainers', 'manage_plans', 'manage_settings', 'manage_website',
    'manage_workouts', 'manage_diets', 'book_classes'
  ],
  manager: [
    'view_members', 'add_member', 'edit_member',
    'manage_attendance', 'manage_payments', 'view_reports', 'book_classes'
  ],
  receptionist: [
    'view_members', 'add_member', 'edit_member',
    'manage_attendance', 'manage_payments', 'book_classes'
  ],
  trainer: [
    'manage_workouts', 'manage_diets', 'manage_attendance', 'book_classes'
  ],
  accountant: [
    'manage_payments', 'manage_expenses', 'view_reports'
  ],
  member: [
    'book_classes'
  ]
};

export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  // If user object already carries permissions list from API, check it
  if (Array.isArray(user.permissions)) {
    return user.permissions.includes(permission);
  }
  // Fallback to static mapping
  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  return rolePerms.includes(permission);
};

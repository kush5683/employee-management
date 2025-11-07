/**
 * Lightweight helpers that encapsulate all role/permission checks.
 * Keeping these in one place ensures both controllers and middleware behave
 * consistently as our JWT payload evolves.
 */

/**
 * @returns {boolean} true when the current user has manager scope.
 */
export function isManager(user) {
  return Boolean(user?.permissions?.scope === 'manager');
}

/**
 * Build a deduplicated list of employee ids the user is allowed to act on.
 * Managers can act on themselves + direct reports, employees only on self.
 */
export function getAccessibleEmployeeIds(user) {
  if (!user) return [];
  const ids = new Set();
  if (user.sub) {
    ids.add(user.sub);
  }
  if (isManager(user) && Array.isArray(user.permissions?.managedEmployeeIds)) {
    for (const id of user.permissions.managedEmployeeIds) {
      if (id) {
        ids.add(id);
      }
    }
  }
  return Array.from(ids);
}

/**
 * Convenience helper used by controllers to gate record-level access.
 */
export function canAccessEmployee(user, employeeId) {
  if (!employeeId) return false;
  return getAccessibleEmployeeIds(user).includes(employeeId);
}

/**
 * Create a typed error that the error middleware will convert into a
 * 403 response. Centralising this keeps controller logic tidy.
 */
export function forbidden(message = 'Insufficient permissions.') {
  const error = new Error(message);
  error.status = 403;
  return error;
}

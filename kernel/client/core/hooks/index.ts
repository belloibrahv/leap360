/**
 * Hooks Index
 * 
 * Central export point for all authentication and permission hooks.
 */

// Authentication hooks
export { useAuth, useAuthGuard, useAdminAccess } from './useAuth';
export { useEnhancedAuth } from './useEnhancedAuth';

// Permission hooks
export {
  usePermission,
  useMultiPermissionGuard,
  useResourceAccess,
  usePermissionGuard,
  useRoleGuard,
  useTenantAccess,
  useSchoolAccess,
  useStudentAccess,
  useAdminCheck,
  usePermissionEvaluation,
  useConditionalPermission,
  
  // Re-exported store hooks
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRole,
  useHasAnyRole,
  useIsAdminRole,
  useCanAccessTenant,
  useCanAccessSchool,
  useCanAccessStudent,
  usePermissions,
  useRoles,
  useTenantContext as usePermissionTenantContext,
  useSchoolContext as usePermissionSchoolContext,
  usePermissionLoading,
  usePermissionError,
  usePermissionEngine,
} from './usePermission';

// Tenant context hooks
export { 
  useTenantContext, 
  useTenantSwitcher, 
  useSchoolSwitcher 
} from './useTenantContext';
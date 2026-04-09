/**
 * Permission Hooks
 * 
 * React hooks for permission checking and access control.
 * Provides reactive permission state with real-time updates.
 */

import { useMemo } from 'react';
import { 
  usePermissionStore,
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRole,
  useHasAnyRole,
  useIsAdminRole,
  useCanAccessTenant,
  useCanAccessSchool,
  useCanAccessStudent,
  usePermissionEngine
} from '@/core/permissions/permissionStore';
import { 
  UserRole, 
  PermissionContext, 
  PermissionCheckResult 
} from '@/types';

/**
 * Main permission hook - provides all permission checking capabilities
 */
export function usePermission() {
  const store = usePermissionStore();
  
  return {
    // Basic permission checks
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    hasAllPermissions: store.hasAllPermissions,
    
    // Role checks
    hasRole: store.hasRole,
    hasAnyRole: store.hasAnyRole,
    isAdminRole: store.isAdminRole,
    
    // Context-aware checks
    canAccessTenant: store.canAccessTenant,
    canAccessSchool: store.canAccessSchool,
    canAccessStudent: store.canAccessStudent,
    
    // Advanced evaluation
    evaluatePermission: store.evaluatePermission,
    getAvailableActions: store.getAvailableActions,
    
    // State
    permissions: store.permissions,
    roles: store.roles,
    tenantContext: store.tenantContext,
    schoolContext: store.schoolContext,
    isLoading: store.isLoading,
    error: store.error,
  };
}

/**
 * Multi-permission guard hook - checks multiple permissions at once
 */
export function useMultiPermissionGuard(
  permissions: string[],
  mode: 'any' | 'all' = 'any'
) {
  const hasAnyPermission = useHasAnyPermission(permissions);
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  return useMemo(() => ({
    allowed: mode === 'any' ? hasAnyPermission : hasAllPermissions,
    permissions,
    mode,
  }), [hasAnyPermission, hasAllPermissions, permissions, mode]);
}

/**
 * Resource access hook - checks access to specific resources
 */
export function useResourceAccess(resource: string) {
  const engine = usePermissionEngine();
  
  return useMemo(() => {
    const availableActions = engine.getAvailableActions(resource);
    
    return {
      canRead: availableActions.includes('read'),
      canWrite: availableActions.includes('write'),
      canDelete: availableActions.includes('delete'),
      canAdmin: availableActions.includes('admin'),
      availableActions,
      
      // Helper methods
      can: (action: string) => availableActions.includes(action),
      hasAccess: availableActions.length > 0,
    };
  }, [engine, resource]);
}

/**
 * Permission guard hook with fallback content
 */
export function usePermissionGuard(
  permission: string,
  fallback?: React.ReactNode
) {
  const hasPermission = useHasPermission(permission);
  
  return useMemo(() => ({
    allowed: hasPermission,
    permission,
    fallback,
    
    // Render helper
    render: (children: React.ReactNode) => hasPermission ? children : fallback,
  }), [hasPermission, permission, fallback]);
}

/**
 * Role guard hook with fallback content
 */
export function useRoleGuard(
  roles: UserRole | UserRole[],
  fallback?: React.ReactNode
) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasAnyRole = useHasAnyRole(roleArray);
  
  return useMemo(() => ({
    allowed: hasAnyRole,
    roles: roleArray,
    fallback,
    
    // Render helper
    render: (children: React.ReactNode) => hasAnyRole ? children : fallback,
  }), [hasAnyRole, roleArray, fallback]);
}

/**
 * Tenant access hook - checks access to specific tenant
 */
export function useTenantAccess(tenantId?: string) {
  const canAccess = useCanAccessTenant(tenantId || '');
  const tenantContext = usePermissionStore((state) => state.tenantContext);
  
  return useMemo(() => ({
    canAccess: tenantId ? canAccess : false,
    isCurrentTenant: tenantContext?.id === tenantId,
    tenantId,
    tenantContext,
  }), [canAccess, tenantContext, tenantId]);
}

/**
 * School access hook - checks access to specific school
 */
export function useSchoolAccess(schoolId?: string) {
  const canAccess = useCanAccessSchool(schoolId || '');
  const schoolContext = usePermissionStore((state) => state.schoolContext);
  
  return useMemo(() => ({
    canAccess: schoolId ? canAccess : false,
    isCurrentSchool: schoolContext?.id === schoolId,
    schoolId,
    schoolContext,
  }), [canAccess, schoolContext, schoolId]);
}

/**
 * Student access hook - checks access to specific student
 */
export function useStudentAccess(studentId?: string) {
  const canAccess = useCanAccessStudent(studentId || '');
  
  return useMemo(() => ({
    canAccess: studentId ? canAccess : false,
    studentId,
  }), [canAccess, studentId]);
}

/**
 * Admin role check hook
 */
export function useAdminCheck() {
  const isAdmin = useIsAdminRole();
  const roles = usePermissionStore((state) => state.roles);
  
  return useMemo(() => ({
    isAdmin,
    isSuperAdmin: roles.includes(UserRole.SUPER_ADMIN),
    isTenantAdmin: roles.includes(UserRole.TENANT_ADMIN),
    isSchoolAdmin: roles.includes(UserRole.SCHOOL_ADMIN) || roles.includes(UserRole.PRINCIPAL),
    roles,
  }), [isAdmin, roles]);
}

/**
 * Permission evaluation hook for complex contexts
 */
export function usePermissionEvaluation(context: PermissionContext) {
  const engine = usePermissionEngine();
  
  return useMemo(() => {
    const result = engine.evaluatePermission(context);
    
    return {
      ...result,
      context,
      
      // Helper methods
      isAllowed: result.allowed,
      isDenied: !result.allowed,
      hasConditions: (result.conditions?.length || 0) > 0,
    };
  }, [engine, context]);
}

/**
 * Conditional permission hook - only checks permission when condition is met
 */
export function useConditionalPermission(
  permission: string,
  condition: boolean
) {
  const hasPermission = useHasPermission(permission);
  
  return useMemo(() => ({
    allowed: condition && hasPermission,
    permission,
    condition,
    hasPermission,
  }), [hasPermission, permission, condition]);
}

// Re-export store hooks for convenience
export {
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
  useTenantContextSelector as useTenantContext,
  useSchoolContextSelector as useSchoolContext,
  usePermissionLoading,
  usePermissionError,
  usePermissionEngine,
} from '@/core/permissions/permissionStore';
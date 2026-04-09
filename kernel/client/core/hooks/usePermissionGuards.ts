/**
 * Permission Guard Hooks
 * 
 * Specialized hooks for permission-based access control,
 * role guards, and context-aware authorization.
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserRole, 
  PermissionContext, 
  SchoolContext,
  PERMISSIONS 
} from '@/types';
import { usePermission, useEnhancedAuth } from './useEnhancedAuth';

/**
 * Permission guard hook return type
 */
export interface UsePermissionGuardReturn {
  hasPermission: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
}

/**
 * Role guard hook return type
 */
export interface UseRoleGuardReturn {
  hasRole: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
}

/**
 * Multi-role guard hook return type
 */
export interface UseMultiRoleGuardReturn {
  hasAccess: boolean;
  hasAllRoles: boolean;
  hasAnyRole: boolean;
  roleResults: Record<UserRole, boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
}

/**
 * Admin guard hook return type
 */
export interface UseAdminGuardReturn {
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
  adminLevel: 'super' | 'tenant' | 'school' | 'none';
}

/**
 * Tenant guard hook return type
 */
export interface UseTenantGuardReturn {
  canAccessTenant: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
  currentTenantId: string | null;
}

/**
 * School guard hook return type
 */
export interface UseSchoolGuardReturn {
  canAccessSchool: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  canAccess: boolean;
  schoolContext: SchoolContext | null;
}

/**
 * Hook for permission-based access control
 */
export function usePermissionGuard(permission: string): UsePermissionGuardReturn {
  const { hasPermission, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const canAccess = isAuthenticated && hasPermission(permission);
  
  return {
    hasPermission: canAccess,
    isAuthenticated,
    isLoading,
    canAccess,
  };
}

/**
 * Hook for role-based access control
 */
export function useRoleGuard(role: UserRole): UseRoleGuardReturn {
  const { hasRole, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const canAccess = isAuthenticated && hasRole(role);
  
  return {
    hasRole: canAccess,
    isAuthenticated,
    isLoading,
    canAccess,
  };
}

/**
 * Hook for multi-role access control
 */
export function useMultiRoleGuard(
  roles: UserRole[], 
  requireAll: boolean = false
): UseMultiRoleGuardReturn {
  const { hasRole, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  // Calculate individual role results
  const roleResults = useMemo(() => {
    const results: Record<UserRole, boolean> = {} as Record<UserRole, boolean>;
    roles.forEach(role => {
      results[role] = isAuthenticated && hasRole(role);
    });
    return results;
  }, [roles, isAuthenticated, hasRole]);

  // Calculate access levels
  const hasAllRoles = useMemo(() => {
    return roles.every(role => roleResults[role]);
  }, [roles, roleResults]);

  const hasAnyRole = useMemo(() => {
    return roles.some(role => roleResults[role]);
  }, [roles, roleResults]);

  const hasAccess = requireAll ? hasAllRoles : hasAnyRole;
  
  return {
    hasAccess,
    hasAllRoles,
    hasAnyRole,
    roleResults,
    isAuthenticated,
    isLoading,
    canAccess: hasAccess,
  };
}

/**
 * Hook for admin access control with level detection
 */
export function useAdminGuard(): UseAdminGuardReturn {
  const { isAdminRole, hasRole, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const isAdmin = isAuthenticated && isAdminRole();
  
  // Determine admin level
  const adminLevel = useMemo(() => {
    if (!isAuthenticated) return 'none';
    
    if (hasRole(UserRole.SUPER_ADMIN)) return 'super';
    if (hasRole(UserRole.TENANT_ADMIN)) return 'tenant';
    if (hasRole(UserRole.SCHOOL_ADMIN) || hasRole(UserRole.PRINCIPAL)) return 'school';
    
    return 'none';
  }, [isAuthenticated, hasRole]);
  
  return {
    isAdmin,
    isAuthenticated,
    isLoading,
    canAccess: isAdmin,
    adminLevel,
  };
}

/**
 * Hook for tenant access control
 */
export function useTenantGuard(tenantId: string): UseTenantGuardReturn {
  const { canAccessTenant, isLoading } = usePermission();
  const { isAuthenticated, currentTenant } = useEnhancedAuth();
  
  const canAccess = isAuthenticated && canAccessTenant(tenantId);
  
  return {
    canAccessTenant: canAccess,
    isAuthenticated,
    isLoading,
    canAccess,
    currentTenantId: currentTenant?.id || null,
  };
}

/**
 * Hook for school access control
 */
export function useSchoolGuard(schoolId: string): UseSchoolGuardReturn {
  const { canAccessSchool, isLoading } = usePermission();
  const { isAuthenticated, user } = useEnhancedAuth();
  
  const canAccess = isAuthenticated && canAccessSchool(schoolId);
  
  // Get school context if available
  const schoolContext = useMemo((): SchoolContext | null => {
    if (!user || !canAccess) return null;
    
    // For now, create a basic school context (TODO: implement proper school lookup)
    return {
      id: schoolId,
      name: `School ${schoolId}`,
      type: 'school',
      status: 'active',
    };
  }, [user, canAccess, schoolId]);
  
  return {
    canAccessSchool: canAccess,
    isAuthenticated,
    isLoading,
    canAccess,
    schoolContext,
  };
}

/**
 * Hook for resource-specific permission guards
 */
export function useResourceGuard(resource: string, action: string = 'read') {
  const { hasPermission, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const permission = `${resource}:${action}`;
  const canAccess = isAuthenticated && hasPermission(permission);
  
  return {
    canAccess,
    hasPermission: canAccess,
    isAuthenticated,
    isLoading,
    permission,
  };
}

/**
 * Hook for CRUD operation guards
 */
export function useCRUDGuard(resource: string) {
  const { hasPermission, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const canCreate = isAuthenticated && hasPermission(`${resource}:create`);
  const canRead = isAuthenticated && hasPermission(`${resource}:read`);
  const canUpdate = isAuthenticated && hasPermission(`${resource}:update`);
  const canDelete = isAuthenticated && hasPermission(`${resource}:delete`);
  
  const hasAnyAccess = canCreate || canRead || canUpdate || canDelete;
  const hasFullAccess = canCreate && canRead && canUpdate && canDelete;
  
  return {
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    hasAnyAccess,
    hasFullAccess,
    isAuthenticated,
    isLoading,
    permissions: {
      create: `${resource}:create`,
      read: `${resource}:read`,
      update: `${resource}:update`,
      delete: `${resource}:delete`,
    },
  };
}

/**
 * Hook for navigation guard with automatic redirection
 */
export function useNavigationGuard(options: {
  requiredPermission?: string;
  requiredRole?: UserRole;
  requiredTenant?: string;
  redirectTo?: string;
  onUnauthorized?: () => void;
} = {}) {
  const router = useRouter();
  const { hasPermission, hasRole, canAccessTenant, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const {
    requiredPermission,
    requiredRole,
    requiredTenant,
    redirectTo = '/unauthorized',
    onUnauthorized
  } = options;

  // Check all requirements
  const hasAccess = useMemo(() => {
    if (!isAuthenticated) return false;
    
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredTenant && !canAccessTenant(requiredTenant)) return false;
    
    return true;
  }, [
    isAuthenticated,
    requiredPermission,
    requiredRole,
    requiredTenant,
    hasPermission,
    hasRole,
    canAccessTenant
  ]);

  // Handle unauthorized access
  const handleUnauthorized = useCallback(() => {
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      router.push(redirectTo);
    }
  }, [onUnauthorized, router, redirectTo]);

  // Redirect if not authorized
  useCallback(() => {
    if (!isLoading && !hasAccess) {
      handleUnauthorized();
    }
  }, [isLoading, hasAccess, handleUnauthorized]);

  return {
    hasAccess,
    isAuthenticated,
    isLoading,
    canAccess: hasAccess,
    redirect: handleUnauthorized,
  };
}

/**
 * Hook for conditional rendering based on permissions
 */
export function useConditionalRender(conditions: {
  permission?: string;
  permissions?: string[];
  role?: UserRole;
  roles?: UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const {
    permission,
    permissions,
    role,
    roles,
    requireAll = false,
    fallback = null
  } = conditions;

  const shouldRender = useMemo(() => {
    if (!isAuthenticated) return false;
    
    // Check single permission
    if (permission && !hasPermission(permission)) return false;
    
    // Check multiple permissions
    if (permissions) {
      const hasPerms = requireAll 
        ? hasAllPermissions(permissions)
        : hasAnyPermission(permissions);
      if (!hasPerms) return false;
    }
    
    // Check single role
    if (role && !hasRole(role)) return false;
    
    // Check multiple roles
    if (roles) {
      const hasRoles = requireAll
        ? roles.every(r => hasRole(r))
        : hasAnyRole(roles);
      if (!hasRoles) return false;
    }
    
    return true;
  }, [
    isAuthenticated,
    permission,
    permissions,
    role,
    roles,
    requireAll,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole
  ]);

  return {
    shouldRender,
    fallback,
    canRender: shouldRender,
  };
}
/**
 * Enhanced Authentication React Hooks
 * 
 * Provides reactive authentication state and actions with multi-tenant support.
 * Implements comprehensive permission checking, tenant context management,
 * and real-time synchronization capabilities.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LoginRequest, 
  EnhancedUser, 
  TenantContext, 
  UserRole,
  AuthError,
  PermissionContext,
  SchoolContext,
  PERMISSIONS
} from '@/types';
import { 
  useEnhancedAuthStore,
  useAuthUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError as useAuthErrorStore,
  useCurrentTenant,
  useAvailableTenants,
  useSessionId
} from '../auth/store/enhancedAuthStore';
import { usePermissionStore, type PermissionStore } from '../permissions/permissionStore';

/**
 * Enhanced authentication hook return type
 */
export interface UseEnhancedAuthReturn {
  // State
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  currentTenant: TenantContext | null;
  availableTenants: TenantContext[];
  sessionId: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLastActivity: () => void;
  clearError: () => void;
  
  // Utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  getValidToken: () => Promise<string | null>;
}

/**
 * Permission hook return type
 */
export interface UsePermissionReturn {
  // Permission checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role checking
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdminRole: () => boolean;
  
  // Context-aware permissions
  canAccessTenant: (tenantId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  canAccessStudent: (studentId: string) => boolean;
  
  // Resource access
  canRead: (resource: string) => boolean;
  canWrite: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}

/**
 * Tenant context hook return type
 */
export interface UseTenantContextReturn {
  // Current context
  currentTenant: TenantContext | null;
  availableTenants: TenantContext[];
  
  // Actions
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantData: () => Promise<void>;
  
  // State
  isLoading: boolean;
  isSwitching: boolean;
  error: string | null;
  
  // Utilities
  hasMultipleTenants: boolean;
  canSwitchTenants: boolean;
  getTenantById: (tenantId: string) => TenantContext | null;
}

/**
 * Multi-permission guard hook return type
 */
export interface UseMultiPermissionGuardReturn {
  // Access control
  hasAccess: boolean;
  hasAllAccess: boolean;
  hasAnyAccess: boolean;
  
  // Individual permission results
  permissionResults: Record<string, boolean>;
  
  // State
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Utilities
  getMissingPermissions: () => string[];
  getGrantedPermissions: () => string[];
}

/**
 * Resource access hook return type
 */
export interface UseResourceAccessReturn {
  // Resource-specific access
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExecute: boolean;
  
  // Available actions
  availableActions: string[];
  
  // Context evaluation
  evaluateAccess: (action: string, context?: Partial<PermissionContext>) => boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
}

/**
 * Main enhanced authentication hook
 */
export function useEnhancedAuth(): UseEnhancedAuthReturn {
  const store = useEnhancedAuthStore();
  
  // Individual selectors for better performance
  const user = useAuthUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthErrorStore();
  const currentTenant = useCurrentTenant();
  const availableTenants = useAvailableTenants();
  const sessionId = useSessionId();

  // Initialize session on mount
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      store.initializeSession();
    }
  }, []);

  // Update last activity on user interaction
  useEffect(() => {
    const handleActivity = () => {
      if (isAuthenticated) {
        store.updateLastActivity();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated]);

  // Memoized utility functions
  const hasAnyRole = useCallback((roles: UserRole[]) => {
    return roles.some(role => store.hasRole(role));
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    currentTenant,
    availableTenants,
    sessionId,
    
    // Actions
    login: store.login,
    logout: store.logout,
    refreshToken: store.refreshToken,
    switchTenant: store.switchTenant,
    refreshProfile: store.refreshUserProfile,
    updateLastActivity: store.updateLastActivity,
    clearError: store.clearError,
    
    // Utilities
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    hasAnyRole,
    isAdmin: store.isAdmin,
    canAccessTenant: store.canAccessTenant,
    getValidToken: store.getValidToken,
  };
}

/**
 * Hook for authentication guard with enhanced redirect logic
 */
export function useEnhancedAuthGuard(options: {
  redirectTo?: string;
  requiredRole?: UserRole;
  requiredPermission?: string;
  requiredTenant?: string;
} = {}) {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasRole, 
    hasPermission, 
    canAccessTenant 
  } = useEnhancedAuth();
  const router = useRouter();
  
  const {
    redirectTo = '/',
    requiredRole,
    requiredPermission,
    requiredTenant
  } = options;

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
      return;
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    // Check tenant access requirement
    if (requiredTenant && !canAccessTenant(requiredTenant)) {
      router.push('/unauthorized');
      return;
    }
  }, [
    isAuthenticated, 
    isLoading, 
    user, 
    requiredRole, 
    requiredPermission, 
    requiredTenant,
    redirectTo
  ]);

  return { 
    isAuthenticated, 
    isLoading,
    hasAccess: isAuthenticated && 
      (!requiredRole || hasRole(requiredRole)) &&
      (!requiredPermission || hasPermission(requiredPermission)) &&
      (!requiredTenant || canAccessTenant(requiredTenant))
  };
}

/**
 * Hook for permission-based access control
 */
export function usePermissionGuard(permission: string) {
  const { hasPermission, isAuthenticated, isLoading } = useEnhancedAuth();
  
  return {
    hasPermission: isAuthenticated && hasPermission(permission),
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && hasPermission(permission),
  };
}

/**
 * Hook for role-based access control
 */
export function useRoleGuard(role: UserRole) {
  const { hasRole, isAuthenticated, isLoading } = useEnhancedAuth();
  
  return {
    hasRole: isAuthenticated && hasRole(role),
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && hasRole(role),
  };
}

/**
 * Hook for multi-role access control
 */
export function useMultiRoleGuard(roles: UserRole[], requireAll: boolean = false) {
  const { hasRole, hasAnyRole, isAuthenticated, isLoading } = useEnhancedAuth();
  
  const hasAccess = requireAll 
    ? roles.every(role => hasRole(role))
    : hasAnyRole(roles);
  
  return {
    hasAccess: isAuthenticated && hasAccess,
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && hasAccess,
  };
}

/**
 * Hook for admin access control
 */
export function useAdminGuard() {
  const { isAdmin, isAuthenticated, isLoading } = useEnhancedAuth();
  
  return {
    isAdmin: isAuthenticated && isAdmin(),
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && isAdmin(),
  };
}

/**
 * Hook for tenant access control
 */
export function useTenantGuard(tenantId: string) {
  const { canAccessTenant, isAuthenticated, isLoading } = useEnhancedAuth();
  
  return {
    canAccessTenant: isAuthenticated && canAccessTenant(tenantId),
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && canAccessTenant(tenantId),
  };
}

/**
 * Hook for multi-tenant context management
 */
export function useTenantContext() {
  const { 
    currentTenant, 
    availableTenants, 
    switchTenant, 
    isLoading,
    error 
  } = useEnhancedAuth();
  
  const [isSwitching, setIsSwitching] = useState(false);

  const handleTenantSwitch = useCallback(async (tenantId: string) => {
    if (tenantId === currentTenant?.id) return;
    
    setIsSwitching(true);
    try {
      await switchTenant(tenantId);
    } finally {
      setIsSwitching(false);
    }
  }, [currentTenant?.id, switchTenant]);

  return {
    currentTenant,
    availableTenants,
    switchTenant: handleTenantSwitch,
    isSwitching,
    isLoading,
    error,
    hasMultipleTenants: availableTenants.length > 1,
  };
}

/**
 * Hook for session management
 */
export function useSession() {
  const { 
    sessionId, 
    user, 
    isAuthenticated, 
    updateLastActivity,
    refreshProfile 
  } = useEnhancedAuth();

  const [sessionExpiry, setSessionExpiry] = useState<number | null>(null);

  // Calculate session expiry based on last activity
  useEffect(() => {
    if (user?.sessionInfo.lastActivity) {
      // Assume 24 hour session timeout
      const expiryTime = user.sessionInfo.lastActivity + (24 * 60 * 60 * 1000);
      setSessionExpiry(expiryTime);
    }
  }, [user?.sessionInfo.lastActivity]);

  const isSessionExpired = sessionExpiry ? Date.now() > sessionExpiry : false;

  return {
    sessionId,
    sessionExpiry,
    isSessionExpired,
    lastActivity: user?.sessionInfo.lastActivity || 0,
    deviceInfo: user?.sessionInfo.deviceInfo,
    updateLastActivity,
    refreshProfile,
    isAuthenticated,
  };
}

/**
 * Hook for enhanced authentication error handling
 */
export function useEnhancedAuthError() {
  const { error, clearError } = useEnhancedAuth();
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());

  const dismissError = useCallback((errorCode?: string) => {
    if (errorCode) {
      setDismissedErrors(prev => new Set(prev).add(errorCode));
    }
    clearError();
  }, [clearError]);

  const shouldShowError = error && !dismissedErrors.has(error.code);

  return {
    error,
    shouldShowError,
    dismissError,
    clearError,
    isRetryable: error?.retryable || false,
  };
}

/**
 * Enhanced permission hook with comprehensive access control
 */
export function usePermission(): UsePermissionReturn {
  const { user, isAuthenticated } = useEnhancedAuth();
  const setPermissionUser = usePermissionStore((state: PermissionStore) => state.setUser);
  const clearPermissionContext = usePermissionStore((state: PermissionStore) => state.clearContext);
  const hasPermission = usePermissionStore((state: PermissionStore) => state.hasPermission);
  const hasAnyPermission = usePermissionStore((state: PermissionStore) => state.hasAnyPermission);
  const hasAllPermissions = usePermissionStore((state: PermissionStore) => state.hasAllPermissions);
  const hasRole = usePermissionStore((state: PermissionStore) => state.hasRole);
  const hasAnyRole = usePermissionStore((state: PermissionStore) => state.hasAnyRole);
  const isAdminRole = usePermissionStore((state: PermissionStore) => state.isAdminRole);
  const canAccessTenant = usePermissionStore((state: PermissionStore) => state.canAccessTenant);
  const canAccessSchool = usePermissionStore((state: PermissionStore) => state.canAccessSchool);
  const canAccessStudent = usePermissionStore((state: PermissionStore) => state.canAccessStudent);
  const permissionIsLoading = usePermissionStore((state: PermissionStore) => state.isLoading);
  const permissionError = usePermissionStore((state: PermissionStore) => state.error);
  const permissionLastUpdated = usePermissionStore((state: PermissionStore) => state.lastUpdated);

  // Sync user data with permission store
  useEffect(() => {
    if (user && isAuthenticated) {
      setPermissionUser(user);
    } else {
      clearPermissionContext();
    }
  }, [user, isAuthenticated, setPermissionUser, clearPermissionContext]);

  // Resource-specific permission helpers
  const canRead = useCallback((resource: string) => {
    return hasPermission(`${resource}:read`);
  }, [hasPermission]);

  const canWrite = useCallback((resource: string) => {
    return hasPermission(`${resource}:write`);
  }, [hasPermission]);

  const canDelete = useCallback((resource: string) => {
    return hasPermission(`${resource}:delete`);
  }, [hasPermission]);

  return {
    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checking
    hasRole,
    hasAnyRole,
    isAdminRole,
    
    // Context-aware permissions
    canAccessTenant,
    canAccessSchool,
    canAccessStudent,
    
    // Resource access
    canRead,
    canWrite,
    canDelete,
    
    // State
    isLoading: permissionIsLoading,
    error: permissionError,
    lastUpdated: permissionLastUpdated,
  };
}

/**
 * Enhanced tenant context hook with switching and management
 */
export function useEnhancedTenantContext(): UseTenantContextReturn {
  const { 
    currentTenant, 
    availableTenants, 
    switchTenant, 
    isLoading,
    error 
  } = useEnhancedAuth();
  
  const [isSwitching, setIsSwitching] = useState(false);

  const handleTenantSwitch = useCallback(async (tenantId: string) => {
    if (tenantId === currentTenant?.id || isSwitching) return;
    
    setIsSwitching(true);
    try {
      await switchTenant(tenantId);
    } finally {
      setIsSwitching(false);
    }
  }, [currentTenant?.id, isSwitching, switchTenant]);

  const refreshTenantData = useCallback(async () => {
    // This would typically refresh tenant-specific data
    // For now, we'll use the existing refresh profile functionality
    const { refreshUserProfile } = useEnhancedAuthStore.getState();
    await refreshUserProfile();
  }, []);

  const getTenantById = useCallback((tenantId: string) => {
    return availableTenants.find(tenant => tenant.id === tenantId) || null;
  }, [availableTenants]);

  return {
    // Current context
    currentTenant,
    availableTenants,
    
    // Actions
    switchTenant: handleTenantSwitch,
    refreshTenantData,
    
    // State
    isLoading,
    isSwitching,
    error: error?.message || null,
    
    // Utilities
    hasMultipleTenants: availableTenants.length > 1,
    canSwitchTenants: availableTenants.length > 1 && !isSwitching,
    getTenantById,
  };
}

/**
 * Multi-permission guard hook for complex permission scenarios
 */
export function useMultiPermissionGuard(
  permissions: string[],
  options: {
    requireAll?: boolean;
    context?: Partial<PermissionContext>;
  } = {}
): UseMultiPermissionGuardReturn {
  const { hasPermission, hasAnyPermission, hasAllPermissions, isLoading } = usePermission();
  const { isAuthenticated } = useEnhancedAuth();
  
  const { requireAll = false } = options;

  // Calculate individual permission results
  const permissionResults = useMemo(() => {
    const results: Record<string, boolean> = {};
    permissions.forEach(permission => {
      results[permission] = isAuthenticated && hasPermission(permission);
    });
    return results;
  }, [permissions, isAuthenticated, hasPermission]);

  // Calculate access levels
  const hasAllAccess = useMemo(() => {
    return isAuthenticated && hasAllPermissions(permissions);
  }, [isAuthenticated, hasAllPermissions, permissions]);

  const hasAnyAccess = useMemo(() => {
    return isAuthenticated && hasAnyPermission(permissions);
  }, [isAuthenticated, hasAnyPermission, permissions]);

  const hasAccess = requireAll ? hasAllAccess : hasAnyAccess;

  // Utility functions
  const getMissingPermissions = useCallback(() => {
    return permissions.filter(permission => !permissionResults[permission]);
  }, [permissions, permissionResults]);

  const getGrantedPermissions = useCallback(() => {
    return permissions.filter(permission => permissionResults[permission]);
  }, [permissions, permissionResults]);

  return {
    // Access control
    hasAccess,
    hasAllAccess,
    hasAnyAccess,
    
    // Individual permission results
    permissionResults,
    
    // State
    isLoading,
    isAuthenticated,
    
    // Utilities
    getMissingPermissions,
    getGrantedPermissions,
  };
}

/**
 * Resource access hook for dynamic permission checking
 */
export function useResourceAccess(
  resource: string,
  context?: Partial<PermissionContext>
): UseResourceAccessReturn {
  const { user, currentTenant } = useEnhancedAuth();
  const { isLoading, error } = usePermission();
  const hasPermission = usePermissionStore((state: PermissionStore) => state.hasPermission);
  const getAvailableActions = usePermissionStore((state: PermissionStore) => state.getAvailableActions);
  const evaluatePermission = usePermissionStore((state: PermissionStore) => state.evaluatePermission);

  // Build full permission context
  const fullContext = useMemo((): PermissionContext | null => {
    if (!user || !currentTenant) return null;
    
    return {
      user,
      tenant: currentTenant,
      resource,
      action: 'read', // Default action
      ...context,
    };
  }, [user, currentTenant, resource, context]);

  // Calculate basic access permissions
  const canRead = useMemo(() => {
    return hasPermission(`${resource}:read`) ||
           hasPermission(`${resource}:*`) ||
           hasPermission('*');
  }, [hasPermission, resource]);

  const canWrite = useMemo(() => {
    return hasPermission(`${resource}:write`) ||
           hasPermission(`${resource}:*`) ||
           hasPermission('*');
  }, [hasPermission, resource]);

  const canDelete = useMemo(() => {
    return hasPermission(`${resource}:delete`) ||
           hasPermission(`${resource}:*`) ||
           hasPermission('*');
  }, [hasPermission, resource]);

  const canExecute = useMemo(() => {
    return hasPermission(`${resource}:execute`) ||
           hasPermission(`${resource}:*`) ||
           hasPermission('*');
  }, [hasPermission, resource]);

  // Get available actions for the resource
  const availableActions = useMemo(() => {
    return getAvailableActions(resource);
  }, [getAvailableActions, resource]);

  // Dynamic access evaluation
  const evaluateAccess = useCallback((
    action: string, 
    additionalContext?: Partial<PermissionContext>
  ) => {
    if (!fullContext) return false;
    
    const evalContext = {
      ...fullContext,
      action,
      ...additionalContext,
    };
    
    const result = evaluatePermission(evalContext);
    return result.allowed;
  }, [evaluatePermission, fullContext]);

  return {
    // Resource-specific access
    canRead,
    canWrite,
    canDelete,
    canExecute,
    
    // Available actions
    availableActions,
    
    // Context evaluation
    evaluateAccess,
    
    // State
    isLoading,
    error,
  };
}

/**
 * Real-time permission synchronization hook
 */
export function usePermissionSync() {
  const { user, currentTenant, isAuthenticated } = useEnhancedAuth();
  const setPermissionUser = usePermissionStore((state: PermissionStore) => state.setUser);
  const setPermissionTenantContext = usePermissionStore((state: PermissionStore) => state.setTenantContext);
  const clearPermissionContext = usePermissionStore((state: PermissionStore) => state.clearContext);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Sync permissions when user or tenant changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      clearPermissionContext();
      return;
    }

    // Update permission store with current user and tenant
    setPermissionUser(user);
    
    if (currentTenant) {
      setPermissionTenantContext(currentTenant);
    }

    setLastSyncTime(Date.now());
  }, [
    user,
    currentTenant,
    isAuthenticated,
    setPermissionUser,
    setPermissionTenantContext,
    clearPermissionContext,
  ]);

  // Set up real-time permission updates (WebSocket or polling)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // This would typically set up a WebSocket connection or polling
    // For now, we'll simulate with a periodic check
    const syncInterval = setInterval(async () => {
      try {
        // In a real implementation, this would fetch updated permissions
        // from the server and update the permission store
        setSyncError(null);
        setLastSyncTime(Date.now());
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : 'Sync failed');
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [isAuthenticated, user]);

  const forcSync = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setSyncError(null);
      // Force refresh user profile to get latest permissions
      const { refreshUserProfile } = useEnhancedAuthStore.getState();
      await refreshUserProfile();
      setLastSyncTime(Date.now());
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Force sync failed');
    }
  }, [isAuthenticated, user]);

  return {
    lastSyncTime,
    syncError,
    forcSync,
    isOnline: navigator.onLine,
  };
}

/**
 * Composite hook that combines all enhanced auth functionality
 */
export function useAuth() {
  const enhancedAuth = useEnhancedAuth();
  const permission = usePermission();
  const tenantContext = useEnhancedTenantContext();
  
  // Set up real-time sync
  usePermissionSync();

  return {
    // Enhanced auth
    ...enhancedAuth,
    
    // Permission system
    permission,
    
    // Tenant context
    tenantContext,
    
    // Convenience methods
    hasPermission: permission.hasPermission,
    hasRole: permission.hasRole,
    canRead: permission.canRead,
    canWrite: permission.canWrite,
    canDelete: permission.canDelete,
  };
}

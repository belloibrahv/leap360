/**
 * Authentication React Hook - Enhanced with Permission System
 * 
 * Provides reactive authentication state and actions for React components.
 * Integrates with the new permission system and multi-tenant context.
 */

import { useEffect } from 'react';
import { User, LoginRequest } from '../../types/auth';
import { EnhancedUser, UserRole } from '@/types';
import { useEnhancedAuth } from './useEnhancedAuth';
import { usePermissionStore, type PermissionStore } from '@/core/permissions/permissionStore';

/**
 * Authentication hook return type - Enhanced
 */
export interface UseAuthReturn {
  // State
  user: User | null;
  enhancedUser: EnhancedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
  
  // Utilities (legacy)
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  getValidToken: () => Promise<string | null>;
  
  // Enhanced utilities
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdminRole: () => boolean;
}

/**
 * React hook for authentication state management - Enhanced with permissions
 */
export function useAuth(): UseAuthReturn {
  const enhancedAuth = useEnhancedAuth();
  const setPermissionUser = usePermissionStore((state: PermissionStore) => state.setUser);
  const clearPermissionContext = usePermissionStore((state: PermissionStore) => state.clearContext);
  const hasRole = usePermissionStore((state: PermissionStore) => state.hasRole);
  const hasAnyRole = usePermissionStore((state: PermissionStore) => state.hasAnyRole);
  const isAdminRole = usePermissionStore((state: PermissionStore) => state.isAdminRole);

  // Sync user with permission store when authentication state changes
  useEffect(() => {
    if (enhancedAuth.isAuthenticated && enhancedAuth.user) {
      setPermissionUser(enhancedAuth.user);
    } else {
      clearPermissionContext();
    }
  }, [
    enhancedAuth.isAuthenticated,
    enhancedAuth.user,
    setPermissionUser,
    clearPermissionContext,
  ]);

  // Convert enhanced user to legacy user format
  const legacyUser: User | null = enhancedAuth.user ? {
    id: enhancedAuth.user.id,
    email: enhancedAuth.user.email,
    first_name: enhancedAuth.user.first_name,
    last_name: enhancedAuth.user.last_name,
    full_name: enhancedAuth.user.full_name,
    role: enhancedAuth.user.role,
    phone: enhancedAuth.user.phone,
    is_active: enhancedAuth.user.is_active,
    tenant_id: enhancedAuth.user.tenant_id,
    created_at: enhancedAuth.user.created_at,
    updated_at: enhancedAuth.user.updated_at,
    last_login: enhancedAuth.user.last_login,
  } : null;

  // Convert enhanced error to legacy error format
  const legacyError = enhancedAuth.error?.message || null;

  return {
    // State
    user: legacyUser,
    enhancedUser: enhancedAuth.user,
    isAuthenticated: enhancedAuth.isAuthenticated,
    isLoading: enhancedAuth.isLoading,
    error: legacyError,
    
    // Actions
    login: enhancedAuth.login,
    logout: enhancedAuth.logout,
    refreshProfile: enhancedAuth.refreshProfile,
    clearError: enhancedAuth.clearError,
    
    // Utilities (legacy)
    hasPermission: enhancedAuth.hasPermission,
    isAdmin: enhancedAuth.isAdmin,
    getValidToken: enhancedAuth.getValidToken,
    
    // Enhanced utilities
    hasRole,
    hasAnyRole,
    isAdminRole,
  };
}

/**
 * Hook for authentication guard - redirects to login if not authenticated
 */
export function useAuthGuard(redirectTo: string = '/') {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook for role-based access control
 */
export function usePermission(permission: string) {
  const { hasPermission, isAuthenticated } = useAuth();
  
  return {
    hasPermission: isAuthenticated && hasPermission(permission),
    isAuthenticated,
  };
}

/**
 * Hook for admin access control
 */
export function useAdminAccess() {
  const { isAdmin, isAuthenticated } = useAuth();
  
  return {
    isAdmin: isAuthenticated && isAdmin(),
    isAuthenticated,
  };
}

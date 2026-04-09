/**
 * Permission Store
 * 
 * Zustand-based state management for permissions and access control.
 * Provides reactive permission state with real-time updates.
 */

import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  PermissionState, 
  PermissionContext,
  PermissionCheckResult,
  EnhancedUser,
  TenantContext,
  SchoolContext,
  UserRole,
} from '@/types';
import { PermissionEngine } from './PermissionEngine';

export interface PermissionStore extends PermissionState {
  // Permission engine instance
  engine: PermissionEngine;
  
  // State management
  setUser: (user: EnhancedUser) => void;
  setTenantContext: (tenant: TenantContext) => void;
  setSchoolContext: (school: SchoolContext) => void;
  updatePermissions: (permissions: string[]) => void;
  clearContext: () => void;
  
  // Permission checking methods
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isAdminRole: () => boolean;
  
  // Context-aware methods
  canAccessTenant: (tenantId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  canAccessStudent: (studentId: string) => boolean;
  
  // Advanced permission evaluation
  evaluatePermission: (context: PermissionContext) => PermissionCheckResult;
  getAvailableActions: (resource: string) => string[];
  
  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Subscription management
  subscribe: (callback: (state: PermissionState) => void) => () => void;
}

export const usePermissionStore: UseBoundStore<StoreApi<PermissionStore>> = create<PermissionStore>()(
  subscribeWithSelector<PermissionStore>((set, get) => {
    const engine = new PermissionEngine();
    
    return {
      // Initial state
      permissions: new Set<string>(),
      roles: [] as UserRole[],
      tenantContext: null,
      schoolContext: undefined,
      isLoading: false,
      lastUpdated: 0,
      error: null,
      engine,
      
      // State management
      setUser: (user: EnhancedUser) => {
        set({ isLoading: true, error: null });
        
        try {
          engine.setUser(user);
          
          set({
            permissions: new Set(user.permissions || []),
            roles: user.effectiveRoles || [user.role],
            lastUpdated: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to set user',
            isLoading: false,
          });
        }
      },
      
      setTenantContext: (tenant: TenantContext) => {
        set({ isLoading: true, error: null });
        
        try {
          engine.setTenantContext(tenant);
          
          set({
            tenantContext: tenant,
            lastUpdated: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to set tenant context',
            isLoading: false,
          });
        }
      },
      
      setSchoolContext: (school: SchoolContext) => {
        set({ isLoading: true, error: null });
        
        try {
          engine.setSchoolContext(school);
          
          set({
            schoolContext: school,
            lastUpdated: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to set school context',
            isLoading: false,
          });
        }
      },
      
      updatePermissions: (permissions: string[]) => {
        set({ isLoading: true, error: null });
        
        try {
          engine.updatePermissions(permissions);
          
          set({
            permissions: new Set(permissions),
            lastUpdated: Date.now(),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update permissions',
            isLoading: false,
          });
        }
      },
      
      clearContext: () => {
        engine.clearContext();
        
        set({
          permissions: new Set(),
          roles: [],
          tenantContext: null,
          schoolContext: undefined,
          lastUpdated: Date.now(),
          error: null,
          isLoading: false,
        });
      },
      
      // Permission checking methods
      hasPermission: (permission: string) => {
        try {
          return engine.hasPermission(permission);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Permission check failed' });
          return false;
        }
      },
      
      hasAnyPermission: (permissions: string[]) => {
        try {
          return engine.hasAnyPermission(permissions);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Permission check failed' });
          return false;
        }
      },
      
      hasAllPermissions: (permissions: string[]) => {
        try {
          return engine.hasAllPermissions(permissions);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Permission check failed' });
          return false;
        }
      },
      
      hasRole: (role: UserRole) => {
        try {
          return engine.hasRole(role);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Role check failed' });
          return false;
        }
      },
      
      hasAnyRole: (roles: UserRole[]) => {
        try {
          return engine.hasAnyRole(roles);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Role check failed' });
          return false;
        }
      },
      
      isAdminRole: () => {
        try {
          return engine.isAdminRole();
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Admin role check failed' });
          return false;
        }
      },
      
      // Context-aware methods
      canAccessTenant: (tenantId: string) => {
        try {
          return engine.canAccessTenant(tenantId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Tenant access check failed' });
          return false;
        }
      },
      
      canAccessSchool: (schoolId: string) => {
        try {
          return engine.canAccessSchool(schoolId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'School access check failed' });
          return false;
        }
      },
      
      canAccessStudent: (studentId: string) => {
        try {
          return engine.canAccessStudent(studentId);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Student access check failed' });
          return false;
        }
      },
      
      // Advanced permission evaluation
      evaluatePermission: (context: PermissionContext) => {
        try {
          return engine.evaluatePermission(context);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Permission evaluation failed' });
          return {
            allowed: false,
            reason: 'Permission evaluation failed',
          };
        }
      },
      
      getAvailableActions: (resource: string) => {
        try {
          return engine.getAvailableActions(resource);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to get available actions' });
          return [];
        }
      },
      
      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      // Subscription management
      subscribe: (callback: (state: PermissionState) => void): (() => void) => {
        return usePermissionStore.subscribe((state: PermissionStore) => {
          callback({
            permissions: state.permissions,
            roles: state.roles,
            tenantContext: state.tenantContext,
            schoolContext: state.schoolContext,
            isLoading: state.isLoading,
            lastUpdated: state.lastUpdated,
            error: state.error,
          });
        });
      },
    };
  })
);

// Selector hooks for specific state slices
export const usePermissions = () => usePermissionStore((state: PermissionStore) => state.permissions);
export const useRoles = () => usePermissionStore((state: PermissionStore) => state.roles);
export const useTenantContextSelector = () => usePermissionStore((state: PermissionStore) => state.tenantContext);
export const useSchoolContextSelector = () => usePermissionStore((state: PermissionStore) => state.schoolContext);
export const usePermissionLoading = () => usePermissionStore((state: PermissionStore) => state.isLoading);
export const usePermissionError = () => usePermissionStore((state: PermissionStore) => state.error);

// Permission checking hooks
export const useHasPermission = (permission: string) => 
  usePermissionStore((state: PermissionStore) => state.hasPermission(permission));

export const useHasAnyPermission = (permissions: string[]) => 
  usePermissionStore((state: PermissionStore) => state.hasAnyPermission(permissions));

export const useHasAllPermissions = (permissions: string[]) => 
  usePermissionStore((state: PermissionStore) => state.hasAllPermissions(permissions));

export const useHasRole = (role: UserRole) => 
  usePermissionStore((state: PermissionStore) => state.hasRole(role));

export const useHasAnyRole = (roles: UserRole[]) => 
  usePermissionStore((state: PermissionStore) => state.hasAnyRole(roles));

export const useIsAdminRole = () => 
  usePermissionStore((state: PermissionStore) => state.isAdminRole());

// Context-aware hooks
export const useCanAccessTenant = (tenantId: string) => 
  usePermissionStore((state: PermissionStore) => state.canAccessTenant(tenantId));

export const useCanAccessSchool = (schoolId: string) => 
  usePermissionStore((state: PermissionStore) => state.canAccessSchool(schoolId));

export const useCanAccessStudent = (studentId: string) => 
  usePermissionStore((state: PermissionStore) => state.canAccessStudent(studentId));

// Permission engine access
export const usePermissionEngine = () => usePermissionStore((state: PermissionStore) => state.engine);

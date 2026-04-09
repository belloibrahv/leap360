/**
 * Tenant Context Hook
 * 
 * React hook for managing multi-tenant context switching and persistence.
 * Provides reactive tenant state with automatic synchronization.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { usePermissionStore } from '@/core/permissions/permissionStore';
import { useAuth } from './useAuth';
import { 
  TenantContext, 
  SchoolContext, 
  EnhancedUser, 
  TenantMembership 
} from '@/types';

interface TenantContextHook {
  // Current context
  currentTenant: TenantContext | null;
  currentSchool: SchoolContext | undefined;
  
  // Available contexts
  availableTenants: TenantMembership[];
  availableSchools: SchoolContext[];
  
  // Context switching
  switchTenant: (tenantId: string) => Promise<void>;
  switchSchool: (schoolId: string) => Promise<void>;
  
  // Context validation
  canAccessTenant: (tenantId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Helpers
  getTenantById: (tenantId: string) => TenantMembership | undefined;
  getSchoolById: (schoolId: string) => SchoolContext | undefined;
  isCurrentTenant: (tenantId: string) => boolean;
  isCurrentSchool: (schoolId: string) => boolean;
}

/**
 * Multi-tenant context management hook
 */
export function useTenantContext(): TenantContextHook {
  const { user, isAuthenticated } = useAuth();
  const permissionStore = usePermissionStore();
  
  // Get current contexts from permission store
  const currentTenant = permissionStore.tenantContext;
  const currentSchool = permissionStore.schoolContext;
  const isLoading = permissionStore.isLoading;
  const error = permissionStore.error;
  
  // Get available tenants from user data
  const availableTenants = useMemo(() => {
    if (!user) return [];
    
    // For now, create a single tenant membership from user's tenant_id
    return [{
      tenantId: user.tenant_id,
      tenantName: `Tenant ${user.tenant_id}`,
      tenantSlug: user.tenant_id,
      role: user.role,
      permissions: [],
      schools: [],
      isActive: user.is_active,
      joinedAt: user.created_at,
    }];
  }, [user]);
  
  // Get available schools for current tenant
  const availableSchools = useMemo<SchoolContext[]>(() => {
    // TODO: Implement school fetching based on current tenant
    return [];
  }, [currentTenant]);
  
  // Switch tenant context
  const switchTenant = useCallback(async (tenantId: string) => {
    if (!user || !isAuthenticated) {
      throw new Error('User must be authenticated to switch tenant');
    }
    
    // Check if user has access to this tenant
    if (user.tenant_id !== tenantId) {
      throw new Error(`User does not have access to tenant: ${tenantId}`);
    }
    
    try {
      // Create tenant context
      const tenantContext: TenantContext = {
        id: tenantId,
        name: `Tenant ${tenantId}`,
        slug: tenantId,
        settings: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          currency: 'USD',
          language: 'en',
          features: [],
          maxUsers: 1000,
          maxSchools: 10,
        },
        subscription: {
          plan: 'basic',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          features: [],
        },
      };
      
      // Update permission store
      permissionStore.setTenantContext(tenantContext);
      
      // Clear school context when switching tenants
      if (currentSchool) {
        permissionStore.setSchoolContext(undefined as any);
      }
      
      // Persist tenant selection
      localStorage.setItem('selectedTenantId', tenantId);
      
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      throw error;
    }
  }, [user, isAuthenticated, permissionStore, currentSchool]);
  
  // Switch school context
  const switchSchool = useCallback(async (schoolId: string) => {
    if (!user || !isAuthenticated || !currentTenant) {
      throw new Error('User must be authenticated and have tenant context to switch school');
    }
    
    // For now, allow any school ID (TODO: implement proper school validation)
    try {
      // Create school context
      const schoolContext: SchoolContext = {
        id: schoolId,
        name: `School ${schoolId}`,
        type: 'school',
        status: 'active',
      };
      
      // Update permission store
      permissionStore.setSchoolContext(schoolContext);
      
      // Persist school selection
      localStorage.setItem('selectedSchoolId', schoolId);
      
    } catch (error) {
      console.error('Failed to switch school:', error);
      throw error;
    }
  }, [user, isAuthenticated, currentTenant, permissionStore]);
  
  // Check tenant access
  const canAccessTenant = useCallback((tenantId: string) => {
    return permissionStore.canAccessTenant(tenantId);
  }, [permissionStore]);
  
  // Check school access
  const canAccessSchool = useCallback((schoolId: string) => {
    return permissionStore.canAccessSchool(schoolId);
  }, [permissionStore]);
  
  // Helper to get tenant by ID
  const getTenantById = useCallback((tenantId: string) => {
    return availableTenants.find(t => t.tenantId === tenantId);
  }, [availableTenants]);
  
  // Helper to get school by ID
  const getSchoolById = useCallback((schoolId: string) => {
    return availableSchools.find(s => s.id === schoolId);
  }, [availableSchools]);
  
  // Check if tenant is current
  const isCurrentTenant = useCallback((tenantId: string) => {
    return currentTenant?.id === tenantId;
  }, [currentTenant]);
  
  // Check if school is current
  const isCurrentSchool = useCallback((schoolId: string) => {
    return currentSchool?.id === schoolId;
  }, [currentSchool]);
  
  // Auto-restore context on authentication
  useEffect(() => {
    if (isAuthenticated && user && !currentTenant) {
      const savedTenantId = localStorage.getItem('selectedTenantId');
      
      if (savedTenantId && canAccessTenant(savedTenantId)) {
        switchTenant(savedTenantId).catch(console.error);
      } else if (availableTenants.length > 0) {
        // Auto-select first available tenant
        switchTenant(availableTenants[0].tenantId).catch(console.error);
      }
    }
  }, [isAuthenticated, user, currentTenant, availableTenants, canAccessTenant, switchTenant]);
  
  // Auto-restore school context
  useEffect(() => {
    if (currentTenant && !currentSchool && availableSchools.length > 0) {
      const savedSchoolId = localStorage.getItem('selectedSchoolId');
      
      if (savedSchoolId && canAccessSchool(savedSchoolId)) {
        switchSchool(savedSchoolId).catch(console.error);
      }
    }
  }, [currentTenant, currentSchool, availableSchools, canAccessSchool, switchSchool]);
  
  // Clear context on logout
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('selectedTenantId');
      localStorage.removeItem('selectedSchoolId');
    }
  }, [isAuthenticated]);
  
  return {
    // Current context
    currentTenant,
    currentSchool,
    
    // Available contexts
    availableTenants,
    availableSchools,
    
    // Context switching
    switchTenant,
    switchSchool,
    
    // Context validation
    canAccessTenant,
    canAccessSchool,
    
    // State
    isLoading,
    error,
    
    // Helpers
    getTenantById,
    getSchoolById,
    isCurrentTenant,
    isCurrentSchool,
  };
}

/**
 * Simplified tenant switching hook for components
 */
export function useTenantSwitcher() {
  const { 
    availableTenants, 
    currentTenant, 
    switchTenant, 
    isLoading 
  } = useTenantContext();
  
  return {
    tenants: availableTenants,
    currentTenant,
    switchTenant,
    isLoading,
    hasMultipleTenants: availableTenants.length > 1,
  };
}

/**
 * Simplified school switching hook for components
 */
export function useSchoolSwitcher() {
  const { 
    availableSchools, 
    currentSchool, 
    switchSchool, 
    isLoading 
  } = useTenantContext();
  
  return {
    schools: availableSchools,
    currentSchool,
    switchSchool,
    isLoading,
    hasMultipleSchools: availableSchools.length > 1,
  };
}

export default useTenantContext;

/**
 * Enhanced Authentication Hooks Tests
 * 
 * Tests for the enhanced authentication hooks functionality.
 */

import { renderHook, act } from '@testing-library/react';
import { usePermission, useMultiPermissionGuard, useResourceAccess } from '../useEnhancedAuth';
import { UserRole, PERMISSIONS } from '@/types';

// Mock the stores
jest.mock('../auth/store/enhancedAuthStore', () => ({
  useEnhancedAuthStore: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      role: UserRole.TEACHER,
      permissions: [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED],
      effectiveRoles: [UserRole.TEACHER],
      tenants: [{
        tenantId: 'tenant1',
        tenantName: 'Test School',
        role: UserRole.TEACHER,
        permissions: [PERMISSIONS.STUDENTS_READ_CLASS],
        schools: [{
          schoolId: 'school1',
          schoolName: 'Test School',
          permissions: [PERMISSIONS.STUDENTS_READ_CLASS],
          isActive: true,
        }],
        isActive: true,
      }],
      currentTenant: 'tenant1',
    },
    isAuthenticated: true,
    isLoading: false,
    currentTenant: {
      id: 'tenant1',
      name: 'Test School',
      slug: 'test-school',
    },
    availableTenants: [],
    login: jest.fn(),
    logout: jest.fn(),
    switchTenant: jest.fn(),
    hasPermission: jest.fn((permission: string) => 
      [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED].includes(permission)
    ),
    hasRole: jest.fn((role: UserRole) => role === UserRole.TEACHER),
    isAdmin: jest.fn(() => false),
    canAccessTenant: jest.fn(() => true),
  }),
  useAuthUser: () => ({
    id: '1',
    email: 'test@example.com',
    role: UserRole.TEACHER,
    permissions: [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED],
  }),
  useIsAuthenticated: () => true,
  useAuthLoading: () => false,
  useAuthError: () => null,
  useCurrentTenant: () => ({
    id: 'tenant1',
    name: 'Test School',
    slug: 'test-school',
  }),
  useAvailableTenants: () => [],
  useSessionId: () => 'session1',
}));

jest.mock('../permissions/permissionStore', () => ({
  usePermissionStore: () => ({
    hasPermission: jest.fn((permission: string) => 
      [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED].includes(permission)
    ),
    hasAnyPermission: jest.fn((permissions: string[]) => 
      permissions.some(p => [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED].includes(p))
    ),
    hasAllPermissions: jest.fn((permissions: string[]) => 
      permissions.every(p => [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.GRADES_WRITE_ASSIGNED].includes(p))
    ),
    hasRole: jest.fn((role: UserRole) => role === UserRole.TEACHER),
    hasAnyRole: jest.fn((roles: UserRole[]) => roles.includes(UserRole.TEACHER)),
    isAdminRole: jest.fn(() => false),
    canAccessTenant: jest.fn(() => true),
    canAccessSchool: jest.fn(() => true),
    canAccessStudent: jest.fn(() => true),
    getAvailableActions: jest.fn(() => ['read', 'write']),
    evaluatePermission: jest.fn(() => ({ allowed: true })),
    setUser: jest.fn(),
    clearContext: jest.fn(),
    isLoading: false,
    error: null,
    lastUpdated: Date.now(),
  }),
}));

describe('usePermission', () => {
  it('should return permission checking functions', () => {
    const { result } = renderHook(() => usePermission());
    
    expect(result.current.hasPermission).toBeDefined();
    expect(result.current.hasAnyPermission).toBeDefined();
    expect(result.current.hasAllPermissions).toBeDefined();
    expect(result.current.canRead).toBeDefined();
    expect(result.current.canWrite).toBeDefined();
    expect(result.current.canDelete).toBeDefined();
  });

  it('should check permissions correctly', () => {
    const { result } = renderHook(() => usePermission());
    
    expect(result.current.hasPermission(PERMISSIONS.STUDENTS_READ_CLASS)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.SYSTEM_ADMIN)).toBe(false);
  });

  it('should check resource permissions', () => {
    const { result } = renderHook(() => usePermission());
    
    expect(result.current.canRead('students')).toBe(false); // No students:read permission
    expect(result.current.canWrite('grades')).toBe(false); // No grades:write permission
  });
});

describe('useMultiPermissionGuard', () => {
  it('should handle multiple permissions with requireAll=false', () => {
    const permissions = [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.SYSTEM_ADMIN];
    const { result } = renderHook(() => 
      useMultiPermissionGuard(permissions, { requireAll: false })
    );
    
    expect(result.current.hasAnyAccess).toBe(true);
    expect(result.current.hasAllAccess).toBe(false);
    expect(result.current.hasAccess).toBe(true); // Should be true since requireAll=false
  });

  it('should handle multiple permissions with requireAll=true', () => {
    const permissions = [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.SYSTEM_ADMIN];
    const { result } = renderHook(() => 
      useMultiPermissionGuard(permissions, { requireAll: true })
    );
    
    expect(result.current.hasAnyAccess).toBe(true);
    expect(result.current.hasAllAccess).toBe(false);
    expect(result.current.hasAccess).toBe(false); // Should be false since requireAll=true
  });

  it('should provide individual permission results', () => {
    const permissions = [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.SYSTEM_ADMIN];
    const { result } = renderHook(() => 
      useMultiPermissionGuard(permissions)
    );
    
    expect(result.current.permissionResults[PERMISSIONS.STUDENTS_READ_CLASS]).toBe(true);
    expect(result.current.permissionResults[PERMISSIONS.SYSTEM_ADMIN]).toBe(false);
  });

  it('should provide utility functions', () => {
    const permissions = [PERMISSIONS.STUDENTS_READ_CLASS, PERMISSIONS.SYSTEM_ADMIN];
    const { result } = renderHook(() => 
      useMultiPermissionGuard(permissions)
    );
    
    const missing = result.current.getMissingPermissions();
    const granted = result.current.getGrantedPermissions();
    
    expect(missing).toContain(PERMISSIONS.SYSTEM_ADMIN);
    expect(granted).toContain(PERMISSIONS.STUDENTS_READ_CLASS);
  });
});

describe('useResourceAccess', () => {
  it('should provide resource-specific access control', () => {
    const { result } = renderHook(() => useResourceAccess('students'));
    
    expect(result.current.canRead).toBeDefined();
    expect(result.current.canWrite).toBeDefined();
    expect(result.current.canDelete).toBeDefined();
    expect(result.current.canExecute).toBeDefined();
  });

  it('should provide available actions', () => {
    const { result } = renderHook(() => useResourceAccess('students'));
    
    expect(result.current.availableActions).toEqual(['read', 'write']);
  });

  it('should provide dynamic access evaluation', () => {
    const { result } = renderHook(() => useResourceAccess('students'));
    
    expect(result.current.evaluateAccess).toBeDefined();
    expect(typeof result.current.evaluateAccess).toBe('function');
  });
});
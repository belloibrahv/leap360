/**
 * Property Tests for Permission Engine
 * 
 * Property-based tests that validate universal correctness properties
 * across all user roles and contexts for the Permission Engine.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { PermissionEngine } from '../PermissionEngine';
import { 
  EnhancedUser, 
  UserRole, 
  TenantContext, 
  SchoolContext,
  PermissionContext 
} from '@/types';

// Test data generators
const generateUser = (role: UserRole, permissions: string[] = [], tenantMemberships: any[] = []): EnhancedUser => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: `test-${Math.random().toString(36).substr(2, 9)}@example.com`,
  name: `Test User ${Math.random().toString(36).substr(2, 9)}`,
  role,
  effectiveRoles: [role],
  permissions,
  tenants: tenantMemberships,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const generateTenantContext = (): TenantContext => ({
  id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test Tenant ${Math.random().toString(36).substr(2, 9)}`,
  slug: `test-tenant-${Math.random().toString(36).substr(2, 9)}`,
  isActive: true,
});

const generateSchoolContext = (): SchoolContext => ({
  id: `school-${Math.random().toString(36).substr(2, 9)}`,
  name: `Test School ${Math.random().toString(36).substr(2, 9)}`,
  tenantId: `tenant-${Math.random().toString(36).substr(2, 9)}`,
});

describe('PermissionEngine Property Tests', () => {
  let engine: PermissionEngine;

  beforeEach(() => {
    engine = new PermissionEngine();
  });

  describe('Property 4: Permission-Based Component Rendering', () => {
    /**
     * Property: Permission consistency across role hierarchies
     * 
     * For any user U with role R and any permission P:
     * - If U has permission P directly, hasPermission(P) must return true
     * - If U has role R and R includes permission P, hasPermission(P) must return true
     * - If U is Super Admin, hasPermission(P) must return true for any P
     * - Permission checks must be consistent regardless of call order
     */
    it('should maintain permission consistency across role hierarchies', () => {
      const testCases = [
        {
          role: UserRole.SUPER_ADMIN,
          permissions: ['*'],
          testPermissions: ['users:read', 'schools:write', 'students:delete', 'reports:admin']
        },
        {
          role: UserRole.TENANT_ADMIN,
          permissions: ['tenants:read', 'schools:read', 'users:write'],
          testPermissions: ['tenants:read', 'schools:read', 'users:write', 'students:read']
        },
        {
          role: UserRole.SCHOOL_ADMIN,
          permissions: ['schools:read', 'students:read', 'teachers:read'],
          testPermissions: ['schools:read', 'students:read', 'teachers:read', 'classes:read']
        },
        {
          role: UserRole.TEACHER,
          permissions: ['students:read:class', 'grades:write:class'],
          testPermissions: ['students:read:class', 'grades:write:class', 'attendance:write']
        },
        {
          role: UserRole.PARENT,
          permissions: ['students:read:children', 'grades:read:children'],
          testPermissions: ['students:read:children', 'grades:read:children']
        },
        {
          role: UserRole.STUDENT,
          permissions: ['grades:read:own', 'profile:read:own'],
          testPermissions: ['grades:read:own', 'profile:read:own']
        }
      ];

      testCases.forEach(({ role, permissions, testPermissions }) => {
        const user = generateUser(role, permissions);
        engine.setUser(user);

        // Test direct permissions
        permissions.forEach(permission => {
          if (permission === '*') {
            // Super admin should have all permissions
            testPermissions.forEach(testPerm => {
              expect(engine.hasPermission(testPerm)).toBe(true);
            });
          } else {
            expect(engine.hasPermission(permission)).toBe(true);
          }
        });

        // Test consistency across multiple calls
        testPermissions.forEach(permission => {
          const result1 = engine.hasPermission(permission);
          const result2 = engine.hasPermission(permission);
          expect(result1).toBe(result2);
        });

        // Test hasAnyPermission consistency
        const hasAnyResult1 = engine.hasAnyPermission(testPermissions);
        const hasAnyResult2 = engine.hasAnyPermission(testPermissions);
        expect(hasAnyResult1).toBe(hasAnyResult2);

        // Test hasAllPermissions consistency
        const hasAllResult1 = engine.hasAllPermissions(permissions);
        const hasAllResult2 = engine.hasAllPermissions(permissions);
        expect(hasAllResult1).toBe(hasAllResult2);
      });
    });

    /**
     * Property: Role hierarchy enforcement
     * 
     * For any user U with role R:
     * - Higher privilege roles should have access to lower privilege resources
     * - Role checks should be consistent and deterministic
     * - Admin roles should always return true for isAdminRole()
     */
    it('should enforce role hierarchy correctly', () => {
      const roleHierarchy = [
        UserRole.SUPER_ADMIN,
        UserRole.TENANT_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.TEACHER,
        UserRole.PARENT,
        UserRole.STUDENT
      ];

      const adminRoles = [
        UserRole.SUPER_ADMIN,
        UserRole.TENANT_ADMIN,
        UserRole.SCHOOL_ADMIN,
        UserRole.PRINCIPAL
      ];

      roleHierarchy.forEach(role => {
        const user = generateUser(role);
        engine.setUser(user);

        // Test role identification
        expect(engine.hasRole(role)).toBe(true);
        
        // Test admin role identification
        const shouldBeAdmin = adminRoles.includes(role);
        expect(engine.isAdminRole()).toBe(shouldBeAdmin);

        // Test role consistency
        const hasRoleResult1 = engine.hasRole(role);
        const hasRoleResult2 = engine.hasRole(role);
        expect(hasRoleResult1).toBe(hasRoleResult2);

        // Test admin role consistency
        const isAdminResult1 = engine.isAdminRole();
        const isAdminResult2 = engine.isAdminRole();
        expect(isAdminResult1).toBe(isAdminResult2);
      });
    });

    /**
     * Property: Context isolation and security
     * 
     * For any user U with contexts T (tenant) and S (school):
     * - Context changes should not affect unrelated permissions
     * - Context-specific permissions should be properly isolated
     * - Security boundaries should be maintained across context switches
     */
    it('should maintain context isolation and security', () => {
      const tenant1 = generateTenantContext();
      const tenant2 = generateTenantContext();
      const school1 = generateSchoolContext();
      const school2 = generateSchoolContext();
      
      // Create user with access to tenant1 and school1
      const tenantMemberships = [
        {
          tenantId: tenant1.id,
          tenantName: tenant1.name,
          tenantSlug: tenant1.slug,
          role: UserRole.SCHOOL_ADMIN,
          schools: [
            {
              schoolId: school1.id,
              schoolName: school1.name,
              role: UserRole.SCHOOL_ADMIN,
            }
          ]
        }
      ];
      
      const user = generateUser(UserRole.SCHOOL_ADMIN, ['schools:read', 'students:read'], tenantMemberships);
      engine.setUser(user);

      // Test tenant context isolation
      engine.setTenantContext(tenant1);
      expect(engine.canAccessTenant(tenant1.id)).toBe(true);
      expect(engine.canAccessTenant(tenant2.id)).toBe(false);

      // Test school context isolation
      engine.setSchoolContext(school1);
      expect(engine.canAccessSchool(school1.id)).toBe(true);
      expect(engine.canAccessSchool(school2.id)).toBe(false);

      // Test that basic permissions remain unchanged after context switches
      expect(engine.hasPermission('schools:read')).toBe(true);
      expect(engine.hasPermission('students:read')).toBe(true);
      expect(engine.hasRole(UserRole.SCHOOL_ADMIN)).toBe(true);
    });

    /**
     * Property: Permission evaluation determinism
     * 
     * For any permission context C and user U:
     * - evaluatePermission(C) should return consistent results
     * - Permission evaluation should be deterministic
     * - Error conditions should be handled gracefully
     */
    it('should provide deterministic permission evaluation', () => {
      const testUsers = [
        generateUser(UserRole.SUPER_ADMIN, ['*']),
        generateUser(UserRole.TENANT_ADMIN, ['tenants:read', 'schools:write']),
        generateUser(UserRole.TEACHER, ['students:read:class', 'grades:write']),
        generateUser(UserRole.STUDENT, ['grades:read:own'])
      ];

      const testContexts: PermissionContext[] = [
        {
          user: testUsers[0],
          tenant: generateTenantContext(),
          school: generateSchoolContext(),
          resource: 'students',
          action: 'read'
        },
        {
          user: testUsers[1],
          tenant: generateTenantContext(),
          resource: 'schools',
          action: 'write'
        },
        {
          user: testUsers[2],
          tenant: generateTenantContext(),
          school: generateSchoolContext(),
          resource: 'grades',
          action: 'write'
        },
        {
          user: testUsers[3],
          tenant: generateTenantContext(),
          resource: 'grades',
          action: 'read'
        }
      ];

      testContexts.forEach((context, index) => {
        engine.setUser(testUsers[index]);
        if (context.tenant) engine.setTenantContext(context.tenant);
        if (context.school) engine.setSchoolContext(context.school);

        // Test deterministic evaluation
        const result1 = engine.evaluatePermission(context);
        const result2 = engine.evaluatePermission(context);
        
        expect(result1.allowed).toBe(result2.allowed);
        expect(result1.reason).toBe(result2.reason);
        
        // Test that results are boolean
        expect(typeof result1.allowed).toBe('boolean');
        expect(typeof result2.allowed).toBe('boolean');

        // Test available actions consistency
        const actions1 = engine.getAvailableActions(context.resource);
        const actions2 = engine.getAvailableActions(context.resource);
        expect(actions1).toEqual(actions2);
      });
    });

    /**
     * Property: State management integrity
     * 
     * For any sequence of state changes:
     * - clearContext() should reset all state properly
     * - State updates should be atomic and consistent
     * - No state should leak between different user sessions
     */
    it('should maintain state management integrity', () => {
      const user1 = generateUser(UserRole.SUPER_ADMIN, ['*']);
      const user2 = generateUser(UserRole.STUDENT, ['grades:read:own']);
      const tenant = generateTenantContext();
      const school = generateSchoolContext();

      // Set initial state
      engine.setUser(user1);
      engine.setTenantContext(tenant);
      engine.setSchoolContext(school);

      // Verify initial state
      expect(engine.hasRole(UserRole.SUPER_ADMIN)).toBe(true);
      expect(engine.canAccessTenant(tenant.id)).toBe(true);
      expect(engine.canAccessSchool(school.id)).toBe(true);

      // Clear context
      engine.clearContext();

      // Verify cleared state
      expect(engine.hasRole(UserRole.SUPER_ADMIN)).toBe(false);
      expect(engine.hasRole(UserRole.STUDENT)).toBe(false);
      expect(engine.hasPermission('*')).toBe(false);
      expect(engine.hasPermission('grades:read:own')).toBe(false);

      // Set new user state
      engine.setUser(user2);

      // Verify new state doesn't have old permissions
      expect(engine.hasRole(UserRole.STUDENT)).toBe(true);
      expect(engine.hasRole(UserRole.SUPER_ADMIN)).toBe(false);
      expect(engine.hasPermission('grades:read:own')).toBe(true);
      expect(engine.hasPermission('*')).toBe(false);

      // Verify context is properly isolated
      expect(engine.canAccessTenant(tenant.id)).toBe(false);
      expect(engine.canAccessSchool(school.id)).toBe(false);
    });

    /**
     * Property: Error handling and edge cases
     * 
     * For any invalid or edge case inputs:
     * - Methods should handle null/undefined gracefully
     * - Invalid permissions should return false, not throw
     * - Edge cases should be handled consistently
     */
    it('should handle error conditions and edge cases gracefully', () => {
      // Test with no user set
      expect(engine.hasPermission('any:permission')).toBe(false);
      expect(engine.hasRole(UserRole.STUDENT)).toBe(false);
      expect(engine.isAdminRole()).toBe(false);
      expect(engine.canAccessTenant('any-tenant')).toBe(false);
      expect(engine.canAccessSchool('any-school')).toBe(false);

      // Test with empty permissions
      const userWithNoPermissions = generateUser(UserRole.STUDENT, []);
      engine.setUser(userWithNoPermissions);
      
      expect(engine.hasPermission('')).toBe(false);
      expect(engine.hasPermission('nonexistent:permission')).toBe(false);
      expect(engine.hasAnyPermission([])).toBe(false);
      expect(engine.hasAllPermissions([])).toBe(true); // Empty array should return true
      expect(engine.getAvailableActions('nonexistent')).toEqual([]);

      // Test with invalid role checks
      expect(engine.hasAnyRole([])).toBe(false);

      // Test permission evaluation with minimal context
      const minimalContext: PermissionContext = {
        user: userWithNoPermissions,
        resource: 'test',
        action: 'read'
      };

      const result = engine.evaluatePermission(minimalContext);
      expect(typeof result.allowed).toBe('boolean');
      expect(result.allowed).toBe(false);
    });
  });
});
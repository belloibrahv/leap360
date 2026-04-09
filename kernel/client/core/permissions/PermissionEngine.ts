/**
 * Permission Engine
 * 
 * Core permission checking and evaluation system for role-based access control.
 * Provides centralized permission management with context-aware evaluation.
 */

import {
  IPermissionEngine,
  PermissionContext,
  PermissionCheckResult,
  Permission,
  PermissionCondition,
  hasPermissionUtil,
  hasAnyPermissionUtil,
  hasAllPermissionsUtil,
  isAdminRoleUtil,
  canAccessTenantUtil,
  canAccessSchoolUtil,
} from '@/types';
import { ROLE_PERMISSIONS } from '@/types/permissions';
import { UserRole, EnhancedUser, TenantContext, SchoolContext } from '@/types';

export class PermissionEngine implements IPermissionEngine {
  private user: EnhancedUser | null = null;
  private tenantContext: TenantContext | null = null;
  private schoolContext: SchoolContext | null = null;
  private permissions: Set<string> = new Set();
  private roles: UserRole[] = [];

  constructor(user?: EnhancedUser, tenantContext?: TenantContext) {
    if (user) {
      this.setUser(user);
    }
    if (tenantContext) {
      this.setTenantContext(tenantContext);
    }
  }

  // User and context management
  setUser(user: EnhancedUser): void {
    this.user = user;
    this.roles = user.effectiveRoles || [user.role];
    this.permissions = new Set(user.permissions || []);
    
    // Add role-based permissions
    this.roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => {
        this.permissions.add(permission);
      });
    });
  }

  setTenantContext(tenantContext: TenantContext): void {
    this.tenantContext = tenantContext;
  }

  setSchoolContext(schoolContext: SchoolContext): void {
    this.schoolContext = schoolContext;
  }

  setContext(context: PermissionContext): void {
    this.setUser(context.user);
    this.setTenantContext(context.tenant);
    if (context.school) {
      this.setSchoolContext(context.school);
    }
  }

  clearContext(): void {
    this.user = null;
    this.tenantContext = null;
    this.schoolContext = null;
    this.permissions.clear();
    this.roles = [];
  }

  updatePermissions(permissions: string[]): void {
    this.permissions = new Set(permissions);
  }

  // Core permission checking
  hasPermission(permission: string): boolean {
    if (!this.user) return false;
    
    // Super admin has all permissions
    if (this.permissions.has('*')) return true;
    
    // Check direct permission
    if (this.permissions.has(permission)) return true;
    
    // Check role-based permissions
    return this.roles.some(role => hasPermissionUtil(role, permission));
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (!this.user) return false;
    
    // Super admin has all permissions
    if (this.permissions.has('*')) return true;
    
    return permissions.some(permission => this.hasPermission(permission));
  }

  hasAllPermissions(permissions: string[]): boolean {
    if (!this.user) return false;
    
    // Super admin has all permissions
    if (this.permissions.has('*')) return true;
    
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Role-based checks
  hasRole(role: UserRole): boolean {
    if (!this.user) return false;
    return this.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    if (!this.user) return false;
    return roles.some(role => this.hasRole(role));
  }

  isAdminRole(): boolean {
    if (!this.user) return false;
    return this.roles.some(role => isAdminRoleUtil(role));
  }

  // Context-aware permissions
  canAccessTenant(tenantId: string): boolean {
    if (!this.user) return false;
    
    // Super admin can access all tenants
    if (this.hasRole(UserRole.SUPER_ADMIN)) return true;
    
    // Check if user has membership in this tenant
    return this.user.tenants.some(t => t.tenantId === tenantId);
  }

  canAccessSchool(schoolId: string): boolean {
    if (!this.user) return false;
    
    // Super admin can access all schools
    if (this.hasRole(UserRole.SUPER_ADMIN)) return true;
    
    // Check if user has access to any school with this ID across their tenants
    return this.user.tenants.some(tenant => 
      tenant.schools.some(school => school.schoolId === schoolId)
    );
  }

  canAccessStudent(studentId: string): boolean {
    if (!this.user) return false;
    
    // Super admin and tenant admin can access all students
    if (this.hasRole(UserRole.SUPER_ADMIN) || this.hasRole(UserRole.TENANT_ADMIN)) {
      return true;
    }
    
    // School admin can access students in their school
    if (this.hasRole(UserRole.SCHOOL_ADMIN) || this.hasRole(UserRole.PRINCIPAL)) {
      // This would require additional context about which school the student belongs to
      // For now, we'll return true if they have the general students:read permission
      return this.hasPermission('students:read');
    }
    
    // Teachers can access students in their classes
    if (this.hasRole(UserRole.TEACHER)) {
      // This would require checking if the student is in any of the teacher's classes
      // For now, we'll return true if they have the class-specific permission
      return this.hasPermission('students:read:class');
    }
    
    // Parents can access their own children
    if (this.hasRole(UserRole.PARENT)) {
      // This would require checking the parent-student relationship
      // For now, we'll return true if they have the children permission
      return this.hasPermission('students:read:children');
    }
    
    // Students can only access their own data
    if (this.hasRole(UserRole.STUDENT)) {
      // This would require checking if the studentId matches the current user
      return this.user.id === studentId;
    }
    
    return false;
  }

  // Dynamic permission evaluation
  evaluatePermission(context: PermissionContext): PermissionCheckResult {
    const { resource, action, metadata } = context;
    const permission = `${resource}:${action}`;
    
    // Basic permission check
    const hasBasicPermission = this.hasPermission(permission);
    
    if (!hasBasicPermission) {
      return {
        allowed: false,
        reason: `Missing permission: ${permission}`,
      };
    }
    
    // Evaluate additional conditions based on context
    const conditions = this.evaluateConditions(context);
    
    if (conditions.length > 0) {
      const allConditionsMet = conditions.every(condition => 
        this.evaluateCondition(condition, context)
      );
      
      if (!allConditionsMet) {
        return {
          allowed: false,
          reason: 'Permission conditions not met',
          conditions,
        };
      }
    }
    
    return {
      allowed: true,
      conditions,
      metadata,
    };
  }

  getAvailableActions(resource: string): string[] {
    const actions: string[] = [];
    
    // Check all permissions for this resource
    for (const permission of this.permissions) {
      if (permission === '*') {
        // Super admin has all actions
        return ['read', 'write', 'delete', 'admin'];
      }
      
      if (permission.startsWith(`${resource}:`)) {
        const action = permission.split(':')[1];
        if (action && !actions.includes(action)) {
          actions.push(action);
        }
      }
    }
    
    return actions;
  }

  // Private helper methods
  private evaluateConditions(context: PermissionContext): PermissionCondition[] {
    const conditions: PermissionCondition[] = [];
    
    // Add tenant-specific conditions
    if (context.tenant && this.tenantContext) {
      if (context.tenant.id !== this.tenantContext.id) {
        conditions.push({
          type: 'tenant',
          operator: 'equals',
          value: this.tenantContext.id,
        });
      }
    }
    
    // Add school-specific conditions for school-scoped roles
    if (context.school && this.schoolContext) {
      if ([UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL].some(role => this.hasRole(role))) {
        if (context.school.id !== this.schoolContext.id) {
          conditions.push({
            type: 'school',
            operator: 'equals',
            value: this.schoolContext.id,
          });
        }
      }
    }
    
    return conditions;
  }

  private evaluateCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    switch (condition.type) {
      case 'tenant':
        return this.evaluateTenantCondition(condition, context);
      case 'school':
        return this.evaluateSchoolCondition(condition, context);
      case 'class':
        return this.evaluateClassCondition(condition, context);
      case 'custom':
        return condition.customEvaluator ? condition.customEvaluator(context) : false;
      default:
        return false;
    }
  }

  private evaluateTenantCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    if (!context.tenant || !this.tenantContext) return false;
    
    switch (condition.operator) {
      case 'equals':
        return context.tenant.id === condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(context.tenant.id);
      default:
        return false;
    }
  }

  private evaluateSchoolCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    if (!context.school || !this.schoolContext) return false;
    
    switch (condition.operator) {
      case 'equals':
        return context.school.id === condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(context.school.id);
      default:
        return false;
    }
  }

  private evaluateClassCondition(condition: PermissionCondition, context: PermissionContext): boolean {
    if (!this.user) return false;
    
    // For teachers, check if they have access to the specific class
    if (this.hasRole(UserRole.TEACHER)) {
      const currentTenant = this.user.tenants.find(t => t.tenantId === this.tenantContext?.id);
      if (currentTenant) {
        const schoolMembership = currentTenant.schools.find(s => s.schoolId === context.school?.id);
        if (schoolMembership && schoolMembership.classes) {
          switch (condition.operator) {
            case 'equals':
              return schoolMembership.classes.includes(condition.value);
            case 'in':
              return Array.isArray(condition.value) && 
                     condition.value.some(classId => schoolMembership.classes!.includes(classId));
            default:
              return false;
          }
        }
      }
    }
    
    return false;
  }

  // Debugging and introspection
  getDebugInfo(): {
    user: EnhancedUser | null;
    tenantContext: TenantContext | null;
    schoolContext: SchoolContext | null;
    permissions: string[];
    roles: UserRole[];
  } {
    return {
      user: this.user,
      tenantContext: this.tenantContext,
      schoolContext: this.schoolContext,
      permissions: Array.from(this.permissions),
      roles: this.roles,
    };
  }
}
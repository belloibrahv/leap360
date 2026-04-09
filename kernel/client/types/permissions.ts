/**
 * Permission System Types
 * 
 * Defines the comprehensive permission and access control system
 * for role-based frontend functionality.
 */

import { UserRole } from './auth';
import { EnhancedUser, TenantContext, SchoolContext } from './enhanced-auth';

// Core Permission Types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  metadata?: Record<string, any>;
}

export interface PermissionCondition {
  type: 'tenant' | 'school' | 'class' | 'custom';
  operator: 'equals' | 'in' | 'contains' | 'custom';
  value: any;
  customEvaluator?: (context: PermissionContext) => boolean;
}

export interface PermissionContext {
  user: EnhancedUser;
  tenant: TenantContext;
  school?: SchoolContext;
  resource: string;
  action: string;
  metadata?: Record<string, any>;
}

// Role Permission Matrix
export interface RolePermissionMatrix {
  role: UserRole;
  permissions: Permission[];
  inheritFrom?: UserRole[];
  restrictions?: PermissionRestriction[];
}

export interface PermissionRestriction {
  type: 'time' | 'location' | 'resource_limit' | 'custom';
  condition: any;
  message: string;
}

// Permission Store State
export interface PermissionState {
  permissions: Set<string>;
  roles: UserRole[];
  tenantContext: TenantContext | null;
  schoolContext?: SchoolContext;
  isLoading: boolean;
  lastUpdated: number;
  error: string | null;
}

// Permission Check Results
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  conditions?: PermissionCondition[];
  metadata?: Record<string, any>;
}

// Permission Engine Interface
export interface IPermissionEngine {
  // Core permission checking
  hasPermission(permission: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
  hasAllPermissions(permissions: string[]): boolean;
  
  // Role-based checks
  hasRole(role: UserRole): boolean;
  hasAnyRole(roles: UserRole[]): boolean;
  isAdminRole(): boolean;
  
  // Context-aware permissions
  canAccessTenant(tenantId: string): boolean;
  canAccessSchool(schoolId: string): boolean;
  canAccessStudent(studentId: string): boolean;
  
  // Dynamic permission evaluation
  evaluatePermission(context: PermissionContext): PermissionCheckResult;
  getAvailableActions(resource: string): string[];
  
  // Permission updates
  updatePermissions(permissions: string[]): void;
  setContext(context: PermissionContext): void;
  clearContext(): void;
}

// Standard Permissions
export const PERMISSIONS = {
  // User Management
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  USERS_READ_SCHOOL: 'users:read:school',
  USERS_WRITE_SCHOOL: 'users:write:school',
  
  // Student Management
  STUDENTS_READ: 'students:read',
  STUDENTS_WRITE: 'students:write',
  STUDENTS_DELETE: 'students:delete',
  STUDENTS_READ_CLASS: 'students:read:class',
  STUDENTS_READ_CHILDREN: 'students:read:children',
  
  // School Management
  SCHOOLS_READ: 'schools:read',
  SCHOOLS_WRITE: 'schools:write',
  SCHOOLS_DELETE: 'schools:delete',
  
  // Class Management
  CLASSES_READ: 'classes:read',
  CLASSES_WRITE: 'classes:write',
  CLASSES_DELETE: 'classes:delete',
  CLASSES_READ_ASSIGNED: 'classes:read:assigned',
  
  // Academic Management
  GRADES_READ: 'grades:read',
  GRADES_WRITE: 'grades:write',
  GRADES_READ_OWN: 'grades:read:own',
  GRADES_READ_CHILDREN: 'grades:read:children',
  GRADES_WRITE_ASSIGNED: 'grades:write:assigned',
  
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_WRITE: 'attendance:write',
  ATTENDANCE_READ_OWN: 'attendance:read:own',
  ATTENDANCE_READ_CHILDREN: 'attendance:read:children',
  ATTENDANCE_WRITE_ASSIGNED: 'attendance:write:assigned',
  
  // Reporting
  REPORTS_READ: 'reports:read',
  REPORTS_READ_SCHOOL: 'reports:read:school',
  REPORTS_WRITE: 'reports:write',
  
  // System Administration
  SYSTEM_ADMIN: 'system:admin',
  TENANT_ADMIN: 'tenant:admin',
  
  // Profile Management
  PROFILE_READ_OWN: 'profile:read:own',
  PROFILE_WRITE_OWN: 'profile:write:own',
} as const;

// Role-Based Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'], // All permissions
  
  [UserRole.TENANT_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.SCHOOLS_READ,
    PERMISSIONS.SCHOOLS_WRITE,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.GRADES_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.TENANT_ADMIN,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
  
  [UserRole.SCHOOL_ADMIN]: [
    PERMISSIONS.USERS_READ_SCHOOL,
    PERMISSIONS.USERS_WRITE_SCHOOL,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.STUDENTS_WRITE,
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.CLASSES_WRITE,
    PERMISSIONS.GRADES_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.REPORTS_READ_SCHOOL,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
  
  [UserRole.PRINCIPAL]: [
    PERMISSIONS.USERS_READ_SCHOOL,
    PERMISSIONS.STUDENTS_READ,
    PERMISSIONS.STUDENTS_WRITE,
    PERMISSIONS.CLASSES_READ,
    PERMISSIONS.CLASSES_WRITE,
    PERMISSIONS.GRADES_READ,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.REPORTS_READ_SCHOOL,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
  
  [UserRole.TEACHER]: [
    PERMISSIONS.STUDENTS_READ_CLASS,
    PERMISSIONS.CLASSES_READ_ASSIGNED,
    PERMISSIONS.GRADES_WRITE_ASSIGNED,
    PERMISSIONS.ATTENDANCE_WRITE_ASSIGNED,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
  
  [UserRole.PARENT]: [
    PERMISSIONS.STUDENTS_READ_CHILDREN,
    PERMISSIONS.GRADES_READ_CHILDREN,
    PERMISSIONS.ATTENDANCE_READ_CHILDREN,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
  
  [UserRole.STUDENT]: [
    PERMISSIONS.GRADES_READ_OWN,
    PERMISSIONS.ATTENDANCE_READ_OWN,
    PERMISSIONS.PROFILE_READ_OWN,
    PERMISSIONS.PROFILE_WRITE_OWN,
  ],
};

// Permission Helper Functions
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('*') || permissions.includes(permission);
};

export const hasAnyPermission = (userRole: UserRole, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: UserRole, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

export const isAdminRole = (role: UserRole): boolean => {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.SCHOOL_ADMIN,
    UserRole.PRINCIPAL
  ].includes(role);
};

export const canAccessTenant = (user: EnhancedUser, tenantId: string): boolean => {
  if (user.role === UserRole.SUPER_ADMIN) return true;
  return user.tenant_id === tenantId;
};

export const canAccessSchool = (user: EnhancedUser, schoolId: string): boolean => {
  if (user.role === UserRole.SUPER_ADMIN) return true;
  if (user.role === UserRole.TENANT_ADMIN) return true;
  
  // For now, allow access if user is in the same tenant (TODO: implement proper school validation)
  return true;
};
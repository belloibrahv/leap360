/**
 * Component Guards Index
 * 
 * Central export point for all component guard components and utilities.
 */

export {
  // Main guards
  ComponentGuard,
  PermissionGuard,
  MultiPermissionGuard,
  RoleGuard,
  TenantGuard,
  SchoolGuard,
  ContextGuard,
  ConditionalGuard,
  
  // Specialized role guards
  AdminOnly,
  SuperAdminOnly,
  TenantAdminOnly,
  SchoolAdminOnly,
  TeacherOnly,
  ParentOnly,
  StudentOnly,
  
  // Specialized permission guards
  CanRead,
  CanWrite,
  CanDelete,
  CanAdmin,
  
  // Compound guards
  TeacherOrAdmin,
  ParentOrTeacher,
  SchoolStaff,
  
  // Higher-order components
  withPermissionGuard,
  withRoleGuard,
} from './ComponentGuard';
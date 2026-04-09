/**
 * Permission System Demo Component
 * 
 * Demonstrates the new role-based permission system and component guards.
 */

"use client";

import React from 'react';
import { UserRole } from '@/types';
import { 
  PermissionGuard,
  RoleGuard,
  AdminOnly,
  TeacherOnly,
  StudentOnly,
  CanRead,
  CanWrite,
  MultiPermissionGuard
} from '@/core/guards';
import { useAuth, usePermission } from '@/core/hooks';

export const PermissionDemo: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { permissions, roles, hasPermission, hasRole } = usePermission();

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Authentication Required
        </h3>
        <p className="text-yellow-700">
          Please log in to see the permission system demo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Permission System Demo
        </h2>
        <p className="text-gray-600">
          This demo shows how the new role-based permission system works with component guards.
        </p>
      </div>

      {/* User Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Current User</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Email:</span> {user?.email}
          </div>
          <div>
            <span className="font-medium">Role:</span> {user?.role}
          </div>
          <div>
            <span className="font-medium">Roles:</span> {roles.join(', ')}
          </div>
          <div>
            <span className="font-medium">Permissions:</span> {Array.from(permissions).slice(0, 3).join(', ')}
            {permissions.size > 3 && ` (+${permissions.size - 3} more)`}
          </div>
        </div>
      </div>

      {/* Role-Based Guards Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Role-Based Component Guards</h3>
        
        <AdminOnly fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Admin access required
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Admin-only content visible
          </div>
        </AdminOnly>

        <TeacherOnly fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Teacher access required
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Teacher-only content visible
          </div>
        </TeacherOnly>

        <StudentOnly fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Student access required
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Student-only content visible
          </div>
        </StudentOnly>
      </div>

      {/* Permission-Based Guards Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Permission-Based Component Guards</h3>
        
        <CanRead resource="schools" fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Cannot read schools
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Can read schools
          </div>
        </CanRead>

        <CanWrite resource="students" fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Cannot write students
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Can write students
          </div>
        </CanWrite>

        <PermissionGuard permission="reports:admin" fallback={
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ❌ Cannot admin reports
          </div>
        }>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Can admin reports
          </div>
        </PermissionGuard>
      </div>

      {/* Multi-Permission Guards Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Multi-Permission Guards</h3>
        
        <MultiPermissionGuard 
          permissions={['schools:read', 'students:read']} 
          mode="any"
          fallback={
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ Need either schools:read OR students:read
            </div>
          }
        >
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Has either schools:read OR students:read
          </div>
        </MultiPermissionGuard>

        <MultiPermissionGuard 
          permissions={['schools:read', 'students:read']} 
          mode="all"
          fallback={
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ Need both schools:read AND students:read
            </div>
          }
        >
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Has both schools:read AND students:read
          </div>
        </MultiPermissionGuard>
      </div>

      {/* Complex Role Guards Demo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Complex Role Guards</h3>
        
        <RoleGuard 
          roles={[UserRole.TEACHER, UserRole.SCHOOL_ADMIN]} 
          mode="any"
          fallback={
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ Need Teacher OR School Admin role
            </div>
          }
        >
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            ✅ Has Teacher OR School Admin role
          </div>
        </RoleGuard>
      </div>

      {/* Permission Check Results */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Direct Permission Checks</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="font-medium">Role Checks:</div>
            <div>Super Admin: {hasRole(UserRole.SUPER_ADMIN) ? '✅' : '❌'}</div>
            <div>Tenant Admin: {hasRole(UserRole.TENANT_ADMIN) ? '✅' : '❌'}</div>
            <div>School Admin: {hasRole(UserRole.SCHOOL_ADMIN) ? '✅' : '❌'}</div>
            <div>Teacher: {hasRole(UserRole.TEACHER) ? '✅' : '❌'}</div>
            <div>Parent: {hasRole(UserRole.PARENT) ? '✅' : '❌'}</div>
            <div>Student: {hasRole(UserRole.STUDENT) ? '✅' : '❌'}</div>
          </div>
          
          <div className="space-y-2">
            <div className="font-medium">Permission Checks:</div>
            <div>schools:read: {hasPermission('schools:read') ? '✅' : '❌'}</div>
            <div>students:read: {hasPermission('students:read') ? '✅' : '❌'}</div>
            <div>users:write: {hasPermission('users:write') ? '✅' : '❌'}</div>
            <div>reports:admin: {hasPermission('reports:admin') ? '✅' : '❌'}</div>
            <div>*: {hasPermission('*') ? '✅' : '❌'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
# Enhanced Authentication Hooks

This directory contains comprehensive authentication, permission, and context management hooks for the role-based frontend system.

## Overview

The enhanced authentication system provides:

- **Multi-tenant authentication** with context switching
- **Granular permission system** with role-based access control
- **Real-time synchronization** of permissions and user context
- **Specialized guard hooks** for different access scenarios
- **Resource-based access control** for dynamic permissions
- **Performance optimization** with caching and memoization

## Core Hooks

### `useEnhancedAuth()`

The main authentication hook that provides comprehensive auth state and actions.

```typescript
const auth = useEnhancedAuth();

// State
auth.user              // Enhanced user object with permissions
auth.isAuthenticated   // Authentication status
auth.isLoading        // Loading state
auth.currentTenant    // Current tenant context
auth.availableTenants // Available tenants for user

// Actions
auth.login(credentials)     // Login with credentials
auth.logout()              // Logout and clear state
auth.switchTenant(id)      // Switch tenant context
auth.refreshProfile()      // Refresh user profile
```

### `usePermission()`

Comprehensive permission checking with role-based access control.

```typescript
const permission = usePermission();

// Permission checking
permission.hasPermission('users:read')
permission.hasAnyPermission(['users:read', 'users:write'])
permission.hasAllPermissions(['users:read', 'users:write'])

// Role checking
permission.hasRole(UserRole.TEACHER)
permission.hasAnyRole([UserRole.TEACHER, UserRole.ADMIN])
permission.isAdminRole()

// Context-aware permissions
permission.canAccessTenant('tenant-id')
permission.canAccessSchool('school-id')
permission.canAccessStudent('student-id')

// Resource access
permission.canRead('students')
permission.canWrite('grades')
permission.canDelete('users')
```

### `useTenantContext()`

Multi-tenant context management with switching capabilities.

```typescript
const tenantContext = useTenantContext();

// Current context
tenantContext.currentTenant      // Current tenant object
tenantContext.availableTenants   // Available tenants
tenantContext.hasMultipleTenants // Boolean flag

// Actions
tenantContext.switchTenant('tenant-id')  // Switch tenant
tenantContext.refreshTenantData()        // Refresh tenant data

// Utilities
tenantContext.getTenantById('id')        // Get tenant by ID
tenantContext.canSwitchTenants          // Can switch flag
```

## Specialized Guard Hooks

### `usePermissionGuard(permission)`

Simple permission-based access control.

```typescript
const { canAccess, hasPermission } = usePermissionGuard('users:read');

if (canAccess) {
  // Render protected content
}
```

### `useRoleGuard(role)`

Role-based access control.

```typescript
const { canAccess, hasRole } = useRoleGuard(UserRole.TEACHER);
```

### `useMultiRoleGuard(roles, requireAll?)`

Multi-role access control with flexible requirements.

```typescript
const guard = useMultiRoleGuard(
  [UserRole.TEACHER, UserRole.ADMIN], 
  { requireAll: false }
);

guard.hasAccess      // Has any of the roles
guard.hasAllRoles    // Has all roles
guard.hasAnyRole     // Has any role
guard.roleResults    // Individual role results
```

### `useAdminGuard()`

Admin-level access control with level detection.

```typescript
const admin = useAdminGuard();

admin.isAdmin      // Is any admin role
admin.adminLevel   // 'super' | 'tenant' | 'school' | 'none'
admin.canAccess    // Can access admin features
```

### `useCRUDGuard(resource)`

CRUD operation guards for resources.

```typescript
const crud = useCRUDGuard('students');

crud.canCreate    // Can create students
crud.canRead      // Can read students
crud.canUpdate    // Can update students
crud.canDelete    // Can delete students
crud.hasAnyAccess // Has any CRUD access
crud.hasFullAccess // Has all CRUD access
```

## Advanced Hooks

### `useMultiPermissionGuard(permissions, options)`

Complex permission scenarios with multiple requirements.

```typescript
const guard = useMultiPermissionGuard(
  ['users:read', 'users:write', 'users:delete'],
  { requireAll: false }
);

guard.hasAccess              // Has access based on requirements
guard.permissionResults      // Individual permission results
guard.getMissingPermissions() // Get missing permissions
guard.getGrantedPermissions() // Get granted permissions
```

### `useResourceAccess(resource, context?)`

Dynamic resource-based permission checking.

```typescript
const access = useResourceAccess('students', {
  school: currentSchool,
  metadata: { classId: 'class-123' }
});

access.canRead       // Can read resource
access.canWrite      // Can write resource
access.canDelete     // Can delete resource
access.canExecute    // Can execute on resource
access.availableActions // Available actions array

// Dynamic evaluation
access.evaluateAccess('custom-action', additionalContext)
```

### `useRealtimeSync(config?)`

Real-time permission and context synchronization.

```typescript
const sync = useRealtimeSync({
  permissionSyncInterval: 30000,
  enableWebSocket: true,
  onPermissionUpdate: (permissions) => {
    console.log('Permissions updated:', permissions);
  }
});

sync.isConnected     // WebSocket connection status
sync.isOnline        // Network status
sync.lastSyncTime    // Last sync timestamp
sync.forceSync()     // Force immediate sync
sync.reconnect()     // Reconnect WebSocket
```

## Utility Hooks

### `useNavigationGuard(options)`

Navigation protection with automatic redirection.

```typescript
const guard = useNavigationGuard({
  requiredPermission: 'admin:access',
  requiredRole: UserRole.ADMIN,
  redirectTo: '/unauthorized'
});

// Automatically redirects if requirements not met
```

### `useConditionalRender(conditions)`

Conditional rendering based on permissions and roles.

```typescript
const { shouldRender, canRender } = useConditionalRender({
  permissions: ['users:read', 'users:write'],
  requireAll: false,
  fallback: <div>Access Denied</div>
});

return shouldRender ? <ProtectedContent /> : fallback;
```

## Usage Examples

### Basic Authentication Check

```typescript
function ProtectedComponent() {
  const { isAuthenticated, user } = useEnhancedAuth();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome, {user.full_name}!</div>;
}
```

### Permission-Based Rendering

```typescript
function StudentList() {
  const { canRead } = usePermission();
  
  if (!canRead('students')) {
    return <AccessDenied />;
  }
  
  return <StudentTable />;
}
```

### Multi-Tenant Context

```typescript
function TenantSwitcher() {
  const { 
    currentTenant, 
    availableTenants, 
    switchTenant,
    hasMultipleTenants 
  } = useTenantContext();
  
  if (!hasMultipleTenants) {
    return null;
  }
  
  return (
    <select 
      value={currentTenant?.id} 
      onChange={(e) => switchTenant(e.target.value)}
    >
      {availableTenants.map(tenant => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name}
        </option>
      ))}
    </select>
  );
}
```

### Complex Permission Logic

```typescript
function GradeManagement() {
  const multiGuard = useMultiPermissionGuard([
    'grades:read',
    'grades:write',
    'students:read'
  ], { requireAll: false });
  
  const gradeAccess = useResourceAccess('grades');
  
  if (!multiGuard.hasAccess) {
    return <AccessDenied />;
  }
  
  return (
    <div>
      {gradeAccess.canRead && <GradeViewer />}
      {gradeAccess.canWrite && <GradeEditor />}
      {gradeAccess.canDelete && <GradeDeleter />}
    </div>
  );
}
```

### Real-time Sync Integration

```typescript
function Dashboard() {
  const auth = useEnhancedAuth();
  const sync = useRealtimeSync({
    onPermissionUpdate: (permissions) => {
      // Handle permission updates
      toast.info('Permissions updated');
    },
    onSyncError: (error) => {
      toast.error('Sync failed: ' + error.message);
    }
  });
  
  return (
    <div>
      <SyncStatus 
        isOnline={sync.isOnline}
        lastSync={sync.lastSyncTime}
        error={sync.syncError}
      />
      <DashboardContent />
    </div>
  );
}
```

## Best Practices

### 1. Use Appropriate Hooks

- Use `usePermissionGuard` for simple permission checks
- Use `useMultiPermissionGuard` for complex scenarios
- Use `useResourceAccess` for dynamic resource permissions
- Use `useRealtimeSync` for applications requiring real-time updates

### 2. Performance Optimization

- Hooks are memoized and optimized for re-rendering
- Permission checks are cached automatically
- Use specific hooks rather than general ones when possible

### 3. Error Handling

- All hooks provide error states
- Use `useAuthError` for centralized error handling
- Implement fallback UI for permission failures

### 4. Security

- Always validate permissions on both client and server
- Use real-time sync to keep permissions current
- Implement proper error boundaries for auth failures

### 5. Testing

- Mock hooks in tests using the provided interfaces
- Test permission logic with different user roles
- Verify tenant switching and context management

## Migration from Legacy Hooks

The enhanced hooks are backward compatible with existing `useAuth` implementations:

```typescript
// Legacy
const { user, hasPermission } = useAuth();

// Enhanced (same interface, more features)
const { user, hasPermission } = useEnhancedAuth();

// Or use the composite hook
const auth = useAuth(); // Includes all enhanced features
```

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
import type { 
  UseEnhancedAuthReturn,
  UsePermissionReturn,
  UseTenantContextReturn 
} from '@/core/hooks';
```

## Performance Considerations

- Hooks use Zustand for efficient state management
- Permission checks are memoized and cached
- Real-time sync is optimized with intervals and WebSocket
- Component re-renders are minimized through selective subscriptions

For more examples, see the `examples/` directory in this folder.
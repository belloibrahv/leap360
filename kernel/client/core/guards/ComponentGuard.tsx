/**
 * Component Guard System
 * 
 * Permission-based component rendering with role-based, permission-based,
 * and context-aware guards with fallback content and loading states.
 */

import React, { ReactNode, useMemo } from 'react';
import { 
  UserRole, 
  PermissionContext, 
  TenantContext, 
  SchoolContext 
} from '@/types';
import { 
  usePermission, 
  useHasPermission, 
  useHasAnyPermission, 
  useHasAllPermissions,
  useHasRole,
  useHasAnyRole,
  useCanAccessTenant,
  useCanAccessSchool,
  usePermissionEvaluation
} from '@/core/hooks/usePermission';

interface BaseGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loading?: ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

interface PermissionGuardProps extends BaseGuardProps {
  permission: string;
}

interface MultiPermissionGuardProps extends BaseGuardProps {
  permissions: string[];
  mode?: 'any' | 'all';
}

interface RoleGuardProps extends BaseGuardProps {
  role?: UserRole;
  roles?: UserRole[];
  mode?: 'any' | 'all';
}

interface TenantGuardProps extends BaseGuardProps {
  tenantId: string;
}

interface SchoolGuardProps extends BaseGuardProps {
  schoolId: string;
}

interface ContextGuardProps extends BaseGuardProps {
  context: PermissionContext;
}

interface ConditionalGuardProps extends BaseGuardProps {
  condition: boolean;
}

/**
 * Default fallback components
 */
const DefaultFallback: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex items-center justify-center p-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
    <div className="text-center">
      <div className="text-sm font-medium">Access Restricted</div>
      {message && <div className="text-xs mt-1">{message}</div>}
    </div>
  </div>
);

const DefaultLoading: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Main Component Guard - Wrapper component for permission-based rendering
 */
export const ComponentGuard: React.FC<BaseGuardProps & {
  condition: boolean;
}> = ({ 
  children, 
  condition, 
  fallback, 
  loading, 
  showError = false, 
  errorMessage 
}) => {
  const { isLoading, error } = usePermission();

  // Show loading state
  if (isLoading) {
    return <>{loading || <DefaultLoading />}</>;
  }

  // Show error state if enabled
  if (showError && error) {
    return (
      <DefaultFallback message={errorMessage || error} />
    );
  }

  // Show content or fallback based on condition
  if (condition) {
    return <>{children}</>;
  }

  return <>{fallback || <DefaultFallback message={errorMessage} />}</>;
};

/**
 * Permission Guard - Checks single permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const hasPermission = useHasPermission(permission);

  return (
    <ComponentGuard
      condition={hasPermission}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || `Missing permission: ${permission}`}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Multi-Permission Guard - Checks multiple permissions
 */
export const MultiPermissionGuard: React.FC<MultiPermissionGuardProps> = ({
  permissions,
  mode = 'any',
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const hasAnyPermission = useHasAnyPermission(permissions);
  const hasAllPermissions = useHasAllPermissions(permissions);
  
  const hasAccess = mode === 'any' ? hasAnyPermission : hasAllPermissions;

  return (
    <ComponentGuard
      condition={hasAccess}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || `Missing permissions: ${permissions.join(', ')}`}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Role Guard - Checks user roles
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  roles,
  mode = 'any',
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const roleArray = roles || (role ? [role] : []);
  const hasRole = useHasRole(role!);
  const hasAnyRole = useHasAnyRole(roleArray);
  
  const hasAccess = useMemo(() => {
    if (role && !roles) return hasRole;
    if (roles && roles.length > 0) {
      return mode === 'any' ? hasAnyRole : roles.every(r => useHasRole(r));
    }
    return false;
  }, [role, roles, mode, hasRole, hasAnyRole]);

  return (
    <ComponentGuard
      condition={hasAccess}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || `Required role: ${roleArray.join(' or ')}`}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Tenant Guard - Checks tenant access
 */
export const TenantGuard: React.FC<TenantGuardProps> = ({
  tenantId,
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const canAccess = useCanAccessTenant(tenantId);

  return (
    <ComponentGuard
      condition={canAccess}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || `Access denied to tenant: ${tenantId}`}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * School Guard - Checks school access
 */
export const SchoolGuard: React.FC<SchoolGuardProps> = ({
  schoolId,
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const canAccess = useCanAccessSchool(schoolId);

  return (
    <ComponentGuard
      condition={canAccess}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || `Access denied to school: ${schoolId}`}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Context Guard - Advanced permission evaluation with context
 */
export const ContextGuard: React.FC<ContextGuardProps> = ({
  context,
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  const evaluation = usePermissionEvaluation(context);

  return (
    <ComponentGuard
      condition={evaluation.isAllowed}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage || evaluation.reason}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Conditional Guard - Simple boolean condition guard
 */
export const ConditionalGuard: React.FC<ConditionalGuardProps> = ({
  condition,
  children,
  fallback,
  loading,
  showError,
  errorMessage,
}) => {
  return (
    <ComponentGuard
      condition={condition}
      fallback={fallback}
      loading={loading}
      showError={showError}
      errorMessage={errorMessage}
    >
      {children}
    </ComponentGuard>
  );
};

/**
 * Specialized Role Guards
 */

export const AdminOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard
    roles={[UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL]}
    mode="any"
    {...props}
  />
);

export const SuperAdminOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard role={UserRole.SUPER_ADMIN} {...props} />
);

export const TenantAdminOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard role={UserRole.TENANT_ADMIN} {...props} />
);

export const SchoolAdminOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard
    roles={[UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL]}
    mode="any"
    {...props}
  />
);

export const TeacherOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard role={UserRole.TEACHER} {...props} />
);

export const ParentOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard role={UserRole.PARENT} {...props} />
);

export const StudentOnly: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard role={UserRole.STUDENT} {...props} />
);

/**
 * Specialized Permission Guards
 */

export const CanRead: React.FC<BaseGuardProps & { resource: string }> = ({ 
  resource, 
  ...props 
}) => (
  <PermissionGuard permission={`${resource}:read`} {...props} />
);

export const CanWrite: React.FC<BaseGuardProps & { resource: string }> = ({ 
  resource, 
  ...props 
}) => (
  <PermissionGuard permission={`${resource}:write`} {...props} />
);

export const CanDelete: React.FC<BaseGuardProps & { resource: string }> = ({ 
  resource, 
  ...props 
}) => (
  <PermissionGuard permission={`${resource}:delete`} {...props} />
);

export const CanAdmin: React.FC<BaseGuardProps & { resource: string }> = ({ 
  resource, 
  ...props 
}) => (
  <PermissionGuard permission={`${resource}:admin`} {...props} />
);

/**
 * Compound Guards
 */

export const TeacherOrAdmin: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard
    roles={[
      UserRole.TEACHER,
      UserRole.SCHOOL_ADMIN,
      UserRole.PRINCIPAL,
      UserRole.TENANT_ADMIN,
      UserRole.SUPER_ADMIN
    ]}
    mode="any"
    {...props}
  />
);

export const ParentOrTeacher: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard
    roles={[UserRole.PARENT, UserRole.TEACHER]}
    mode="any"
    {...props}
  />
);

export const SchoolStaff: React.FC<BaseGuardProps> = (props) => (
  <RoleGuard
    roles={[
      UserRole.TEACHER,
      UserRole.SCHOOL_ADMIN,
      UserRole.PRINCIPAL
    ]}
    mode="any"
    {...props}
  />
);

/**
 * Higher-Order Component for permission wrapping
 */
export function withPermissionGuard<P extends object>(
  Component: React.ComponentType<P>,
  permission: string,
  fallback?: ReactNode
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGuard permission={permission} fallback={fallback}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

/**
 * Higher-Order Component for role wrapping
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  roles: UserRole | UserRole[],
  fallback?: ReactNode
) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return function RoleWrappedComponent(props: P) {
    return (
      <RoleGuard roles={roleArray} fallback={fallback}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
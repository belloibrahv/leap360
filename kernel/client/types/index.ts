/**
 * Enhanced Types Index
 * 
 * Central export point for all enhanced type definitions
 * used in the role-based frontend system.
 */

import { UserRole } from './auth';
import { PermissionContext } from './permissions';
import type {
  BreadcrumbItem as BreadcrumbItemType,
  DashboardLayoutType as DashboardLayoutTypeType,
  DeviceType as DeviceTypeType,
  NavigationMenu as NavigationMenuType,
  ScreenSize as ScreenSizeType,
  WidgetInstance as WidgetInstanceType,
} from './navigation';
import type { EnhancedUser as EnhancedUserType } from './enhanced-auth';

// Re-export original auth types (excluding conflicting ones)
export { 
  UserRole,
  ApiError, 
  getRoleDisplayName 
} from './auth';

export type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest, 
  TokenResponse, 
  UserProfileResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
  UserResponse,
  Pagination,
  SuccessResponse,
  ErrorResponse,
  AuthState,
  UserListParams
} from './auth';

// Enhanced authentication and user types
export * from './enhanced-auth';

// Permission system types (excluding conflicting ones)
export type {
  Permission,
  PermissionCondition,
  PermissionContext,
  RolePermissionMatrix,
  PermissionRestriction,
  PermissionState,
  PermissionCheckResult,
  IPermissionEngine
} from './permissions';

export { 
  PERMISSIONS,
  hasPermission as hasPermissionUtil,
  hasAnyPermission as hasAnyPermissionUtil,
  hasAllPermissions as hasAllPermissionsUtil,
  isAdminRole as isAdminRoleUtil,
  canAccessTenant as canAccessTenantUtil,
  canAccessSchool as canAccessSchoolUtil
} from './permissions';

// Navigation and UI types
export * from './navigation';

// Error handling types
export interface FrontendError {
  type: 'authentication' | 'authorization' | 'permission' | 'network' | 'validation' | 'system';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  route?: string;
  retryable?: boolean;
}

// API Client types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  status: string;
  data: T;
  message?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Component Guard types
export interface ComponentGuardProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: UserRole;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  requireAll?: boolean;
  context?: PermissionContext;
}

// Hook return types
export interface UseAuthReturn {
  user: EnhancedUserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: FrontendError | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
}

export interface UsePermissionReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  canAccessSchool: (schoolId: string) => boolean;
  isLoading: boolean;
}

export interface UseNavigationReturn {
  currentMenu: NavigationMenuType;
  activeRoute: string;
  breadcrumbs: BreadcrumbItemType[];
  isMobileMenuOpen: boolean;
  screenSize: ScreenSizeType;
  deviceType: DeviceTypeType;
  toggleMobileMenu: () => void;
  navigateTo: (route: string) => void;
  goBack: () => void;
}

export interface UseDashboardReturn {
  widgets: WidgetInstanceType[];
  layout: DashboardLayoutTypeType;
  isCustomizing: boolean;
  isLoading: boolean;
  addWidget: (widgetId: string) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<WidgetInstanceType>) => void;
  saveLayout: () => Promise<void>;
  resetLayout: () => void;
  toggleCustomizing: () => void;
}

// Form types for common operations
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
}

export interface TenantSwitchFormData {
  tenantId: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event types
export interface AuthEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'tenant_switch' | 'permission_update';
  timestamp: number;
  userId?: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface NavigationEvent {
  type: 'route_change' | 'menu_toggle' | 'breadcrumb_update';
  route: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PermissionEvent {
  type: 'permission_check' | 'access_denied' | 'context_update';
  permission?: string;
  resource?: string;
  action?: string;
  result: boolean;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Authentication API Types
 * Generated from OpenAPI specification
 */

// User Role Enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  SCHOOL_ADMIN = 'school_admin',
  PRINCIPAL = 'principal',
  TEACHER = 'teacher',
  PARENT = 'parent',
  STUDENT = 'student'
}

// Base User Interface
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Authentication Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface TokenResponse {
  status: string;
  data: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface UserProfileResponse {
  status: string;
  data: User;
}

// User Management Types
export interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface UsersListResponse {
  status: string;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

export interface UserResponse {
  status: string;
  data: User;
}

// Pagination Interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Common Response Types
export interface SuccessResponse {
  status: string;
  message: string;
}

export interface ErrorResponse {
  status?: string;
  message?: string;
  detail?: string | Array<{
    loc?: Array<string | number>;
    msg?: string;
    type?: string;
  }>;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

const getErrorMessage = (response: ErrorResponse): string => {
  if (response.message) {
    return response.message;
  }

  if (typeof response.detail === 'string') {
    return response.detail;
  }

  if (Array.isArray(response.detail) && response.detail.length > 0) {
    return response.detail
      .map((error) => error.msg || 'Request validation failed')
      .join(', ');
  }

  return 'Request failed';
};

// API Error Class
export class ApiError extends Error {
  public status: number;
  public response: ErrorResponse;

  constructor(status: number, response: ErrorResponse) {
    super(getErrorMessage(response));
    this.status = status;
    this.response = response;
    this.name = 'ApiError';
  }
}

// Authentication State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Query Parameters for User List
export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

// Role Permissions
export const ROLE_PERMISSIONS = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.TENANT_ADMIN]: [
    'users:read',
    'users:write',
    'schools:read',
    'schools:write',
    'reports:read'
  ],
  [UserRole.SCHOOL_ADMIN]: [
    'users:read',
    'users:write:school',
    'students:read',
    'students:write',
    'classes:read',
    'classes:write',
    'reports:read:school'
  ],
  [UserRole.PRINCIPAL]: [
    'users:read:school',
    'students:read',
    'students:write',
    'classes:read',
    'classes:write',
    'reports:read:school'
  ],
  [UserRole.TEACHER]: [
    'students:read:class',
    'classes:read:assigned',
    'grades:write:assigned',
    'attendance:write:assigned'
  ],
  [UserRole.PARENT]: [
    'students:read:children',
    'grades:read:children',
    'attendance:read:children'
  ],
  [UserRole.STUDENT]: [
    'grades:read:own',
    'attendance:read:own',
    'profile:read:own'
  ]
} as const;

// Helper Functions
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole] as readonly string[];
  return permissions.includes('*') || permissions.includes(permission);
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames = {
    [UserRole.SUPER_ADMIN]: 'Super Administrator',
    [UserRole.TENANT_ADMIN]: 'Tenant Administrator',
    [UserRole.SCHOOL_ADMIN]: 'School Administrator',
    [UserRole.PRINCIPAL]: 'Principal',
    [UserRole.TEACHER]: 'Teacher',
    [UserRole.PARENT]: 'Parent',
    [UserRole.STUDENT]: 'Student'
  };
  return roleNames[role];
};

export const isAdminRole = (role: UserRole): boolean => {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.SCHOOL_ADMIN,
    UserRole.PRINCIPAL
  ].includes(role);
};

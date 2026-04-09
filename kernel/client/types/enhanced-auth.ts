/**
 * Enhanced Authentication Types for Role-Based Frontend
 * 
 * Extends the basic auth types with multi-tenant support,
 * permission management, and enhanced user context.
 */

import { User, UserRole } from './auth';

// Device and Session Information
export interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export interface SessionInfo {
  sessionId: string;
  lastActivity: number;
  deviceInfo: DeviceInfo;
  ipAddress?: string;
  location?: string;
}

// Multi-Tenant Context
export interface TenantContext {
  id: string;
  name: string;
  slug: string;
  branding?: BrandingConfig;
  settings: TenantSettings;
  subscription: SubscriptionInfo;
}

export interface BrandingConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
  customCss?: string;
}

export interface TenantSettings {
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
  features: string[];
  maxUsers: number;
  maxSchools: number;
}

export interface SubscriptionInfo {
  plan: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  expiresAt: string;
  features: string[];
}

// School and Class Context
export interface SchoolContext {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface ClassContext {
  id: string;
  name: string;
  grade: string;
  schoolId: string;
}

// Multi-Tenant Membership
export interface TenantMembership {
  tenantId: string;
  tenantName: string;
  role: UserRole;
  permissions: string[];
  schools: SchoolMembership[];
  isActive: boolean;
  joinedAt: string;
}

export interface SchoolMembership {
  schoolId: string;
  schoolName: string;
  role?: UserRole;
  permissions: string[];
  classes?: string[];
  isActive: boolean;
}

// Enhanced User Model
export interface EnhancedUser extends User {
  // Multi-tenant context
  tenants: TenantMembership[];
  currentTenant: string;
  
  // Permission cache
  permissions: string[];
  effectiveRoles: UserRole[];
  
  // UI preferences
  preferences: UserPreferences;
  dashboardLayout?: DashboardLayout;
  
  // Session information
  sessionInfo: SessionInfo;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

// Dashboard Configuration
export interface DashboardLayout {
  widgets: WidgetPlacement[];
  columns: number;
  responsive: boolean;
  customizations: Record<string, any>;
}

export interface WidgetPlacement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

// Authentication State
export interface EnhancedAuthState {
  // Core auth state
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  
  // Multi-tenant context
  currentTenant: TenantContext | null;
  availableTenants: TenantContext[];
  
  // Session management
  sessionId: string | null;
  lastActivity: number;
  
  // Error handling
  error: AuthError | null;
  retryCount: number;
}

export interface AuthError {
  type: 'authentication' | 'authorization' | 'network' | 'validation' | 'system';
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  retryable: boolean;
}

// JWT Token Payload
export interface JWTPayload {
  sub: string; // user id
  email: string;
  tenant_id: string;
  role: UserRole;
  permissions: string[];
  exp: number;
  iat: number;
  type: 'access' | 'refresh';
  jti?: string; // JWT ID for refresh tokens
}

// API Response Types
export interface EnhancedLoginResponse {
  status: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: EnhancedUser;
    tenant: TenantContext;
    permissions: string[];
  };
}

export interface TenantSwitchResponse {
  status: string;
  data: {
    access_token: string;
    tenant: TenantContext;
    permissions: string[];
    user: EnhancedUser;
  };
}
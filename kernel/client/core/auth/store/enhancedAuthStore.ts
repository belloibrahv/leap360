/**
 * Enhanced Multi-Tenant Authentication Store
 * 
 * Manages authentication state with multi-tenant support, JWT parsing,
 * and automatic token refresh capabilities.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  EnhancedAuthState, 
  EnhancedUser, 
  TenantContext, 
  User,
  LoginRequest,
  LoginResponse,
  AuthError,
  UserRole,
  DeviceInfo,
} from '@/types';
import { AuthApiClient, TokenManager } from '../../services/authApi';
import { 
  isJWTExpired, 
  extractUserFromJWT, 
  willExpireSoon,
  getTimeUntilExpiry 
} from '../utils/jwtUtils';

interface EnhancedAuthStore extends Omit<EnhancedAuthState, 'refreshToken'> {
  // Authentication actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Multi-tenant actions
  switchTenant: (tenantId: string) => Promise<void>;
  setCurrentTenant: (tenant: TenantContext) => void;
  
  // Session management
  initializeSession: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateLastActivity: () => void;
  
  // Token management
  getValidToken: () => Promise<string | null>;
  scheduleTokenRefresh: () => void;
  clearTokenRefreshTimer: () => void;
  
  // Error handling
  setError: (error: AuthError | null) => void;
  clearError: () => void;
  
  // Utility methods
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  canAccessTenant: (tenantId: string) => boolean;
  
  // State properties from EnhancedAuthState
  refreshTokenValue: string | null; // Renamed to avoid conflict
}

// Token refresh timer
let tokenRefreshTimer: NodeJS.Timeout | null = null;

function createDefaultTenantSettings() {
  return {
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    currency: 'NGN',
    language: 'en',
    features: [],
    maxUsers: 1000,
    maxSchools: 10,
  };
}

function createDefaultSubscription() {
  return {
    plan: 'standard',
    status: 'active' as const,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    features: [],
  };
}

function createDefaultPreferences() {
  return {
    theme: 'light' as const,
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    notifications: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
      frequency: 'immediate' as const,
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
    },
  };
}

function resolveTenantId(
  user: User,
  tokenInfo: ReturnType<typeof extractUserFromJWT>,
  fallbackTenantId?: string | null
) {
  const tenantId = tokenInfo?.tenantId || user.tenant_id || fallbackTenantId;

  if (!tenantId) {
    throw new Error('Authenticated user is missing a tenant identifier');
  }

  return tenantId;
}

function createTenantContext(tenantId: string, existingTenant?: TenantContext | null): TenantContext {
  return {
    id: tenantId,
    name: existingTenant?.name || 'Current Tenant',
    slug: existingTenant?.slug || tenantId,
    branding: existingTenant?.branding,
    settings: existingTenant?.settings || createDefaultTenantSettings(),
    subscription: existingTenant?.subscription || createDefaultSubscription(),
  };
}

function createEnhancedUser(
  user: User,
  tenant: TenantContext,
  tokenInfo: ReturnType<typeof extractUserFromJWT>,
  existingUser?: EnhancedUser | null
): EnhancedUser {
  const permissions = tokenInfo?.permissions || existingUser?.permissions || [];
  const existingTenantMembership = existingUser?.tenants.find(
    (membership) => membership.tenantId === tenant.id
  );

  return {
    ...user,
    permissions,
    effectiveRoles: [user.role],
    tenants: [{
      tenantId: tenant.id,
      tenantName: tenant.name,
      role: user.role,
      permissions,
      schools: existingTenantMembership?.schools || [],
      isActive: true,
      joinedAt: existingTenantMembership?.joinedAt || user.created_at || new Date().toISOString(),
    }],
    currentTenant: tenant.id,
    preferences: existingUser?.preferences || createDefaultPreferences(),
    dashboardLayout: existingUser?.dashboardLayout,
    sessionInfo: {
      sessionId: existingUser?.sessionInfo.sessionId || crypto.randomUUID(),
      lastActivity: Date.now(),
      deviceInfo: existingUser?.sessionInfo.deviceInfo || getDeviceInfo(),
      ipAddress: existingUser?.sessionInfo.ipAddress,
      location: existingUser?.sessionInfo.location,
    },
  };
}

export const useEnhancedAuthStore = create<EnhancedAuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: false,
    accessToken: null,
    refreshTokenValue: null,
    tokenExpiry: null,
    currentTenant: null,
    availableTenants: [],
    sessionId: null,
    lastActivity: Date.now(),
    error: null,
    retryCount: 0,

    // Authentication actions
    login: async (credentials: LoginRequest) => {
      set({ isLoading: true, error: null, retryCount: 0 });

      try {
        const response = await AuthApiClient.login(credentials) as LoginResponse;
        
        const { access_token, refresh_token, expires_in, user } = response.data;
        
        // Parse JWT to get additional info
        const tokenInfo = extractUserFromJWT(access_token);
        if (!tokenInfo) {
          throw new Error('Invalid token format');
        }

        const tenantId = resolveTenantId(user, tokenInfo);
        const tenant = createTenantContext(tenantId);
        const enhancedUser = createEnhancedUser(user, tenant, tokenInfo);

        // Store tokens
        TokenManager.storeTokens(access_token, refresh_token, expires_in, tenant.id);

        // Update state
        set({
          user: enhancedUser,
          isAuthenticated: true,
          isLoading: false,
          accessToken: access_token,
          refreshTokenValue: refresh_token,
          tokenExpiry: Date.now() + (expires_in * 1000),
          currentTenant: tenant,
          availableTenants: [tenant],
          sessionId: enhancedUser.sessionInfo.sessionId,
          lastActivity: Date.now(),
          error: null,
        });

        // Schedule token refresh
        get().scheduleTokenRefresh();

      } catch (error: any) {
        const authError: AuthError = {
          type: 'authentication',
          code: error.status?.toString() || 'AUTH_ERROR',
          message: error.response?.message || error.message || 'Login failed',
          timestamp: Date.now(),
          retryable: error.status !== 401,
        };

        set({
          isLoading: false,
          error: authError,
          retryCount: get().retryCount + 1,
        });
        
        throw error;
      }
    },

    logout: async () => {
      const { accessToken } = get();
      
      // Clear state immediately
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        accessToken: null,
        refreshTokenValue: null,
        tokenExpiry: null,
        currentTenant: null,
        availableTenants: [],
        sessionId: null,
        lastActivity: Date.now(),
        error: null,
        retryCount: 0,
      });

      // Clear token refresh timer
      get().clearTokenRefreshTimer();

      // Clear storage
      TokenManager.clearTokens();

      // Call logout API if we have a token
      if (accessToken) {
        try {
          await AuthApiClient.logout(accessToken);
        } catch (error) {
          console.warn('Logout API call failed:', error);
        }
      }
    },

    refreshToken: async () => {
      const { refreshTokenValue: currentRefreshToken } = get();
      
      if (!currentRefreshToken) {
        await get().logout();
        return;
      }

      try {
        set({ isLoading: true, error: null });

        const response = await AuthApiClient.refreshToken(currentRefreshToken);
        const { access_token, expires_in } = response.data;

        // Update tokens
        TokenManager.storeTokens(access_token, currentRefreshToken, expires_in);

        // Update state
        set({
          accessToken: access_token,
          tokenExpiry: Date.now() + (expires_in * 1000),
          isLoading: false,
          lastActivity: Date.now(),
        });

        // Schedule next refresh
        get().scheduleTokenRefresh();

      } catch (error: any) {
        console.error('Token refresh failed:', error);
        await get().logout();
      }
    },

    switchTenant: async (tenantId: string) => {
      const { user, currentTenant } = get();
      
      if (!user || !currentTenant) {
        throw new Error('Not authenticated');
      }

      if (tenantId === currentTenant.id) {
        set({ lastActivity: Date.now(), error: null });
        return;
      }

      if (!get().canAccessTenant(tenantId)) {
        throw new Error(`User does not have access to tenant: ${tenantId}`);
      }

      try {
        throw new Error('Tenant switching is not supported by the current backend authentication contract');
      } catch (error: any) {
        const authError: AuthError = {
          type: 'authorization',
          code: 'TENANT_SWITCH_ERROR',
          message: error.message || 'Failed to switch tenant',
          timestamp: Date.now(),
          retryable: true,
        };

        set({
          error: authError,
          isLoading: false,
        });
        
        throw error;
      }
    },

    setCurrentTenant: (tenant: TenantContext) => {
      TokenManager.storeTenantContext(tenant.id);
      set({
        currentTenant: tenant,
        availableTenants: [tenant],
      });
    },

    initializeSession: async () => {
      try {
        set({ isLoading: true });

        const accessToken = await TokenManager.getValidAccessToken();
        
        if (accessToken) {
          // Validate token and get user profile
          const userProfile = await AuthApiClient.getCurrentUser(accessToken);
          const tokenInfo = extractUserFromJWT(accessToken);
          
          if (tokenInfo) {
            const tenantId = resolveTenantId(
              userProfile.data,
              tokenInfo,
              TokenManager.getTenantContext()
            );
            const tenant = createTenantContext(tenantId, get().currentTenant);
            const enhancedUser = createEnhancedUser(
              userProfile.data,
              tenant,
              tokenInfo,
              get().user
            );

            TokenManager.storeTenantContext(tenant.id);

            set({
              user: enhancedUser,
              isAuthenticated: true,
              accessToken,
              refreshTokenValue: TokenManager.getRefreshToken(),
              tokenExpiry: Date.now() + getTimeUntilExpiry(accessToken),
              currentTenant: tenant,
              availableTenants: [tenant],
              sessionId: enhancedUser.sessionInfo.sessionId,
              lastActivity: Date.now(),
              isLoading: false,
            });

            // Schedule token refresh
            get().scheduleTokenRefresh();
          }
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        TokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    refreshUserProfile: async () => {
      const token = await get().getValidToken();
      
      if (!token) {
        await get().logout();
        return;
      }

      try {
        const userProfile = await AuthApiClient.getCurrentUser(token);
        const { user: currentUser, currentTenant } = get();
        const tokenInfo = extractUserFromJWT(token);
        
        if (currentUser) {
          const tenantId = resolveTenantId(
            userProfile.data,
            tokenInfo,
            currentTenant?.id || TokenManager.getTenantContext()
          );
          const tenant = createTenantContext(tenantId, currentTenant);
          const enhancedUser = createEnhancedUser(
            userProfile.data,
            tenant,
            tokenInfo,
            currentUser
          );

          TokenManager.storeTenantContext(tenant.id);

          set({
            user: enhancedUser,
            currentTenant: tenant,
            availableTenants: [tenant],
            lastActivity: Date.now(),
          });
        }
      } catch (error: any) {
        console.error('Profile refresh failed:', error);
        await get().logout();
      }
    },

    updateLastActivity: () => {
      set({ lastActivity: Date.now() });
    },

    getValidToken: async () => {
      const { accessToken, refreshTokenValue } = get();
      
      if (!accessToken) {
        return null;
      }

      // Check if token is expired or will expire soon
      if (isJWTExpired(accessToken) || willExpireSoon(accessToken)) {
        if (!refreshTokenValue) {
          return null;
        }

        await get().refreshToken();
        return get().accessToken;
      }

      return accessToken;
    },

    scheduleTokenRefresh: () => {
      const { accessToken } = get();
      
      if (!accessToken) return;

      // Clear existing timer
      get().clearTokenRefreshTimer();

      // Calculate time until refresh (5 minutes before expiry)
      const timeUntilRefresh = getTimeUntilExpiry(accessToken) - (5 * 60 * 1000);
      
      if (timeUntilRefresh > 0) {
        tokenRefreshTimer = setTimeout(() => {
          get().refreshToken();
        }, timeUntilRefresh);
      }
    },

    clearTokenRefreshTimer: () => {
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
      }
    },

    setError: (error: AuthError | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // Utility methods
    hasPermission: (permission: string) => {
      const { user } = get();
      if (!user) return false;
      
      return user.permissions.includes('*') || user.permissions.includes(permission);
    },

    hasRole: (role: UserRole) => {
      const { user } = get();
      if (!user) return false;
      
      return user.effectiveRoles.includes(role);
    },

    isAdmin: () => {
      const { user } = get();
      if (!user) return false;
      
      const adminRoles = [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL];
      return user.effectiveRoles.some(role => adminRoles.includes(role));
    },

    canAccessTenant: (tenantId: string) => {
      const { user } = get();
      if (!user) return false;
      
      if (user.effectiveRoles.includes(UserRole.SUPER_ADMIN)) return true;
      
      return user.tenants.some(tenant => tenant.tenantId === tenantId && tenant.isActive);
    },
  }))
);

// Helper function to get device information
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      platform: '',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    };
  }

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  return {
    userAgent,
    platform,
    isMobile,
    isTablet,
    isDesktop,
  };
}

// Selector hooks for specific state slices
export const useAuthUser = () => useEnhancedAuthStore((state) => state.user);
export const useIsAuthenticated = () => useEnhancedAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useEnhancedAuthStore((state) => state.isLoading);
export const useAuthError = () => useEnhancedAuthStore((state) => state.error);
export const useCurrentTenant = () => useEnhancedAuthStore((state) => state.currentTenant);
export const useAvailableTenants = () => useEnhancedAuthStore((state) => state.availableTenants);
export const useSessionId = () => useEnhancedAuthStore((state) => state.sessionId);

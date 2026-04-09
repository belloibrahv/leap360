/**
 * Tenant-Aware Routing System
 * 
 * Handles tenant-specific routing, URL patterns, and navigation
 * with tenant context validation and redirection logic.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTenantContext } from './TenantContextProvider';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';
import { UserRole } from '@/types/auth';

interface TenantRoutingState {
  // Current routing state
  currentPath: string;
  tenantPath: string | null;
  isValidRoute: boolean;
  
  // Route validation
  allowedRoutes: string[];
  restrictedRoutes: string[];
  
  // Actions
  navigateToTenantRoute: (path: string) => void;
  redirectToTenantHome: () => void;
  validateRoute: (path: string) => boolean;
  getTenantRoute: (path: string) => string;
  
  // Utilities
  isPublicRoute: (path: string) => boolean;
  requiresTenant: (path: string) => boolean;
  getRoutePermissions: (path: string) => string[];
}

interface RouteConfig {
  path: string;
  requiresTenant: boolean;
  permissions?: string[];
  roles?: UserRole[];
  isPublic?: boolean;
  redirectTo?: string;
}

const TenantRoutingContext = createContext<TenantRoutingState | null>(null);

interface TenantAwareRoutingProps {
  children: React.ReactNode;
  routeConfigs?: RouteConfig[];
  tenantUrlPattern?: 'subdomain' | 'path' | 'query';
  defaultRedirect?: string;
}

// Default route configurations
const DEFAULT_ROUTE_CONFIGS: RouteConfig[] = [
  // Public routes
  { path: '/', requiresTenant: false, isPublic: true },
  { path: '/login', requiresTenant: false, isPublic: true },
  { path: '/register', requiresTenant: false, isPublic: true },
  { path: '/forgot-password', requiresTenant: false, isPublic: true },
  { path: '/unauthorized', requiresTenant: false, isPublic: true },
  
  // Tenant-specific routes
  { path: '/dashboard', requiresTenant: true, permissions: ['dashboard.view'] },
  { path: '/schools', requiresTenant: true, permissions: ['schools.view'] },
  { path: '/users', requiresTenant: true, permissions: ['users.view'] },
  { path: '/students', requiresTenant: true, permissions: ['students.view'] },
  { path: '/teachers', requiresTenant: true, permissions: ['teachers.view'] },
  { path: '/classes', requiresTenant: true, permissions: ['classes.view'] },
  { path: '/reports', requiresTenant: true, permissions: ['reports.view'] },
  { path: '/settings', requiresTenant: true, permissions: ['settings.view'] },
  
  // Admin routes
  { path: '/admin', requiresTenant: true, roles: [UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN] },
  { path: '/admin/tenants', requiresTenant: false, roles: [UserRole.SUPER_ADMIN] },
  { path: '/admin/system', requiresTenant: false, roles: [UserRole.SUPER_ADMIN] },
];

export const TenantAwareRouting: React.FC<TenantAwareRoutingProps> = ({
  children,
  routeConfigs = DEFAULT_ROUTE_CONFIGS,
  tenantUrlPattern = 'path',
  defaultRedirect = '/dashboard',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTenant, hasMultipleTenants } = useTenantContext();
  const { user, isAuthenticated, hasPermission, hasRole } = useEnhancedAuth();
  
  const [currentPath, setCurrentPath] = useState(pathname);
  const [tenantPath, setTenantPath] = useState<string | null>(null);
  const [isValidRoute, setIsValidRoute] = useState(true);
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const [restrictedRoutes, setRestrictedRoutes] = useState<string[]>([]);

  // Update current path when pathname changes
  useEffect(() => {
    setCurrentPath(pathname);
    validateCurrentRoute();
  }, [pathname]);

  // Update allowed routes when user or tenant changes
  useEffect(() => {
    updateAllowedRoutes();
  }, [user, currentTenant, isAuthenticated]);

  // Handle tenant-specific routing
  useEffect(() => {
    if (isAuthenticated && currentTenant) {
      const tenantSpecificPath = generateTenantPath(pathname);
      setTenantPath(tenantSpecificPath);
    } else {
      setTenantPath(null);
    }
  }, [currentTenant, pathname, isAuthenticated]);

  const generateTenantPath = (path: string): string => {
    if (!currentTenant) return path;

    switch (tenantUrlPattern) {
      case 'path':
        // Add tenant ID to path: /tenant/{tenantId}/dashboard
        return `/tenant/${currentTenant.id}${path}`;
      
      case 'subdomain':
        // Tenant handled by subdomain: {tenant}.domain.com/dashboard
        return path;
      
      case 'query':
        // Add tenant as query parameter: /dashboard?tenant={tenantId}
        const separator = path.includes('?') ? '&' : '?';
        return `${path}${separator}tenant=${currentTenant.id}`;
      
      default:
        return path;
    }
  };

  const validateCurrentRoute = () => {
    const routeConfig = findRouteConfig(pathname);
    
    if (!routeConfig) {
      setIsValidRoute(false);
      return;
    }

    // Check if route requires authentication
    if (!routeConfig.isPublic && !isAuthenticated) {
      setIsValidRoute(false);
      router.push('/login');
      return;
    }

    // Check if route requires tenant
    if (routeConfig.requiresTenant && !currentTenant) {
      setIsValidRoute(false);
      if (hasMultipleTenants) {
        // Redirect to tenant selection
        router.push('/select-tenant');
      } else {
        // Redirect to login or home
        router.push('/login');
      }
      return;
    }

    // Check permissions
    if (routeConfig.permissions && isAuthenticated) {
      const hasRequiredPermissions = routeConfig.permissions.every(permission => 
        hasPermission(permission)
      );
      
      if (!hasRequiredPermissions) {
        setIsValidRoute(false);
        router.push('/unauthorized');
        return;
      }
    }

    // Check roles
    if (routeConfig.roles && isAuthenticated && user) {
      const hasRequiredRole = routeConfig.roles.some(role => hasRole(role));
      
      if (!hasRequiredRole) {
        setIsValidRoute(false);
        router.push('/unauthorized');
        return;
      }
    }

    setIsValidRoute(true);
  };

  const findRouteConfig = (path: string): RouteConfig | null => {
    // Find exact match first
    let config = routeConfigs.find(config => config.path === path);
    
    if (!config) {
      // Find pattern match (e.g., /schools/[id] matches /schools/123)
      config = routeConfigs.find(config => {
        const pattern = config.path.replace(/\[.*?\]/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(path);
      });
    }
    
    return config || null;
  };

  const updateAllowedRoutes = () => {
    if (!isAuthenticated) {
      const publicRoutes = routeConfigs
        .filter(config => config.isPublic)
        .map(config => config.path);
      setAllowedRoutes(publicRoutes);
      setRestrictedRoutes([]);
      return;
    }

    const allowed: string[] = [];
    const restricted: string[] = [];

    routeConfigs.forEach(config => {
      let canAccess = true;

      // Check tenant requirement
      if (config.requiresTenant && !currentTenant) {
        canAccess = false;
      }

      // Check permissions
      if (config.permissions && canAccess) {
        canAccess = config.permissions.every(permission => hasPermission(permission));
      }

      // Check roles
      if (config.roles && canAccess && user) {
        canAccess = config.roles.some(role => hasRole(role));
      }

      if (canAccess) {
        allowed.push(config.path);
      } else {
        restricted.push(config.path);
      }
    });

    setAllowedRoutes(allowed);
    setRestrictedRoutes(restricted);
  };

  const navigateToTenantRoute = useCallback((path: string) => {
    const tenantSpecificPath = generateTenantPath(path);
    router.push(tenantSpecificPath);
  }, [currentTenant, tenantUrlPattern, router]);

  const redirectToTenantHome = useCallback(() => {
    if (currentTenant) {
      navigateToTenantRoute(defaultRedirect);
    } else {
      router.push('/');
    }
  }, [currentTenant, defaultRedirect, navigateToTenantRoute, router]);

  const validateRoute = useCallback((path: string): boolean => {
    const config = findRouteConfig(path);
    if (!config) return false;

    // Check authentication
    if (!config.isPublic && !isAuthenticated) return false;

    // Check tenant requirement
    if (config.requiresTenant && !currentTenant) return false;

    // Check permissions
    if (config.permissions && !config.permissions.every(p => hasPermission(p))) return false;

    // Check roles
    if (config.roles && user && !config.roles.some(r => hasRole(r))) return false;

    return true;
  }, [isAuthenticated, currentTenant, user, hasPermission, hasRole]);

  const getTenantRoute = useCallback((path: string): string => {
    return generateTenantPath(path);
  }, [currentTenant, tenantUrlPattern]);

  const isPublicRoute = useCallback((path: string): boolean => {
    const config = findRouteConfig(path);
    return config?.isPublic || false;
  }, [routeConfigs]);

  const requiresTenant = useCallback((path: string): boolean => {
    const config = findRouteConfig(path);
    return config?.requiresTenant || false;
  }, [routeConfigs]);

  const getRoutePermissions = useCallback((path: string): string[] => {
    const config = findRouteConfig(path);
    return config?.permissions || [];
  }, [routeConfigs]);

  const contextValue: TenantRoutingState = {
    // Current routing state
    currentPath,
    tenantPath,
    isValidRoute,
    
    // Route validation
    allowedRoutes,
    restrictedRoutes,
    
    // Actions
    navigateToTenantRoute,
    redirectToTenantHome,
    validateRoute,
    getTenantRoute,
    
    // Utilities
    isPublicRoute,
    requiresTenant,
    getRoutePermissions,
  };

  return (
    <TenantRoutingContext.Provider value={contextValue}>
      {children}
    </TenantRoutingContext.Provider>
  );
};

/**
 * Route Guard Component
 * 
 * Protects routes based on tenant and permission requirements
 */
interface RouteGuardProps {
  children: React.ReactNode;
  requiresTenant?: boolean;
  permissions?: string[];
  roles?: UserRole[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiresTenant = false,
  permissions = [],
  roles = [],
  fallback = null,
  redirectTo,
}) => {
  const router = useRouter();
  const { currentTenant } = useTenantContext();
  const { isAuthenticated, hasPermission, hasRole, user } = useEnhancedAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [isAuthenticated, currentTenant, user]);

  const checkAccess = () => {
    setIsChecking(true);

    // Check authentication
    if (!isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/login');
      }
      setCanAccess(false);
      setIsChecking(false);
      return;
    }

    // Check tenant requirement
    if (requiresTenant && !currentTenant) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/select-tenant');
      }
      setCanAccess(false);
      setIsChecking(false);
      return;
    }

    // Check permissions
    if (permissions.length > 0) {
      const hasRequiredPermissions = permissions.every(permission => hasPermission(permission));
      if (!hasRequiredPermissions) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/unauthorized');
        }
        setCanAccess(false);
        setIsChecking(false);
        return;
      }
    }

    // Check roles
    if (roles.length > 0 && user) {
      const hasRequiredRole = roles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push('/unauthorized');
        }
        setCanAccess(false);
        setIsChecking(false);
        return;
      }
    }

    setCanAccess(true);
    setIsChecking(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!canAccess) {
    return fallback || null;
  }

  return <>{children}</>;
};

/**
 * Hook to use tenant routing
 */
export const useTenantRouting = (): TenantRoutingState => {
  const context = useContext(TenantRoutingContext);
  
  if (!context) {
    throw new Error('useTenantRouting must be used within a TenantAwareRouting provider');
  }
  
  return context;
};

/**
 * Hook for navigation utilities
 */
export const useTenantNavigation = () => {
  const { navigateToTenantRoute, getTenantRoute, validateRoute } = useTenantRouting();
  const router = useRouter();

  const navigateTo = useCallback((path: string, options?: { replace?: boolean }) => {
    const tenantPath = getTenantRoute(path);
    
    if (options?.replace) {
      router.replace(tenantPath);
    } else {
      router.push(tenantPath);
    }
  }, [getTenantRoute, router]);

  const canNavigateTo = useCallback((path: string) => {
    return validateRoute(path);
  }, [validateRoute]);

  return {
    navigateTo,
    canNavigateTo,
    navigateToTenantRoute,
    getTenantRoute,
  };
};
"use client";

import { FC, ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useEnhancedAuth } from "@/core/hooks/useEnhancedAuth";
import { usePermissionStore } from "@/core/permissions/permissionStore";
import ProfessionalLoader from "@/components/ui/ProfessionalLoader";

interface AuthProviderProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/permission-demo'
];

/**
 * Enhanced Authentication Provider Component
 * 
 * Initializes multi-tenant authentication state, manages permission context,
 * and provides loading state while checking for existing authentication.
 */
const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    currentTenant, 
    error 
  } = useEnhancedAuth();
  
  const { 
    setUser, 
    setTenantContext, 
    clearContext 
  } = usePermissionStore();
  
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize permission store when user or tenant changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // Set user in permission store
      setUser(user);
      
      // Set tenant context in permission store if available
      if (currentTenant) {
        setTenantContext(currentTenant);
      }
      
      setIsInitialized(true);
    } else if (!isAuthenticated) {
      // Clear permission context when not authenticated
      clearContext();
      setIsInitialized(!isLoading || isPublicRoute);
    }
  }, [isAuthenticated, user, currentTenant, isLoading, isPublicRoute, setUser, setTenantContext, clearContext]);

  // For public routes, always render children even if not fully initialized
  if (isPublicRoute) {
    return <>{children}</>;
  }
  // Show loading spinner while initializing (only for protected routes)
  if (!isInitialized || isLoading) {
    return (
      <ProfessionalLoader 
        message={isLoading ? 'Authenticating...' : 'Loading...'} 
      />
    );
  }

  // Show error state if authentication failed
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
        <div className="text-center max-w-md mx-auto p-8 bg-gray-900 rounded-2xl border border-red-600/20">
          <div className="text-red-500 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Error
          </h2>
          <p className="text-gray-300 mb-6">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-full hover:from-red-700 hover:to-red-800 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
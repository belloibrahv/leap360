"use client";

import { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, usePermission } from "@/core/hooks/useAuth";
import { UserRole, isAdminRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: UserRole;
  adminOnly?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Protected Route Component
 * 
 * Protects routes based on authentication status, permissions, or roles.
 * Redirects to login or shows fallback if access is denied.
 */
const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  adminOnly = false,
  redirectTo = "/",
  fallback
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { hasPermission } = usePermission(requiredPermission || "");

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    // Check admin requirement
    if (adminOnly && user) {
      if (!isAdminRole(user.role)) {
        router.replace("/unauthorized");
        return;
      }
    }

    // Check specific role requirement
    if (requiredRole && user && user.role !== requiredRole) {
      router.replace("/unauthorized");
      return;
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission) {
      router.replace("/unauthorized");
      return;
    }
  }, [
    isAuthenticated, 
    isLoading, 
    user, 
    hasPermission, 
    requiredPermission, 
    requiredRole, 
    adminOnly, 
    redirectTo, 
    router
  ]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallback || null;
  }

  // Check access requirements
  if (user) {
    // Check admin requirement
    if (adminOnly) {
      if (!isAdminRole(user.role)) {
        return fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        );
      }
    }

    // Check specific role requirement
    if (requiredRole && user.role !== requiredRole) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">This page requires {requiredRole} role.</p>
          </div>
        </div>
      );
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have the required permissions.</p>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute;
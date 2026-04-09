"use client";

import { FC } from "react";
import { useAuth } from "@/core/hooks/useAuth";
import LoginViewV2 from "@/core/auth/page/views/LoginViewV2";
import UserProfile from "@/core/auth/components/UserProfile";

/**
 * Authentication Test Page
 * 
 * Demonstrates the new authentication system integration.
 * Shows login form if not authenticated, user profile if authenticated.
 */
const AuthTestPage: FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-center mb-6">
              Authentication Test
            </h1>
            
            {!isAuthenticated ? (
              <div>
                <p className="text-gray-600 text-center mb-6">
                  Please log in to continue
                </p>
                <LoginViewV2 />
              </div>
            ) : (
              <div>
                <p className="text-green-600 text-center mb-6">
                  ✅ Successfully authenticated!
                </p>
                <UserProfile />
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">User Information:</h3>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
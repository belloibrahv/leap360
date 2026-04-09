/**
 * Session Manager Component
 * 
 * Handles automatic token refresh, session timeout, and activity tracking
 * for the enhanced authentication system.
 */

"use client";

import { useEffect, useRef, useState } from 'react';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';
import { useSession } from '@/core/hooks/useEnhancedAuth';

interface SessionManagerProps {
  children: React.ReactNode;
  sessionTimeoutMinutes?: number;
  warningMinutes?: number;
  refreshThresholdMinutes?: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  sessionTimeoutMinutes = 60, // 1 hour default
  warningMinutes = 5, // Warn 5 minutes before timeout
  refreshThresholdMinutes = 5, // Refresh token 5 minutes before expiry
}) => {
  const { 
    isAuthenticated, 
    refreshToken, 
    logout, 
    getValidToken,
    updateLastActivity 
  } = useEnhancedAuth();
  
  const { 
    sessionExpiry, 
    isSessionExpired, 
    lastActivity 
  } = useSession();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearTimers = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  // Setup session management timers
  useEffect(() => {
    if (!isAuthenticated) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    const setupTimers = async () => {
      try {
        const token = await getValidToken();
        if (!token) return;

        // Calculate session timeout based on last activity
        const sessionTimeoutMs = sessionTimeoutMinutes * 60 * 1000;
        const warningTimeMs = warningMinutes * 60 * 1000;
        
        const timeSinceLastActivity = Date.now() - lastActivity;
        const timeUntilTimeout = sessionTimeoutMs - timeSinceLastActivity;
        const timeUntilWarning = timeUntilTimeout - warningTimeMs;

        // Clear existing timers
        clearTimers();

        // Set warning timer
        if (timeUntilWarning > 0) {
          warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setTimeLeft(Math.floor(warningTimeMs / 1000));
            
            // Start countdown
            const countdownInterval = setInterval(() => {
              setTimeLeft(prev => {
                if (prev <= 1) {
                  clearInterval(countdownInterval);
                  logout();
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }, timeUntilWarning);
        } else if (timeUntilTimeout > 0) {
          // Show warning immediately if we're already in warning period
          setShowWarning(true);
          setTimeLeft(Math.floor(timeUntilTimeout / 1000));
          
          const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                logout();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          // Session already expired
          logout();
        }

        // Set session timeout timer
        if (timeUntilTimeout > 0) {
          sessionTimerRef.current = setTimeout(() => {
            logout();
          }, timeUntilTimeout);
        }

      } catch (error) {
        console.error('Error setting up session timers:', error);
      }
    };

    setupTimers();

    return clearTimers;
  }, [isAuthenticated, lastActivity, sessionTimeoutMinutes, warningMinutes]);

  // Handle session extension
  const extendSession = () => {
    updateLastActivity();
    setShowWarning(false);
    setTimeLeft(0);
  };

  // Handle user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleActivity = () => {
      updateLastActivity();
      
      // Hide warning if user is active
      if (showWarning) {
        setShowWarning(false);
        setTimeLeft(0);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, showWarning, updateLastActivity]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {children}
      
      {/* Session Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Session Expiring Soon
                </h3>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Your session will expire in:
              </p>
              <div className="text-2xl font-mono font-bold text-red-600 text-center">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click "Stay Logged In" to extend your session, or you will be automatically logged out.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Stay Logged In
              </button>
              <button
                onClick={logout}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
/**
 * Real-time Permission Synchronization Hooks
 * 
 * Provides real-time synchronization of permissions, user context,
 * and tenant information across the application.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnhancedAuth } from './useEnhancedAuth';
import { usePermissionStore, type PermissionStore } from '../permissions/permissionStore';
import { EnhancedUser, TenantContext, AuthError } from '@/types';

/**
 * Real-time sync configuration
 */
export interface RealtimeSyncConfig {
  // Sync intervals (in milliseconds)
  permissionSyncInterval?: number;
  userProfileSyncInterval?: number;
  tenantSyncInterval?: number;
  
  // WebSocket configuration
  enableWebSocket?: boolean;
  websocketUrl?: string;
  
  // Retry configuration
  maxRetries?: number;
  retryDelay?: number;
  
  // Event handlers
  onPermissionUpdate?: (permissions: string[]) => void;
  onUserUpdate?: (user: EnhancedUser) => void;
  onTenantUpdate?: (tenant: TenantContext) => void;
  onSyncError?: (error: AuthError) => void;
}

/**
 * Real-time sync state
 */
export interface RealtimeSyncState {
  // Connection state
  isConnected: boolean;
  isOnline: boolean;
  lastSyncTime: number;
  
  // Sync status
  isSyncing: boolean;
  syncError: string | null;
  retryCount: number;
  
  // Sync statistics
  permissionSyncCount: number;
  userSyncCount: number;
  tenantSyncCount: number;
  
  // Actions
  forceSync: () => Promise<void>;
  reconnect: () => Promise<void>;
  clearError: () => void;
}

/**
 * Default sync configuration
 */
const DEFAULT_SYNC_CONFIG: Required<RealtimeSyncConfig> = {
  permissionSyncInterval: 30000, // 30 seconds
  userProfileSyncInterval: 300000, // 5 minutes
  tenantSyncInterval: 600000, // 10 minutes
  enableWebSocket: false, // Disabled by default
  websocketUrl: '',
  maxRetries: 3,
  retryDelay: 1000,
  onPermissionUpdate: () => {},
  onUserUpdate: () => {},
  onTenantUpdate: () => {},
  onSyncError: () => {},
};

/**
 * Hook for real-time permission and context synchronization
 */
export function useRealtimeSync(config: RealtimeSyncConfig = {}): RealtimeSyncState {
  const fullConfig = { ...DEFAULT_SYNC_CONFIG, ...config };
  const { 
    user, 
    currentTenant, 
    isAuthenticated, 
    refreshProfile,
    getValidToken 
  } = useEnhancedAuth();
  const updatePermissions = usePermissionStore((state: PermissionStore) => state.updatePermissions);
  
  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [permissionSyncCount, setPermissionSyncCount] = useState(0);
  const [userSyncCount, setUserSyncCount] = useState(0);
  const [tenantSyncCount, setTenantSyncCount] = useState(0);
  
  // Refs for intervals and WebSocket
  const permissionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tenantIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync permissions
  const syncPermissions = useCallback(async () => {
    if (!isAuthenticated || !user || !isOnline) return;
    
    try {
      const token = await getValidToken();
      if (!token) return;
      
      // Fetch updated permissions from API
      const response = await fetch('/api/v1/auth/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const permissions = data.data?.permissions || [];
        
        // Update permission store
        updatePermissions(permissions);
        
        // Call callback
        fullConfig.onPermissionUpdate(permissions);
        
        setPermissionSyncCount(prev => prev + 1);
        setSyncError(null);
        setRetryCount(0);
      }
    } catch (error) {
      console.warn('Permission sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Permission sync failed');
    }
  }, [isAuthenticated, user, isOnline, getValidToken, updatePermissions, fullConfig]);

  // Sync user profile
  const syncUserProfile = useCallback(async () => {
    if (!isAuthenticated || !isOnline) return;
    
    try {
      await refreshProfile();
      setUserSyncCount(prev => prev + 1);
      setSyncError(null);
      setRetryCount(0);
      
      if (user) {
        fullConfig.onUserUpdate(user);
      }
    } catch (error) {
      console.warn('User profile sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'User profile sync failed');
    }
  }, [isAuthenticated, isOnline, refreshProfile, user, fullConfig]);

  // Sync tenant context
  const syncTenantContext = useCallback(async () => {
    if (!isAuthenticated || !currentTenant || !isOnline) return;
    
    try {
      const token = await getValidToken();
      if (!token) return;
      
      // Fetch updated tenant information
      const response = await fetch(`/api/v1/tenants/${currentTenant.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const tenant = data.data;
        
        setTenantSyncCount(prev => prev + 1);
        setSyncError(null);
        setRetryCount(0);
        
        fullConfig.onTenantUpdate(tenant);
      }
    } catch (error) {
      console.warn('Tenant sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Tenant sync failed');
    }
  }, [isAuthenticated, currentTenant, isOnline, getValidToken, fullConfig]);

  // Force sync all data
  const forceSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;
    
    setIsSyncing(true);
    try {
      await Promise.all([
        syncPermissions(),
        syncUserProfile(),
        syncTenantContext(),
      ]);
      setLastSyncTime(Date.now());
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, syncPermissions, syncUserProfile, syncTenantContext]);

  // Retry with exponential backoff
  const scheduleRetry = useCallback(() => {
    if (retryCount >= fullConfig.maxRetries) return;
    
    const delay = fullConfig.retryDelay * Math.pow(2, retryCount);
    
    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount(prev => prev + 1);
      forceSync();
    }, delay);
  }, [retryCount, fullConfig.maxRetries, fullConfig.retryDelay, forceSync]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!fullConfig.enableWebSocket || !fullConfig.websocketUrl || !isAuthenticated) return;
    
    try {
      const ws = new WebSocket(fullConfig.websocketUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setSyncError(null);
        setRetryCount(0);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'permission_update':
              if (message.data?.permissions) {
                updatePermissions(message.data.permissions);
                fullConfig.onPermissionUpdate(message.data.permissions);
              }
              break;
              
            case 'user_update':
              if (message.data?.user) {
                fullConfig.onUserUpdate(message.data.user);
              }
              break;
              
            case 'tenant_update':
              if (message.data?.tenant) {
                fullConfig.onTenantUpdate(message.data.tenant);
              }
              break;
          }
        } catch (error) {
          console.warn('WebSocket message parsing failed:', error);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        scheduleRetry();
      };
      
      ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
        setIsConnected(false);
        setSyncError('WebSocket connection failed');
      };
      
      websocketRef.current = ws;
    } catch (error) {
      console.warn('WebSocket connection failed:', error);
      setSyncError('Failed to establish WebSocket connection');
    }
  }, [fullConfig, isAuthenticated, updatePermissions, scheduleRetry]);

  // Reconnect WebSocket
  const reconnect = useCallback(async () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    setIsConnected(false);
    setRetryCount(0);
    
    if (fullConfig.enableWebSocket) {
      connectWebSocket();
    }
    
    // Also force sync via HTTP
    await forceSync();
  }, [fullConfig.enableWebSocket, connectWebSocket, forceSync]);

  // Clear error
  const clearError = useCallback(() => {
    setSyncError(null);
    setRetryCount(0);
  }, []);

  // Set up periodic sync intervals
  useEffect(() => {
    if (!isAuthenticated || !isOnline) return;
    
    // Permission sync interval
    permissionIntervalRef.current = setInterval(
      syncPermissions,
      fullConfig.permissionSyncInterval
    );
    
    // User profile sync interval
    userIntervalRef.current = setInterval(
      syncUserProfile,
      fullConfig.userProfileSyncInterval
    );
    
    // Tenant sync interval
    tenantIntervalRef.current = setInterval(
      syncTenantContext,
      fullConfig.tenantSyncInterval
    );
    
    return () => {
      if (permissionIntervalRef.current) {
        clearInterval(permissionIntervalRef.current);
      }
      if (userIntervalRef.current) {
        clearInterval(userIntervalRef.current);
      }
      if (tenantIntervalRef.current) {
        clearInterval(tenantIntervalRef.current);
      }
    };
  }, [
    isAuthenticated,
    isOnline,
    syncPermissions,
    syncUserProfile,
    syncTenantContext,
    fullConfig.permissionSyncInterval,
    fullConfig.userProfileSyncInterval,
    fullConfig.tenantSyncInterval,
  ]);

  // Set up WebSocket connection
  useEffect(() => {
    if (fullConfig.enableWebSocket && isAuthenticated && isOnline) {
      connectWebSocket();
    }
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
        websocketRef.current = null;
      }
    };
  }, [fullConfig.enableWebSocket, isAuthenticated, isOnline, connectWebSocket]);

  // Handle sync errors
  useEffect(() => {
    if (syncError && retryCount < fullConfig.maxRetries) {
      scheduleRetry();
    } else if (syncError) {
      fullConfig.onSyncError({
        type: 'system',
        code: 'SYNC_ERROR',
        message: syncError,
        timestamp: Date.now(),
        retryable: false,
      });
    }
  }, [syncError, retryCount, fullConfig, scheduleRetry]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isOnline,
    lastSyncTime,
    
    // Sync status
    isSyncing,
    syncError,
    retryCount,
    
    // Sync statistics
    permissionSyncCount,
    userSyncCount,
    tenantSyncCount,
    
    // Actions
    forceSync,
    reconnect,
    clearError,
  };
}

/**
 * Hook for permission change notifications
 */
export function usePermissionNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'permission_granted' | 'permission_revoked' | 'role_changed';
    message: string;
    timestamp: number;
  }>>([]);

  const addNotification = useCallback((
    type: 'permission_granted' | 'permission_revoked' | 'role_changed',
    message: string
  ) => {
    const notification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  };
}

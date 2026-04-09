/**
 * Tenant Data Isolation System
 * 
 * Ensures cross-tenant data isolation, prevents data leakage,
 * and manages tenant-scoped API requests and caching.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTenantContext } from './TenantContextProvider';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';

interface TenantDataIsolationState {
  // Current tenant scope
  currentTenantId: string | null;
  
  // Data isolation state
  isIsolated: boolean;
  lastClearTime: number;
  
  // Cache management
  tenantCache: Map<string, any>;
  cacheSize: number;
  maxCacheSize: number;
  
  // Actions
  clearTenantData: () => void;
  clearAllCaches: () => void;
  switchTenantScope: (tenantId: string) => Promise<void>;
  validateTenantAccess: (data: any) => boolean;
  
  // Cache operations
  setCacheItem: (key: string, value: any, ttl?: number) => void;
  getCacheItem: (key: string) => any;
  removeCacheItem: (key: string) => void;
  clearExpiredCache: () => void;
  
  // Utilities
  getTenantScopedKey: (key: string) => string;
  isTenantData: (data: any) => boolean;
  sanitizeData: (data: any) => any;
}

interface CacheItem {
  value: any;
  tenantId: string;
  timestamp: number;
  ttl?: number;
}

const TenantDataIsolationContext = createContext<TenantDataIsolationState | null>(null);

interface TenantDataIsolationProps {
  children: React.ReactNode;
  maxCacheSize?: number;
  defaultTtl?: number;
}

export const TenantDataIsolation: React.FC<TenantDataIsolationProps> = ({
  children,
  maxCacheSize = 1000,
  defaultTtl = 300000, // 5 minutes
}) => {
  const { currentTenant } = useTenantContext();
  const { user, isAuthenticated } = useEnhancedAuth();
  
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  const [isIsolated, setIsIsolated] = useState(false);
  const [lastClearTime, setLastClearTime] = useState(Date.now());
  const [tenantCache, setTenantCache] = useState<Map<string, CacheItem>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  // Update tenant scope when tenant changes
  useEffect(() => {
    if (currentTenant?.id !== currentTenantId) {
      handleTenantSwitch(currentTenant?.id || null);
    }
  }, [currentTenant?.id, currentTenantId]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllData();
    }
  }, [isAuthenticated]);

  // Periodic cache cleanup
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredCache();
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, []);

  const handleTenantSwitch = async (newTenantId: string | null) => {
    if (newTenantId === currentTenantId) return;

    // Clear previous tenant data
    if (currentTenantId) {
      clearTenantSpecificData(currentTenantId);
    }

    // Set new tenant scope
    setCurrentTenantId(newTenantId);
    setIsIsolated(!!newTenantId);
    setLastClearTime(Date.now());

    // Clear browser storage for previous tenant
    clearBrowserStorage();

    console.log(`Switched tenant scope: ${currentTenantId} -> ${newTenantId}`);
  };

  const clearTenantData = useCallback(() => {
    if (currentTenantId) {
      clearTenantSpecificData(currentTenantId);
      setLastClearTime(Date.now());
    }
  }, [currentTenantId]);

  const clearAllCaches = useCallback(() => {
    setTenantCache(new Map());
    setCacheSize(0);
    setLastClearTime(Date.now());
    clearBrowserStorage();
  }, []);

  const clearAllData = () => {
    setCurrentTenantId(null);
    setIsIsolated(false);
    clearAllCaches();
  };

  const clearTenantSpecificData = (tenantId: string) => {
    const newCache = new Map<string, CacheItem>();
    let newSize = 0;

    // Keep only data from other tenants
    tenantCache.forEach((item, key) => {
      if (item.tenantId !== tenantId) {
        newCache.set(key, item);
        newSize++;
      }
    });

    setTenantCache(newCache);
    setCacheSize(newSize);
  };

  const clearBrowserStorage = () => {
    if (typeof window === 'undefined') return;

    try {
      // Clear tenant-specific items from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('tenant_') || key.includes('_tenant_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (err) {
      console.warn('Failed to clear browser storage:', err);
    }
  };

  const switchTenantScope = useCallback(async (tenantId: string) => {
    await handleTenantSwitch(tenantId);
  }, [currentTenantId]);

  const validateTenantAccess = useCallback((data: any): boolean => {
    if (!currentTenantId || !data) return false;

    // Check if data belongs to current tenant
    if (data.tenantId && data.tenantId !== currentTenantId) {
      console.warn('Cross-tenant data access attempt detected:', {
        currentTenant: currentTenantId,
        dataTenant: data.tenantId,
        data: sanitizeDataForLogging(data)
      });
      return false;
    }

    // Check if data contains tenant-specific fields
    if (data.tenant_id && data.tenant_id !== currentTenantId) {
      console.warn('Cross-tenant data access attempt detected (tenant_id):', {
        currentTenant: currentTenantId,
        dataTenant: data.tenant_id
      });
      return false;
    }

    return true;
  }, [currentTenantId]);

  const setCacheItem = useCallback((key: string, value: any, ttl?: number) => {
    if (!currentTenantId) return;

    const scopedKey = getTenantScopedKey(key);
    const item: CacheItem = {
      value,
      tenantId: currentTenantId,
      timestamp: Date.now(),
      ttl: ttl || defaultTtl,
    };

    // Check cache size limit
    if (cacheSize >= maxCacheSize) {
      // Remove oldest items
      const sortedEntries = Array.from(tenantCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const itemsToRemove = Math.ceil(maxCacheSize * 0.1); // Remove 10%
      for (let i = 0; i < itemsToRemove && i < sortedEntries.length; i++) {
        tenantCache.delete(sortedEntries[i][0]);
      }
      setCacheSize(prev => prev - itemsToRemove);
    }

    setTenantCache(prev => {
      const newCache = new Map(prev);
      newCache.set(scopedKey, item);
      return newCache;
    });
    setCacheSize(prev => prev + 1);
  }, [currentTenantId, cacheSize, maxCacheSize, defaultTtl]);

  const getCacheItem = useCallback((key: string): any => {
    if (!currentTenantId) return null;

    const scopedKey = getTenantScopedKey(key);
    const item = tenantCache.get(scopedKey);

    if (!item) return null;

    // Check if item is expired
    if (item.ttl && Date.now() - item.timestamp > item.ttl) {
      removeCacheItem(key);
      return null;
    }

    // Validate tenant access
    if (item.tenantId !== currentTenantId) {
      console.warn('Cross-tenant cache access attempt:', {
        currentTenant: currentTenantId,
        itemTenant: item.tenantId,
        key: scopedKey
      });
      return null;
    }

    return item.value;
  }, [currentTenantId, tenantCache]);

  const removeCacheItem = useCallback((key: string) => {
    if (!currentTenantId) return;

    const scopedKey = getTenantScopedKey(key);
    setTenantCache(prev => {
      const newCache = new Map(prev);
      if (newCache.delete(scopedKey)) {
        setCacheSize(prev => prev - 1);
      }
      return newCache;
    });
  }, [currentTenantId]);

  const clearExpiredCache = useCallback(() => {
    const now = Date.now();
    const expiredKeys: string[] = [];

    tenantCache.forEach((item, key) => {
      if (item.ttl && now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    if (expiredKeys.length > 0) {
      setTenantCache(prev => {
        const newCache = new Map(prev);
        expiredKeys.forEach(key => newCache.delete(key));
        return newCache;
      });
      setCacheSize(prev => prev - expiredKeys.length);
    }
  }, [tenantCache]);

  const getTenantScopedKey = useCallback((key: string): string => {
    return currentTenantId ? `${currentTenantId}:${key}` : key;
  }, [currentTenantId]);

  const isTenantData = useCallback((data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    return !!(data.tenantId || data.tenant_id || data.organizationId);
  }, []);

  const sanitizeData = useCallback((data: any): any => {
    if (!data || typeof data !== 'object') return data;

    // Remove or mask sensitive cross-tenant data
    const sanitized = { ...data };
    
    // Remove data that doesn't belong to current tenant
    if (sanitized.tenantId && sanitized.tenantId !== currentTenantId) {
      return null;
    }
    
    if (sanitized.tenant_id && sanitized.tenant_id !== currentTenantId) {
      return null;
    }

    // Recursively sanitize nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }, [currentTenantId]);

  const contextValue: TenantDataIsolationState = {
    // Current tenant scope
    currentTenantId,
    
    // Data isolation state
    isIsolated,
    lastClearTime,
    
    // Cache management
    tenantCache,
    cacheSize,
    maxCacheSize,
    
    // Actions
    clearTenantData,
    clearAllCaches,
    switchTenantScope,
    validateTenantAccess,
    
    // Cache operations
    setCacheItem,
    getCacheItem,
    removeCacheItem,
    clearExpiredCache,
    
    // Utilities
    getTenantScopedKey,
    isTenantData,
    sanitizeData,
  };

  return (
    <TenantDataIsolationContext.Provider value={contextValue}>
      {children}
    </TenantDataIsolationContext.Provider>
  );
};

// Helper function to sanitize data for logging
function sanitizeDataForLogging(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Hook to use tenant data isolation
 */
export const useTenantDataIsolation = (): TenantDataIsolationState => {
  const context = useContext(TenantDataIsolationContext);
  
  if (!context) {
    throw new Error('useTenantDataIsolation must be used within a TenantDataIsolation provider');
  }
  
  return context;
};

/**
 * Hook for tenant-scoped caching
 */
export const useTenantCache = () => {
  const { 
    setCacheItem, 
    getCacheItem, 
    removeCacheItem, 
    getTenantScopedKey 
  } = useTenantDataIsolation();
  
  const setItem = useCallback((key: string, value: any, ttl?: number) => {
    setCacheItem(key, value, ttl);
  }, [setCacheItem]);
  
  const getItem = useCallback((key: string) => {
    return getCacheItem(key);
  }, [getCacheItem]);
  
  const removeItem = useCallback((key: string) => {
    removeCacheItem(key);
  }, [removeCacheItem]);
  
  return {
    setItem,
    getItem,
    removeItem,
    getScopedKey: getTenantScopedKey,
  };
};

/**
 * Hook for data validation
 */
export const useTenantDataValidation = () => {
  const { validateTenantAccess, sanitizeData, isTenantData } = useTenantDataIsolation();
  
  const validateAndSanitize = useCallback((data: any) => {
    if (!validateTenantAccess(data)) {
      return null;
    }
    
    return sanitizeData(data);
  }, [validateTenantAccess, sanitizeData]);
  
  return {
    validateTenantAccess,
    sanitizeData,
    isTenantData,
    validateAndSanitize,
  };
};
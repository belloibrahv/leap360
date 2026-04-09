/**
 * Tenant Persistence System
 * 
 * Manages tenant context persistence across browser sessions,
 * handles secure storage, and maintains tenant state recovery.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TenantContext } from '@/types/enhanced-auth';
import { useTenantContext } from './TenantContextProvider';

interface TenantPersistenceState {
  // Persistence state
  isPersisted: boolean;
  lastSaved: number;
  storageType: 'localStorage' | 'sessionStorage' | 'none';
  
  // Actions
  saveTenantContext: () => Promise<void>;
  loadTenantContext: () => Promise<TenantContext | null>;
  clearPersistedData: () => void;
  setStorageType: (type: 'localStorage' | 'sessionStorage' | 'none') => void;
  
  // Utilities
  isStorageAvailable: () => boolean;
  getStorageSize: () => number;
  validateStoredData: (data: any) => boolean;
}

interface PersistedTenantData {
  tenantId: string;
  tenantName: string;
  lastAccessed: number;
  version: string;
  checksum: string;
}

const TenantPersistenceContext = createContext<TenantPersistenceState | null>(null);

interface TenantPersistenceProps {
  children: React.ReactNode;
  storageKey?: string;
  defaultStorageType?: 'localStorage' | 'sessionStorage' | 'none';
  autoSave?: boolean;
  saveInterval?: number;
}

export const TenantPersistence: React.FC<TenantPersistenceProps> = ({
  children,
  storageKey = 'tenant_context',
  defaultStorageType = 'localStorage',
  autoSave = true,
  saveInterval = 30000, // 30 seconds
}) => {
  const { currentTenant } = useTenantContext();
  
  const [isPersisted, setIsPersisted] = useState(false);
  const [lastSaved, setLastSaved] = useState(0);
  const [storageType, setStorageTypeState] = useState<'localStorage' | 'sessionStorage' | 'none'>(defaultStorageType);

  // Auto-save tenant context when it changes
  useEffect(() => {
    if (autoSave && currentTenant && storageType !== 'none') {
      const timeoutId = setTimeout(() => {
        saveTenantContextInternal();
      }, 1000); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [currentTenant, autoSave, storageType]);

  // Periodic auto-save
  useEffect(() => {
    if (!autoSave || storageType === 'none') return;

    const interval = setInterval(() => {
      if (currentTenant) {
        saveTenantContextInternal();
      }
    }, saveInterval);

    return () => clearInterval(interval);
  }, [autoSave, saveInterval, storageType, currentTenant]);

  // Load persisted data on mount
  useEffect(() => {
    loadTenantContextInternal();
  }, []);

  const getStorage = (): Storage | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      switch (storageType) {
        case 'localStorage':
          return window.localStorage;
        case 'sessionStorage':
          return window.sessionStorage;
        default:
          return null;
      }
    } catch (err) {
      console.warn('Storage not available:', err);
      return null;
    }
  };

  const saveTenantContextInternal = async () => {
    if (!currentTenant || storageType === 'none') return;

    const storage = getStorage();
    if (!storage) return;

    try {
      const persistedData: PersistedTenantData = {
        tenantId: currentTenant.id,
        tenantName: currentTenant.name,
        lastAccessed: Date.now(),
        version: '1.0.0',
        checksum: generateChecksum(currentTenant),
      };

      const serializedData = JSON.stringify(persistedData);
      storage.setItem(storageKey, serializedData);
      
      setIsPersisted(true);
      setLastSaved(Date.now());
      
      console.log('Tenant context saved to storage:', persistedData.tenantId);
    } catch (err) {
      console.error('Failed to save tenant context:', err);
      setIsPersisted(false);
    }
  };

  const loadTenantContextInternal = async (): Promise<TenantContext | null> => {
    if (storageType === 'none') return null;

    const storage = getStorage();
    if (!storage) return null;

    try {
      const serializedData = storage.getItem(storageKey);
      if (!serializedData) return null;

      const persistedData: PersistedTenantData = JSON.parse(serializedData);
      
      // Validate stored data
      if (!validateStoredDataInternal(persistedData)) {
        console.warn('Invalid persisted tenant data, clearing storage');
        clearPersistedDataInternal();
        return null;
      }

      // Check if data is too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      if (Date.now() - persistedData.lastAccessed > maxAge) {
        console.log('Persisted tenant data expired, clearing storage');
        clearPersistedDataInternal();
        return null;
      }

      console.log('Loaded persisted tenant context:', persistedData.tenantId);
      setIsPersisted(true);
      
      // Return minimal tenant context for restoration
      return {
        id: persistedData.tenantId,
        name: persistedData.tenantName,
        slug: persistedData.tenantId,
        settings: {
          timezone: 'UTC',
          dateFormat: 'MM/dd/yyyy',
          currency: 'USD',
          language: 'en',
          features: [],
          maxUsers: 1000,
          maxSchools: 10,
        },
        subscription: {
          plan: 'standard',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          features: [],
        },
      };
    } catch (err) {
      console.error('Failed to load tenant context:', err);
      clearPersistedDataInternal();
      return null;
    }
  };

  const clearPersistedDataInternal = () => {
    const storage = getStorage();
    if (!storage) return;

    try {
      storage.removeItem(storageKey);
      setIsPersisted(false);
      setLastSaved(0);
      console.log('Cleared persisted tenant data');
    } catch (err) {
      console.error('Failed to clear persisted data:', err);
    }
  };

  const validateStoredDataInternal = (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check required fields
    if (!data.tenantId || !data.tenantName || !data.lastAccessed || !data.version) {
      return false;
    }

    // Validate data types
    if (typeof data.tenantId !== 'string' || 
        typeof data.tenantName !== 'string' ||
        typeof data.lastAccessed !== 'number' ||
        typeof data.version !== 'string') {
      return false;
    }

    // Validate checksum if present
    if (data.checksum && typeof data.checksum === 'string') {
      // For now, just check if checksum exists
      // In production, implement proper checksum validation
      return data.checksum.length > 0;
    }

    return true;
  };

  const isStorageAvailableInternal = (): boolean => {
    return !!getStorage();
  };

  const getStorageSizeInternal = (): number => {
    const storage = getStorage();
    if (!storage) return 0;

    try {
      const data = storage.getItem(storageKey);
      return data ? new Blob([data]).size : 0;
    } catch (err) {
      return 0;
    }
  };

  const setStorageType = useCallback((type: 'localStorage' | 'sessionStorage' | 'none') => {
    // Clear data from previous storage type
    if (storageType !== 'none') {
      clearPersistedDataInternal();
    }

    setStorageTypeState(type);
    
    // Save to new storage type if tenant exists
    if (type !== 'none' && currentTenant) {
      setTimeout(() => saveTenantContextInternal(), 100);
    }
  }, [storageType, currentTenant]);

  const saveTenantContext = useCallback(async () => {
    await saveTenantContextInternal();
  }, []);

  const loadTenantContext = useCallback(async () => {
    return await loadTenantContextInternal();
  }, []);

  const clearPersistedData = useCallback(() => {
    clearPersistedDataInternal();
  }, []);

  const validateStoredData = useCallback((data: any) => {
    return validateStoredDataInternal(data);
  }, []);

  const isStorageAvailable = useCallback(() => {
    return isStorageAvailableInternal();
  }, [storageType]);

  const getStorageSize = useCallback(() => {
    return getStorageSizeInternal();
  }, [storageType]);

  const contextValue: TenantPersistenceState = {
    // Persistence state
    isPersisted,
    lastSaved,
    storageType,
    
    // Actions
    saveTenantContext,
    loadTenantContext,
    clearPersistedData,
    setStorageType,
    
    // Utilities
    isStorageAvailable,
    getStorageSize,
    validateStoredData,
  };

  return (
    <TenantPersistenceContext.Provider value={contextValue}>
      {children}
    </TenantPersistenceContext.Provider>
  );
};

// Helper function to generate checksum
function generateChecksum(tenant: TenantContext): string {
  // Simple checksum generation - in production, use a proper hashing library
  const data = `${tenant.id}:${tenant.name}:${Date.now()}`;
  let hash = 0;
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Hook to use tenant persistence
 */
export const useTenantPersistence = (): TenantPersistenceState => {
  const context = useContext(TenantPersistenceContext);
  
  if (!context) {
    throw new Error('useTenantPersistence must be used within a TenantPersistence provider');
  }
  
  return context;
};

/**
 * Hook for storage management
 */
export const useTenantStorage = () => {
  const {
    storageType,
    setStorageType,
    isStorageAvailable,
    getStorageSize,
    clearPersistedData,
  } = useTenantPersistence();

  const getStorageInfo = useCallback(() => {
    return {
      type: storageType,
      available: isStorageAvailable(),
      size: getStorageSize(),
      sizeFormatted: formatBytes(getStorageSize()),
    };
  }, [storageType, isStorageAvailable, getStorageSize]);

  return {
    storageType,
    setStorageType,
    getStorageInfo,
    clearStorage: clearPersistedData,
    isAvailable: isStorageAvailable(),
  };
};

/**
 * Hook for automatic tenant restoration
 */
export const useTenantRestoration = () => {
  const { loadTenantContext } = useTenantPersistence();
  const { currentTenant, switchTenant } = useTenantContext();
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorationError, setRestorationError] = useState<string | null>(null);

  const restoreTenantContext = useCallback(async () => {
    if (currentTenant || isRestoring) return;

    setIsRestoring(true);
    setRestorationError(null);

    try {
      const persistedTenant = await loadTenantContext();
      
      if (persistedTenant) {
        await switchTenant(persistedTenant.id);
        console.log('Tenant context restored:', persistedTenant.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore tenant context';
      setRestorationError(errorMessage);
      console.error('Tenant restoration failed:', err);
    } finally {
      setIsRestoring(false);
    }
  }, [currentTenant, isRestoring, loadTenantContext, switchTenant]);

  return {
    restoreTenantContext,
    isRestoring,
    restorationError,
    clearError: () => setRestorationError(null),
  };
};

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
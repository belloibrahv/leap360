/**
 * Tenant Configuration Manager
 * 
 * Handles tenant-specific settings, features, and configuration
 * with real-time updates and validation.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TenantSettings } from '@/types/enhanced-auth';
import { useTenantContext } from './TenantContextProvider';

interface TenantConfigurationState {
  // Configuration state
  settings: TenantSettings | null;
  features: string[];
  limits: TenantLimits;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (settings: Partial<TenantSettings>) => Promise<void>;
  toggleFeature: (feature: string) => Promise<void>;
  refreshConfiguration: () => Promise<void>;
  validateConfiguration: () => boolean;
  clearError: () => void;
  
  // Utilities
  hasFeature: (feature: string) => boolean;
  isWithinLimits: (resource: string, current: number) => boolean;
  getFeatureConfig: (feature: string) => FeatureConfig | null;
}

interface TenantLimits {
  maxUsers: number;
  maxSchools: number;
  maxClasses: number;
  maxStudents: number;
  storageLimit: number; // in MB
  apiCallsPerMonth: number;
}

interface FeatureConfig {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
  dependencies?: string[];
  limits?: Record<string, number>;
}

const TenantConfigurationContext = createContext<TenantConfigurationState | null>(null);

interface TenantConfigurationManagerProps {
  children: React.ReactNode;
}

export const TenantConfigurationManager: React.FC<TenantConfigurationManagerProps> = ({ children }) => {
  const { currentTenant, settings: tenantSettings } = useTenantContext();
  
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [features, setFeatures] = useState<string[]>([]);
  const [limits, setLimits] = useState<TenantLimits>({
    maxUsers: 1000,
    maxSchools: 10,
    maxClasses: 100,
    maxStudents: 5000,
    storageLimit: 1024, // 1GB
    apiCallsPerMonth: 100000,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize configuration when tenant changes
  useEffect(() => {
    if (currentTenant && tenantSettings) {
      initializeConfiguration(tenantSettings);
    } else {
      resetConfiguration();
    }
  }, [currentTenant, tenantSettings]);

  const initializeConfiguration = async (tenantSettings: TenantSettings) => {
    setIsLoading(true);
    setError(null);

    try {
      // Set basic settings
      setSettings(tenantSettings);
      setFeatures(tenantSettings.features || []);

      // Set limits based on subscription or tenant settings
      const tenantLimits: TenantLimits = {
        maxUsers: tenantSettings.maxUsers || 1000,
        maxSchools: tenantSettings.maxSchools || 10,
        maxClasses: calculateClassLimit(tenantSettings.maxSchools),
        maxStudents: calculateStudentLimit(tenantSettings.maxUsers),
        storageLimit: calculateStorageLimit(tenantSettings.maxUsers),
        apiCallsPerMonth: calculateApiLimit(tenantSettings.maxUsers),
      };
      
      setLimits(tenantLimits);

      // Fetch additional configuration from API if needed
      await fetchTenantConfiguration(currentTenant!.id);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize configuration';
      setError(errorMessage);
      console.error('Configuration initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConfiguration = () => {
    setSettings(null);
    setFeatures([]);
    setLimits({
      maxUsers: 1000,
      maxSchools: 10,
      maxClasses: 100,
      maxStudents: 5000,
      storageLimit: 1024,
      apiCallsPerMonth: 100000,
    });
    setError(null);
  };

  const fetchTenantConfiguration = async (tenantId: string) => {
    try {
      // Example API call to fetch additional configuration
      // const response = await fetch(`/api/v1/tenants/${tenantId}/configuration`);
      // const config = await response.json();
      // 
      // if (config.features) {
      //   setFeatures(config.features);
      // }
      // 
      // if (config.limits) {
      //   setLimits(prev => ({ ...prev, ...config.limits }));
      // }
    } catch (err) {
      console.warn('Failed to fetch additional tenant configuration:', err);
      // Continue with basic configuration
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<TenantSettings>) => {
    if (!currentTenant || !settings) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedSettings = { ...settings, ...newSettings };

      // Validate settings
      if (!validateSettings(updatedSettings)) {
        throw new Error('Invalid settings configuration');
      }

      // Update local state
      setSettings(updatedSettings);

      // Update features if they changed
      if (newSettings.features) {
        setFeatures(newSettings.features);
      }

      // API call to save settings
      await saveTenantSettings(currentTenant.id, updatedSettings);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant, settings]);

  const toggleFeature = useCallback(async (feature: string) => {
    if (!currentTenant || !settings) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentFeatures = features || [];
      const newFeatures = currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature];

      // Validate feature dependencies
      if (!validateFeatureDependencies(newFeatures)) {
        throw new Error('Feature dependencies not met');
      }

      setFeatures(newFeatures);

      // Update settings with new features
      const updatedSettings = { ...settings, features: newFeatures };
      setSettings(updatedSettings);

      // API call to save feature toggle
      await saveTenantSettings(currentTenant.id, updatedSettings);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle feature';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant, settings, features]);

  const refreshConfiguration = useCallback(async () => {
    if (!currentTenant) return;

    await initializeConfiguration(tenantSettings!);
  }, [currentTenant, tenantSettings]);

  const validateConfiguration = useCallback(() => {
    if (!settings) return false;

    try {
      // Validate basic settings
      if (!validateSettings(settings)) return false;

      // Validate feature configuration
      if (!validateFeatureDependencies(features)) return false;

      // Validate limits
      if (!validateLimits(limits)) return false;

      return true;
    } catch (err) {
      console.error('Configuration validation error:', err);
      return false;
    }
  }, [settings, features, limits]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const hasFeature = useCallback((feature: string) => {
    return features.includes(feature);
  }, [features]);

  const isWithinLimits = useCallback((resource: string, current: number) => {
    const limit = limits[resource as keyof TenantLimits];
    return typeof limit === 'number' ? current <= limit : true;
  }, [limits]);

  const getFeatureConfig = useCallback((feature: string): FeatureConfig | null => {
    if (!hasFeature(feature)) return null;

    // Return feature configuration
    // This would typically come from a feature registry
    return {
      name: feature,
      enabled: true,
      config: {},
      dependencies: [],
      limits: {},
    };
  }, [hasFeature]);

  const contextValue: TenantConfigurationState = {
    // Configuration state
    settings,
    features,
    limits,
    
    // Loading and error states
    isLoading,
    error,
    
    // Actions
    updateSettings,
    toggleFeature,
    refreshConfiguration,
    validateConfiguration,
    clearError,
    
    // Utilities
    hasFeature,
    isWithinLimits,
    getFeatureConfig,
  };

  return (
    <TenantConfigurationContext.Provider value={contextValue}>
      {children}
    </TenantConfigurationContext.Provider>
  );
};

// Helper functions
function calculateClassLimit(maxSchools: number): number {
  return maxSchools * 10; // 10 classes per school on average
}

function calculateStudentLimit(maxUsers: number): number {
  return Math.floor(maxUsers * 0.8); // 80% of users can be students
}

function calculateStorageLimit(maxUsers: number): number {
  return Math.max(1024, maxUsers * 10); // 10MB per user, minimum 1GB
}

function calculateApiLimit(maxUsers: number): number {
  return Math.max(100000, maxUsers * 1000); // 1000 API calls per user per month
}

function validateSettings(settings: TenantSettings): boolean {
  // Validate required settings
  if (!settings.timezone || !settings.dateFormat || !settings.currency || !settings.language) {
    return false;
  }

  // Validate numeric limits
  if (settings.maxUsers <= 0 || settings.maxSchools <= 0) {
    return false;
  }

  return true;
}

function validateFeatureDependencies(features: string[]): boolean {
  // Define feature dependencies
  const dependencies: Record<string, string[]> = {
    'advanced_reporting': ['basic_reporting'],
    'api_access': ['user_management'],
    'sso_integration': ['user_management'],
    'custom_branding': [],
    'multi_school': [],
  };

  // Check if all dependencies are met
  for (const feature of features) {
    const deps = dependencies[feature] || [];
    for (const dep of deps) {
      if (!features.includes(dep)) {
        return false;
      }
    }
  }

  return true;
}

function validateLimits(limits: TenantLimits): boolean {
  // Validate that all limits are positive numbers
  return Object.values(limits).every(limit => typeof limit === 'number' && limit > 0);
}

async function saveTenantSettings(tenantId: string, settings: TenantSettings): Promise<void> {
  // API call to save tenant settings
  try {
    // const response = await fetch(`/api/v1/tenants/${tenantId}/settings`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(settings),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to save tenant settings');
    // }
    
    // For now, just simulate the API call
    console.log('Saving tenant settings:', settings);
  } catch (err) {
    console.error('Failed to save tenant settings:', err);
    throw err;
  }
}

/**
 * Hook to use tenant configuration
 */
export const useTenantConfiguration = (): TenantConfigurationState => {
  const context = useContext(TenantConfigurationContext);
  
  if (!context) {
    throw new Error('useTenantConfiguration must be used within a TenantConfigurationManager');
  }
  
  return context;
};

/**
 * Hook for feature flags
 */
export const useFeatureFlags = () => {
  const { features, hasFeature, getFeatureConfig } = useTenantConfiguration();
  
  return {
    features,
    hasFeature,
    getFeatureConfig,
    isEnabled: hasFeature,
  };
};

/**
 * Hook for tenant limits
 */
export const useTenantLimits = () => {
  const { limits, isWithinLimits } = useTenantConfiguration();
  
  const checkLimit = useCallback((resource: string, current: number) => {
    const limit = limits[resource as keyof TenantLimits];
    const within = isWithinLimits(resource, current);
    const percentage = typeof limit === 'number' ? (current / limit) * 100 : 0;
    
    return {
      current,
      limit,
      within,
      percentage,
      remaining: typeof limit === 'number' ? Math.max(0, limit - current) : Infinity,
    };
  }, [limits, isWithinLimits]);
  
  return {
    limits,
    checkLimit,
    isWithinLimits,
  };
};
/**
 * Tenant Context Provider
 * 
 * Dedicated context provider for tenant-specific state management,
 * branding, configuration, and data isolation.
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TenantContext, BrandingConfig, TenantSettings } from '@/types/enhanced-auth';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';

interface TenantContextState {
  // Current tenant context
  currentTenant: TenantContext | null;
  availableTenants: TenantContext[];
  
  // Tenant-specific state
  branding: BrandingConfig | null;
  settings: TenantSettings | null;
  
  // Loading and error states
  isLoading: boolean;
  isSwitching: boolean;
  error: string | null;
  
  // Actions
  switchTenant: (tenantId: string) => Promise<void>;
  refreshTenantData: () => Promise<void>;
  updateBranding: (branding: BrandingConfig) => void;
  updateSettings: (settings: TenantSettings) => void;
  clearError: () => void;
  
  // Utilities
  hasMultipleTenants: boolean;
  canSwitchTenants: boolean;
  getTenantById: (tenantId: string) => TenantContext | null;
}

const TenantContextContext = createContext<TenantContextState | null>(null);

interface TenantContextProviderProps {
  children: React.ReactNode;
}

export const TenantContextProvider: React.FC<TenantContextProviderProps> = ({ children }) => {
  const { 
    currentTenant, 
    availableTenants, 
    switchTenant: authSwitchTenant,
    user,
    isAuthenticated 
  } = useEnhancedAuth();
  
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tenant-specific data when tenant changes
  useEffect(() => {
    if (currentTenant && isAuthenticated) {
      initializeTenantData(currentTenant);
    } else {
      // Clear tenant data when no tenant or not authenticated
      setBranding(null);
      setSettings(null);
    }
  }, [currentTenant, isAuthenticated]);

  // Apply tenant branding to document
  useEffect(() => {
    if (branding) {
      applyTenantBranding(branding);
    } else {
      clearTenantBranding();
    }
    
    return () => {
      clearTenantBranding();
    };
  }, [branding]);

  const initializeTenantData = async (tenant: TenantContext) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Set branding from tenant context
      if (tenant.branding) {
        setBranding(tenant.branding);
      }
      
      // Set settings from tenant context
      setSettings(tenant.settings);
      
      // Fetch additional tenant-specific data if needed
      await fetchTenantConfiguration(tenant.id);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize tenant data';
      setError(errorMessage);
      console.error('Tenant initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenantConfiguration = async (tenantId: string) => {
    // This would typically fetch additional tenant configuration from API
    // For now, we'll use the data from the tenant context
    try {
      // Example API call (commented out as endpoint may not exist yet)
      // const response = await fetch(`/api/v1/tenants/${tenantId}/config`);
      // const config = await response.json();
      // setBranding(config.branding);
      // setSettings(config.settings);
    } catch (err) {
      console.warn('Failed to fetch tenant configuration:', err);
      // Continue with existing data from context
    }
  };

  const applyTenantBranding = (brandingConfig: BrandingConfig) => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply CSS custom properties for theming
    if (brandingConfig.primaryColor) {
      root.style.setProperty('--tenant-primary-color', brandingConfig.primaryColor);
    }
    
    if (brandingConfig.secondaryColor) {
      root.style.setProperty('--tenant-secondary-color', brandingConfig.secondaryColor);
    }
    
    // Update favicon if provided
    if (brandingConfig.favicon) {
      updateFavicon(brandingConfig.favicon);
    }
    
    // Apply custom CSS if provided
    if (brandingConfig.customCss) {
      applyCustomCSS(brandingConfig.customCss);
    }
  };

  const clearTenantBranding = () => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    root.style.removeProperty('--tenant-primary-color');
    root.style.removeProperty('--tenant-secondary-color');
    
    // Remove custom CSS
    const customStyleElement = document.getElementById('tenant-custom-css');
    if (customStyleElement) {
      customStyleElement.remove();
    }
  };

  const updateFavicon = (faviconUrl: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  const applyCustomCSS = (customCss: string) => {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new custom CSS
    const style = document.createElement('style');
    style.id = 'tenant-custom-css';
    style.textContent = customCss;
    document.head.appendChild(style);
  };

  const handleSwitchTenant = useCallback(async (tenantId: string) => {
    if (tenantId === currentTenant?.id || isSwitching) return;
    
    setIsSwitching(true);
    setError(null);
    
    try {
      // Clear current tenant data to prevent leakage
      setBranding(null);
      setSettings(null);
      
      // Switch tenant through auth store
      await authSwitchTenant(tenantId);
      
      // The useEffect will handle initializing new tenant data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch tenant';
      setError(errorMessage);
      console.error('Tenant switch error:', err);
    } finally {
      setIsSwitching(false);
    }
  }, [currentTenant?.id, isSwitching, authSwitchTenant]);

  const refreshTenantData = useCallback(async () => {
    if (!currentTenant) return;
    
    await initializeTenantData(currentTenant);
  }, [currentTenant]);

  const updateBranding = useCallback((newBranding: BrandingConfig) => {
    setBranding(newBranding);
  }, []);

  const updateSettings = useCallback((newSettings: TenantSettings) => {
    setSettings(newSettings);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getTenantById = useCallback((tenantId: string) => {
    return availableTenants.find(tenant => tenant.id === tenantId) || null;
  }, [availableTenants]);

  const contextValue: TenantContextState = {
    // Current tenant context
    currentTenant,
    availableTenants,
    
    // Tenant-specific state
    branding,
    settings,
    
    // Loading and error states
    isLoading,
    isSwitching,
    error,
    
    // Actions
    switchTenant: handleSwitchTenant,
    refreshTenantData,
    updateBranding,
    updateSettings,
    clearError,
    
    // Utilities
    hasMultipleTenants: availableTenants.length > 1,
    canSwitchTenants: availableTenants.length > 1 && !isSwitching,
    getTenantById,
  };

  return (
    <TenantContextContext.Provider value={contextValue}>
      {children}
    </TenantContextContext.Provider>
  );
};

/**
 * Hook to use tenant context
 */
export const useTenantContext = (): TenantContextState => {
  const context = useContext(TenantContextContext);
  
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantContextProvider');
  }
  
  return context;
};

/**
 * Hook for tenant branding
 */
export const useTenantBranding = () => {
  const { branding, currentTenant } = useTenantContext();
  
  return {
    branding,
    primaryColor: branding?.primaryColor || '#3B82F6',
    secondaryColor: branding?.secondaryColor || '#6B7280',
    logo: branding?.logo,
    favicon: branding?.favicon,
    customCss: branding?.customCss,
    tenantName: currentTenant?.name || 'Platform',
  };
};

/**
 * Hook for tenant settings
 */
export const useTenantSettings = () => {
  const { settings, currentTenant } = useTenantContext();
  
  return {
    settings,
    timezone: settings?.timezone || 'UTC',
    dateFormat: settings?.dateFormat || 'MM/dd/yyyy',
    currency: settings?.currency || 'USD',
    language: settings?.language || 'en',
    features: settings?.features || [],
    maxUsers: settings?.maxUsers || 1000,
    maxSchools: settings?.maxSchools || 10,
  };
};

/**
 * Hook for tenant-aware routing
 */
export const useTenantRouting = () => {
  const { currentTenant } = useTenantContext();
  
  const getTenantRoute = useCallback((path: string) => {
    if (!currentTenant) return path;
    
    // Add tenant context to routes if needed
    // This could be used for tenant-specific routing patterns
    return path;
  }, [currentTenant]);
  
  const isValidTenantRoute = useCallback((path: string) => {
    // Validate if the route is accessible for current tenant
    return true; // Implement tenant-specific route validation
  }, [currentTenant]);
  
  return {
    currentTenant,
    getTenantRoute,
    isValidTenantRoute,
  };
};
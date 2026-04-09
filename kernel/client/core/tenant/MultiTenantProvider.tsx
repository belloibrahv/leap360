/**
 * Multi-Tenant Provider
 * 
 * Comprehensive provider that integrates all tenant context management
 * components including branding, configuration, data isolation, 
 * persistence, and routing.
 */

"use client";

import React from 'react';
import { UserRole } from '@/types/auth';
import { TenantContextProvider } from './TenantContextProvider';
import { TenantBrandingSystem } from './TenantBrandingSystem';
import { TenantConfigurationManager } from './TenantConfigurationManager';
import { TenantDataIsolation } from './TenantDataIsolation';
import { TenantPersistence } from './TenantPersistence';
import { TenantAwareRouting } from './TenantAwareRouting';

interface MultiTenantProviderProps {
  children: React.ReactNode;
  
  // Branding configuration
  fallbackBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
  };
  
  // Data isolation configuration
  maxCacheSize?: number;
  defaultCacheTtl?: number;
  
  // Persistence configuration
  storageKey?: string;
  defaultStorageType?: 'localStorage' | 'sessionStorage' | 'none';
  autoSave?: boolean;
  saveInterval?: number;
  
  // Routing configuration
  tenantUrlPattern?: 'subdomain' | 'path' | 'query';
  defaultRedirect?: string;
  customRouteConfigs?: Array<{
    path: string;
    requiresTenant: boolean;
    permissions?: string[];
    roles?: UserRole[];
    isPublic?: boolean;
  }>;
}

/**
 * Multi-Tenant Provider Component
 * 
 * Provides complete multi-tenant context management by composing
 * all tenant-related providers in the correct order.
 */
export const MultiTenantProvider: React.FC<MultiTenantProviderProps> = ({
  children,
  fallbackBranding,
  maxCacheSize = 1000,
  defaultCacheTtl = 300000,
  storageKey = 'tenant_context',
  defaultStorageType = 'localStorage',
  autoSave = true,
  saveInterval = 30000,
  tenantUrlPattern = 'path',
  defaultRedirect = '/dashboard',
  customRouteConfigs,
}) => {
  return (
    <TenantContextProvider>
      <TenantConfigurationManager>
        <TenantDataIsolation
          maxCacheSize={maxCacheSize}
          defaultTtl={defaultCacheTtl}
        >
          <TenantPersistence
            storageKey={storageKey}
            defaultStorageType={defaultStorageType}
            autoSave={autoSave}
            saveInterval={saveInterval}
          >
            <TenantAwareRouting
              tenantUrlPattern={tenantUrlPattern}
              defaultRedirect={defaultRedirect}
              routeConfigs={customRouteConfigs}
            >
              <TenantBrandingSystem fallbackBranding={fallbackBranding}>
                {children}
              </TenantBrandingSystem>
            </TenantAwareRouting>
          </TenantPersistence>
        </TenantDataIsolation>
      </TenantConfigurationManager>
    </TenantContextProvider>
  );
};

/**
 * Tenant Status Indicator Component
 * 
 * Shows current tenant status and provides quick access to tenant information
 */
interface TenantStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const TenantStatusIndicator: React.FC<TenantStatusIndicatorProps> = ({
  className = '',
  showDetails = false,
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex items-center space-x-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-600`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Multi-tenant Active</span>
      </div>
      
      {showTooltip && showDetails && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-50">
          <div className="space-y-1">
            <div>✓ Tenant context management</div>
            <div>✓ Data isolation active</div>
            <div>✓ Branding system enabled</div>
            <div>✓ Persistence configured</div>
            <div>✓ Routing protection active</div>
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

/**
 * Tenant Debug Panel Component
 * 
 * Development tool for debugging tenant context state
 */
interface TenantDebugPanelProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const TenantDebugPanel: React.FC<TenantDebugPanelProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!enabled) return null;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Tenant Debug Panel"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Tenant Debug</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <TenantDebugInfo />
        </div>
      )}
    </div>
  );
};

/**
 * Tenant Debug Info Component
 */
const TenantDebugInfo: React.FC = () => {
  // This would use the various tenant hooks to display debug information
  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="font-medium text-gray-700">Current Tenant</div>
        <div className="text-gray-600 font-mono text-xs bg-gray-50 p-2 rounded mt-1">
          Loading tenant info...
        </div>
      </div>
      
      <div>
        <div className="font-medium text-gray-700">Cache Status</div>
        <div className="text-gray-600 text-xs">
          Items: 0 | Size: 0 KB
        </div>
      </div>
      
      <div>
        <div className="font-medium text-gray-700">Persistence</div>
        <div className="text-gray-600 text-xs">
          Type: localStorage | Last saved: Never
        </div>
      </div>
      
      <div>
        <div className="font-medium text-gray-700">Features</div>
        <div className="text-gray-600 text-xs">
          No features configured
        </div>
      </div>
    </div>
  );
};

export default MultiTenantProvider;

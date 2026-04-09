/**
 * Enhanced Tenant Switcher Component
 * 
 * Provides UI for switching between available tenant contexts
 * with enhanced features like branding, persistence, and data isolation.
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { useTenantContext } from '@/core/hooks/useEnhancedAuth';
import { TenantContext } from '@/types/enhanced-auth';

interface TenantSwitcherProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
  showBranding?: boolean;
  showSubscriptionInfo?: boolean;
  onSwitchStart?: () => void;
  onSwitchComplete?: (tenant: TenantContext) => void;
  onSwitchError?: (error: string) => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  className = '',
  showLabel = true,
  compact = false,
  showBranding = true,
  showSubscriptionInfo = false,
  onSwitchStart,
  onSwitchComplete,
  onSwitchError,
}) => {
  const {
    currentTenant,
    availableTenants,
    switchTenant,
    isSwitching,
    hasMultipleTenants,
    error: tenantError,
  } = useTenantContext();

  const [isOpen, setIsOpen] = useState(false);
  const [switchingToTenant, setSwitchingToTenant] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Don't render if user doesn't have multiple tenants
  if (!hasMultipleTenants || !currentTenant) {
    return compact ? (
      <div className={`text-sm text-gray-600 ${className}`}>
        {currentTenant?.name || 'No Tenant'}
      </div>
    ) : null;
  }

  const handleTenantSwitch = async (tenantId: string) => {
    if (tenantId === currentTenant.id || isSwitching) return;
    
    setIsOpen(false);
    setSwitchingToTenant(tenantId);
    
    try {
      onSwitchStart?.();
      
      // Switch tenant
      await switchTenant(tenantId);
      
      // Find the switched tenant for callback
      const switchedTenant = availableTenants.find(t => t.id === tenantId);
      if (switchedTenant) {
        onSwitchComplete?.(switchedTenant);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch tenant';
      console.error('Failed to switch tenant:', error);
      onSwitchError?.(errorMessage);
    } finally {
      setSwitchingToTenant(null);
    }
  };

  const getTenantDisplayInfo = (tenant: TenantContext) => {
    return {
      name: tenant.name,
      logo: showBranding ? tenant.branding?.logo : undefined,
      subscriptionPlan: showSubscriptionInfo ? tenant.subscription.plan : undefined,
      subscriptionStatus: showSubscriptionInfo ? tenant.subscription.status : undefined,
      isActive: tenant.id === currentTenant.id,
      isSwitching: switchingToTenant === tenant.id,
    };
  };

  const renderTenantLogo = (tenant: TenantContext, size: 'sm' | 'md' = 'sm') => {
    if (!showBranding) return null;
    
    const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-8 w-8'
    };
    
    if (tenant.branding?.logo) {
      return (
        <img
          src={tenant.branding.logo}
          alt={`${tenant.name} logo`}
          className={`${sizeClasses[size]} rounded flex-shrink-0`}
        />
      );
    }
    
    return (
      <div className={`${sizeClasses[size]} bg-blue-100 rounded flex items-center justify-center flex-shrink-0`}>
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-blue-600`}>
          {tenant.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isSwitching}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
          aria-label="Switch tenant"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          {renderTenantLogo(currentTenant, 'sm')}
          <span className="truncate max-w-32">{currentTenant.name}</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
            <div className="py-1" role="listbox">
              {availableTenants.map((tenant) => {
                const displayInfo = getTenantDisplayInfo(tenant);
                
                return (
                  <button
                    key={tenant.id}
                    onClick={() => handleTenantSwitch(tenant.id)}
                    disabled={displayInfo.isSwitching}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                      displayInfo.isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700'
                    }`}
                    role="option"
                    aria-selected={displayInfo.isActive}
                  >
                    <div className="flex items-center space-x-3">
                      {renderTenantLogo(tenant, 'sm')}
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {displayInfo.name}
                        </div>
                        {showSubscriptionInfo && (
                          <div className="text-xs text-gray-500 truncate">
                            {displayInfo.subscriptionPlan} • {displayInfo.subscriptionStatus}
                          </div>
                        )}
                      </div>
                      {displayInfo.isSwitching && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      )}
                      {displayInfo.isActive && !displayInfo.isSwitching && (
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Switch tenant"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {renderTenantLogo(currentTenant, 'md')}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {currentTenant.name}
            </div>
            {showSubscriptionInfo && currentTenant.subscription && (
              <div className="text-sm text-gray-500 truncate">
                {currentTenant.subscription.plan} plan • {currentTenant.subscription.status}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {isSwitching && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="py-2" role="listbox">
            {availableTenants.map((tenant) => {
              const displayInfo = getTenantDisplayInfo(tenant);
              
              return (
                <button
                  key={tenant.id}
                  onClick={() => handleTenantSwitch(tenant.id)}
                  disabled={displayInfo.isSwitching}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors disabled:opacity-50 ${
                    displayInfo.isActive
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : ''
                  }`}
                  role="option"
                  aria-selected={displayInfo.isActive}
                >
                  <div className="flex items-center space-x-3">
                    {renderTenantLogo(tenant, 'md')}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${
                        displayInfo.isActive ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {displayInfo.name}
                      </div>
                      {showSubscriptionInfo && (
                        <div className="text-sm text-gray-500 truncate">
                          {displayInfo.subscriptionPlan} • {displayInfo.subscriptionStatus}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {displayInfo.isSwitching && (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      )}
                      {displayInfo.isActive && !displayInfo.isSwitching && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Error display */}
          {tenantError && (
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-center space-x-2 text-red-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{tenantError?.message || String(tenantError)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
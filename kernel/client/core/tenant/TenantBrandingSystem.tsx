/**
 * Tenant Branding System
 * 
 * Manages tenant-specific branding, themes, logos, and styling
 * with real-time updates and CSS custom properties.
 */

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { BrandingConfig } from '@/types/enhanced-auth';
import { useTenantContext, useTenantBranding } from './TenantContextProvider';

interface TenantBrandingSystemProps {
  children: React.ReactNode;
  fallbackBranding?: Partial<BrandingConfig>;
}

/**
 * Tenant Branding System Component
 * 
 * Wraps the application to apply tenant-specific branding
 */
export const TenantBrandingSystem: React.FC<TenantBrandingSystemProps> = ({
  children,
  fallbackBranding = {}
}) => {
  const { branding, currentTenant } = useTenantContext();
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    if (branding || fallbackBranding) {
      applyBrandingToDocument(branding || fallbackBranding);
      setIsApplied(true);
    } else {
      clearBrandingFromDocument();
      setIsApplied(false);
    }

    return () => {
      clearBrandingFromDocument();
    };
  }, [branding, fallbackBranding]);

  const applyBrandingToDocument = (brandingConfig: Partial<BrandingConfig>) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    // Apply CSS custom properties
    if (brandingConfig.primaryColor) {
      root.style.setProperty('--brand-primary', brandingConfig.primaryColor);
      root.style.setProperty('--brand-primary-50', lightenColor(brandingConfig.primaryColor, 0.95));
      root.style.setProperty('--brand-primary-100', lightenColor(brandingConfig.primaryColor, 0.9));
      root.style.setProperty('--brand-primary-500', brandingConfig.primaryColor);
      root.style.setProperty('--brand-primary-600', darkenColor(brandingConfig.primaryColor, 0.1));
      root.style.setProperty('--brand-primary-700', darkenColor(brandingConfig.primaryColor, 0.2));
    }

    if (brandingConfig.secondaryColor) {
      root.style.setProperty('--brand-secondary', brandingConfig.secondaryColor);
      root.style.setProperty('--brand-secondary-50', lightenColor(brandingConfig.secondaryColor, 0.95));
      root.style.setProperty('--brand-secondary-100', lightenColor(brandingConfig.secondaryColor, 0.9));
      root.style.setProperty('--brand-secondary-500', brandingConfig.secondaryColor);
      root.style.setProperty('--brand-secondary-600', darkenColor(brandingConfig.secondaryColor, 0.1));
      root.style.setProperty('--brand-secondary-700', darkenColor(brandingConfig.secondaryColor, 0.2));
    }

    // Update document title with tenant name
    if (currentTenant?.name) {
      document.title = `${currentTenant.name} - School Management Platform`;
    }

    // Apply custom CSS
    if (brandingConfig.customCss) {
      applyCustomCSS(brandingConfig.customCss);
    }

    // Update favicon
    if (brandingConfig.favicon) {
      updateFavicon(brandingConfig.favicon);
    }
  };

  const clearBrandingFromDocument = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Remove CSS custom properties
    const brandProperties = [
      '--brand-primary',
      '--brand-primary-50',
      '--brand-primary-100',
      '--brand-primary-500',
      '--brand-primary-600',
      '--brand-primary-700',
      '--brand-secondary',
      '--brand-secondary-50',
      '--brand-secondary-100',
      '--brand-secondary-500',
      '--brand-secondary-600',
      '--brand-secondary-700'
    ];

    brandProperties.forEach(property => {
      root.style.removeProperty(property);
    });

    // Remove custom CSS
    const customStyleElement = document.getElementById('tenant-branding-css');
    if (customStyleElement) {
      customStyleElement.remove();
    }

    // Reset document title
    document.title = 'School Management Platform';
  };

  const applyCustomCSS = (customCss: string) => {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('tenant-branding-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add new custom CSS
    const style = document.createElement('style');
    style.id = 'tenant-branding-css';
    style.textContent = customCss;
    document.head.appendChild(style);
  };

  const updateFavicon = (faviconUrl: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  return <>{children}</>;
};

/**
 * Tenant Logo Component
 * 
 * Displays tenant-specific logo with fallback
 */
interface TenantLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  fallbackText?: string;
}

export const TenantLogo: React.FC<TenantLogoProps> = ({
  className = '',
  size = 'md',
  showFallback = true,
  fallbackText
}) => {
  const { branding, tenantName } = useTenantBranding();

  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const fallbackSizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  };

  if (branding?.logo) {
    return (
      <img
        src={branding.logo}
        alt={`${tenantName} logo`}
        className={`${sizeClasses[size]} ${className}`}
        onError={(e) => {
          if (showFallback) {
            // Hide image and show fallback
            e.currentTarget.style.display = 'none';
          }
        }}
      />
    );
  }

  if (showFallback) {
    const displayText = fallbackText || tenantName.charAt(0).toUpperCase();
    
    return (
      <div className={`${fallbackSizeClasses[size]} ${className} bg-brand-primary text-white rounded-lg flex items-center justify-center font-semibold`}>
        {displayText}
      </div>
    );
  }

  return null;
};

/**
 * Tenant Themed Button Component
 * 
 * Button component that uses tenant branding colors
 */
interface TenantThemedButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const TenantThemedButton: React.FC<TenantThemedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary-600 focus:ring-brand-primary disabled:bg-gray-300',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary-600 focus:ring-brand-secondary disabled:bg-gray-300',
    outline: 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white focus:ring-brand-primary disabled:border-gray-300 disabled:text-gray-300'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );
};

/**
 * Tenant Themed Card Component
 * 
 * Card component with tenant branding accents
 */
interface TenantThemedCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  accentPosition?: 'top' | 'left' | 'bottom' | 'right';
}

export const TenantThemedCard: React.FC<TenantThemedCardProps> = ({
  children,
  className = '',
  accent = false,
  accentPosition = 'top'
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-sm border border-gray-200';
  
  const accentClasses = accent ? {
    top: 'border-t-4 border-t-brand-primary',
    left: 'border-l-4 border-l-brand-primary',
    bottom: 'border-b-4 border-b-brand-primary',
    right: 'border-r-4 border-r-brand-primary'
  }[accentPosition] : '';

  return (
    <div className={`${baseClasses} ${accentClasses} ${className}`}>
      {children}
    </div>
  );
};

// Utility functions for color manipulation
function lightenColor(color: string, amount: number): string {
  // Simple color lightening - in production, use a proper color manipulation library
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darkenColor(color: string, amount: number): string {
  // Simple color darkening - in production, use a proper color manipulation library
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Hook for tenant-aware styling
 */
export const useTenantStyling = () => {
  const { branding, primaryColor, secondaryColor } = useTenantBranding();

  const getThemedStyles = useCallback((element: 'button' | 'card' | 'input' | 'link') => {
    const styles: Record<string, React.CSSProperties> = {
      button: {
        backgroundColor: primaryColor,
        borderColor: primaryColor,
      },
      card: {
        borderTopColor: primaryColor,
      },
      input: {
        borderColor: primaryColor,
      } as React.CSSProperties,
      link: {
        color: primaryColor,
      }
    };

    return styles[element] || {};
  }, [primaryColor, secondaryColor]);

  return {
    branding,
    primaryColor,
    secondaryColor,
    getThemedStyles,
  };
};
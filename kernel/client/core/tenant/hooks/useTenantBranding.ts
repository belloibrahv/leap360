/**
 * Tenant Branding Hook - TechVaults Brand
 * 
 * Professional branding with TechVaults color scheme and advanced styling.
 */

import { useMemo } from 'react';

export interface TenantBrandingReturn {
  branding: any | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo?: string;
  favicon?: string;
  customCss?: string;
  tenantName: string;
}

/**
 * TechVaults branding hook with professional color scheme
 */
export function useTenantBranding(): TenantBrandingReturn {
  // TechVaults professional branding
  const techVaultsBranding = useMemo(() => ({
    primaryColor: '#bc0004', // TechVaults Red
    secondaryColor: '#000000', // Black
    accentColor: '#ffffff', // White
    logo: undefined,
    favicon: undefined,
    customCss: undefined,
    tenantName: 'LEAP360 by TechVaults'
  }), []);

  return {
    branding: null,
    primaryColor: techVaultsBranding.primaryColor,
    secondaryColor: techVaultsBranding.secondaryColor,
    accentColor: techVaultsBranding.accentColor,
    logo: techVaultsBranding.logo,
    favicon: techVaultsBranding.favicon,
    customCss: techVaultsBranding.customCss,
    tenantName: techVaultsBranding.tenantName,
  };
}

export default useTenantBranding;
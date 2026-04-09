/**
 * Tenant Context Management System - Simplified
 * 
 * Lightweight tenant management for performance optimization.
 */

// Branding hook (main implementation)
export { useTenantBranding } from './hooks/useTenantBranding';

// Types (re-export from enhanced-auth types)
export type {
  TenantContext,
  BrandingConfig,
  TenantSettings,
  SubscriptionInfo,
} from '@/types/enhanced-auth';
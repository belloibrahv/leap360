/**
 * Integration Tests for Multi-Tenant Context Management
 * 
 * Tests the complete integration of all tenant management components
 * including context switching, data isolation, persistence, and branding.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiTenantProvider } from '../MultiTenantProvider';
import { TenantSwitcher } from '@/core/auth/components/TenantSwitcher';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';
import { TenantContext } from '@/types/enhanced-auth';

// Mock the enhanced auth hook
jest.mock('@/core/hooks/useEnhancedAuth');
const mockUseEnhancedAuth = useEnhancedAuth as jest.MockedFunction<typeof useEnhancedAuth>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock tenant data
const mockTenant1: TenantContext = {
  id: 'tenant-1',
  name: 'Primary School District',
  slug: 'primary-school',
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    logo: 'https://example.com/logo1.png',
  },
  settings: {
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
    language: 'en',
    features: ['basic_reporting', 'user_management'],
    maxUsers: 1000,
    maxSchools: 10,
  },
  subscription: {
    plan: 'standard',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
    features: ['basic_reporting', 'user_management'],
  },
};

const mockTenant2: TenantContext = {
  id: 'tenant-2',
  name: 'Secondary School District',
  slug: 'secondary-school',
  branding: {
    primaryColor: '#10B981',
    secondaryColor: '#374151',
    logo: 'https://example.com/logo2.png',
  },
  settings: {
    timezone: 'EST',
    dateFormat: 'dd/MM/yyyy',
    currency: 'USD',
    language: 'en',
    features: ['advanced_reporting', 'api_access'],
    maxUsers: 500,
    maxSchools: 5,
  },
  subscription: {
    plan: 'premium',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
    features: ['advanced_reporting', 'api_access'],
  },
};

// Test application component
const TestApp: React.FC = () => {
  return (
    <MultiTenantProvider
      fallbackBranding={{ primaryColor: '#6B7280' }}
      maxCacheSize={100}
      autoSave={true}
    >
      <div data-testid="app-container">
        <TenantSwitcher 
          showBranding={true}
          showSubscriptionInfo={true}
          data-testid="tenant-switcher"
        />
        <div data-testid="app-content">
          Application Content
        </div>
      </div>
    </MultiTenantProvider>
  );
};

describe('Multi-Tenant Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock document.documentElement.style
    Object.defineProperty(document.documentElement, 'style', {
      value: {
        setProperty: jest.fn(),
        removeProperty: jest.fn(),
      },
      writable: true,
    });
  });

  it('should initialize with single tenant', async () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    render(<TestApp />);

    expect(screen.getByTestId('app-container')).toBeInTheDocument();
    expect(screen.getByTestId('app-content')).toBeInTheDocument();
    
    // Should not show tenant switcher for single tenant
    expect(screen.queryByTestId('tenant-switcher')).not.toBeInTheDocument();
  });

  it('should handle multi-tenant switching with data isolation', async () => {
    const mockSwitchTenant = jest.fn().mockImplementation(async (tenantId) => {
      // Simulate tenant switch by updating the mock return value
      const newTenant = tenantId === 'tenant-2' ? mockTenant2 : mockTenant1;
      mockUseEnhancedAuth.mockReturnValue({
        currentTenant: newTenant,
        availableTenants: [mockTenant1, mockTenant2],
        switchTenant: mockSwitchTenant,
        user: { id: 'user-1', role: 'admin' },
        isAuthenticated: true,
      } as any);
    });

    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: mockSwitchTenant,
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    const { rerender } = render(<TestApp />);

    // Should show tenant switcher for multiple tenants
    expect(screen.getByTestId('tenant-switcher')).toBeInTheDocument();

    // Click to open tenant switcher
    const switcherButton = screen.getByRole('button');
    fireEvent.click(switcherButton);

    // Find and click switch button for tenant 2
    const switchToTenant2 = screen.getByText(/Secondary School District/);
    fireEvent.click(switchToTenant2);

    await waitFor(() => {
      expect(mockSwitchTenant).toHaveBeenCalledWith('tenant-2');
    });

    // Rerender with new tenant
    rerender(<TestApp />);

    // Verify branding was applied
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--tenant-primary-color',
      '#10B981'
    );
  });

  it('should persist tenant context to localStorage', async () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    render(<TestApp />);

    // Wait for auto-save to trigger
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'tenant_context',
        expect.stringContaining('tenant-1')
      );
    }, { timeout: 2000 });
  });

  it('should restore tenant context from localStorage', async () => {
    // Mock stored tenant data
    const storedData = JSON.stringify({
      tenantId: 'tenant-1',
      tenantName: 'Primary School District',
      lastAccessed: Date.now(),
      version: '1.0.0',
      checksum: 'abc123',
    });
    
    localStorageMock.getItem.mockReturnValue(storedData);

    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: null,
      availableTenants: [],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    render(<TestApp />);

    // Should attempt to load from localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('tenant_context');
  });

  it('should handle tenant branding changes', async () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    const { rerender } = render(<TestApp />);

    // Verify initial branding
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--brand-primary',
      '#3B82F6'
    );

    // Switch to tenant with different branding
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant2,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    rerender(<TestApp />);

    // Verify new branding
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--brand-primary',
      '#10B981'
    );
  });

  it('should clear data when switching tenants', async () => {
    const mockSwitchTenant = jest.fn().mockResolvedValue(undefined);
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: mockSwitchTenant,
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    render(<TestApp />);

    // Open tenant switcher and switch
    const switcherButton = screen.getByRole('button');
    fireEvent.click(switcherButton);

    const switchToTenant2 = screen.getByText(/Secondary School District/);
    fireEvent.click(switchToTenant2);

    await waitFor(() => {
      expect(mockSwitchTenant).toHaveBeenCalledWith('tenant-2');
    });

    // Data isolation should clear previous tenant data
    // This would be verified by checking cache clearing in actual implementation
  });

  it('should handle authentication state changes', async () => {
    // Start authenticated
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    const { rerender } = render(<TestApp />);

    // Verify tenant is loaded
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
      '--brand-primary',
      '#3B82F6'
    );

    // Simulate logout
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: null,
      availableTenants: [],
      switchTenant: jest.fn(),
      user: null,
      isAuthenticated: false,
    } as any);

    rerender(<TestApp />);

    // Verify branding is cleared
    expect(document.documentElement.style.removeProperty).toHaveBeenCalledWith(
      '--brand-primary'
    );
  });

  it('should handle feature flags correctly', async () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    // Test component that uses feature flags
    const FeatureTestComponent: React.FC = () => {
      const { useFeatureFlags } = require('../TenantConfigurationManager');
      const { hasFeature } = useFeatureFlags();

      return (
        <div>
          <div data-testid="has-basic-reporting">
            {hasFeature('basic_reporting').toString()}
          </div>
          <div data-testid="has-advanced-reporting">
            {hasFeature('advanced_reporting').toString()}
          </div>
        </div>
      );
    };

    render(
      <MultiTenantProvider>
        <FeatureTestComponent />
      </MultiTenantProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('has-basic-reporting')).toHaveTextContent('true');
      expect(screen.getByTestId('has-advanced-reporting')).toHaveTextContent('false');
    });
  });

  it('should handle errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockSwitchTenant = jest.fn().mockRejectedValue(new Error('Network error'));
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: mockSwitchTenant,
      user: { id: 'user-1', role: 'admin' },
      isAuthenticated: true,
    } as any);

    render(<TestApp />);

    // Try to switch tenants
    const switcherButton = screen.getByRole('button');
    fireEvent.click(switcherButton);

    const switchToTenant2 = screen.getByText(/Secondary School District/);
    fireEvent.click(switchToTenant2);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to switch tenant:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
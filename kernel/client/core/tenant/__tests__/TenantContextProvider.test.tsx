/**
 * Unit Tests for TenantContextProvider
 * 
 * Tests tenant context management, switching, and state updates.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TenantContextProvider, useTenantContext } from '../TenantContextProvider';
import { useEnhancedAuth } from '@/core/hooks/useEnhancedAuth';
import { TenantContext } from '@/types/enhanced-auth';

// Mock the enhanced auth hook
jest.mock('@/core/hooks/useEnhancedAuth');
const mockUseEnhancedAuth = useEnhancedAuth as jest.MockedFunction<typeof useEnhancedAuth>;

// Mock tenant data
const mockTenant1: TenantContext = {
  id: 'tenant-1',
  name: 'Test School District',
  slug: 'test-school',
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    logo: 'https://example.com/logo.png',
  },
  settings: {
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
    currency: 'USD',
    language: 'en',
    features: ['basic_reporting'],
    maxUsers: 1000,
    maxSchools: 10,
  },
  subscription: {
    plan: 'standard',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
    features: ['basic_reporting'],
  },
};

const mockTenant2: TenantContext = {
  id: 'tenant-2',
  name: 'Another District',
  slug: 'another-district',
  settings: {
    timezone: 'EST',
    dateFormat: 'dd/MM/yyyy',
    currency: 'USD',
    language: 'en',
    features: ['advanced_reporting'],
    maxUsers: 500,
    maxSchools: 5,
  },
  subscription: {
    plan: 'premium',
    status: 'active',
    expiresAt: '2024-12-31T23:59:59Z',
    features: ['advanced_reporting'],
  },
};

// Test component that uses the tenant context
const TestComponent: React.FC = () => {
  const {
    currentTenant,
    availableTenants,
    branding,
    settings,
    isLoading,
    switchTenant,
    hasMultipleTenants,
  } = useTenantContext();

  return (
    <div>
      <div data-testid="current-tenant">
        {currentTenant ? currentTenant.name : 'No tenant'}
      </div>
      <div data-testid="tenant-count">{availableTenants.length}</div>
      <div data-testid="has-multiple">{hasMultipleTenants.toString()}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="branding-color">
        {branding?.primaryColor || 'No color'}
      </div>
      <div data-testid="settings-timezone">
        {settings?.timezone || 'No timezone'}
      </div>
      {availableTenants.map((tenant) => (
        <button
          key={tenant.id}
          data-testid={`switch-${tenant.id}`}
          onClick={() => switchTenant(tenant.id)}
        >
          Switch to {tenant.name}
        </button>
      ))}
    </div>
  );
};

describe('TenantContextProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with no tenant when not authenticated', () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: null,
      availableTenants: [],
      switchTenant: jest.fn(),
      user: null,
      isAuthenticated: false,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    expect(screen.getByTestId('current-tenant')).toHaveTextContent('No tenant');
    expect(screen.getByTestId('tenant-count')).toHaveTextContent('0');
    expect(screen.getByTestId('has-multiple')).toHaveTextContent('false');
  });

  it('should render with current tenant when authenticated', () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    expect(screen.getByTestId('current-tenant')).toHaveTextContent('Test School District');
    expect(screen.getByTestId('tenant-count')).toHaveTextContent('1');
    expect(screen.getByTestId('has-multiple')).toHaveTextContent('false');
    expect(screen.getByTestId('branding-color')).toHaveTextContent('#3B82F6');
    expect(screen.getByTestId('settings-timezone')).toHaveTextContent('UTC');
  });

  it('should handle multiple tenants', () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    expect(screen.getByTestId('tenant-count')).toHaveTextContent('2');
    expect(screen.getByTestId('has-multiple')).toHaveTextContent('true');
    expect(screen.getByTestId('switch-tenant-1')).toBeInTheDocument();
    expect(screen.getByTestId('switch-tenant-2')).toBeInTheDocument();
  });

  it('should handle tenant switching', async () => {
    const mockSwitchTenant = jest.fn().mockResolvedValue(undefined);
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: mockSwitchTenant,
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    const switchButton = screen.getByTestId('switch-tenant-2');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(mockSwitchTenant).toHaveBeenCalledWith('tenant-2');
    });
  });

  it('should handle tenant switching errors', async () => {
    const mockSwitchTenant = jest.fn().mockRejectedValue(new Error('Switch failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1, mockTenant2],
      switchTenant: mockSwitchTenant,
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    const switchButton = screen.getByTestId('switch-tenant-2');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Tenant switch error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('should apply tenant branding to document', () => {
    const setPropertySpy = jest.spyOn(document.documentElement.style, 'setProperty');
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    expect(setPropertySpy).toHaveBeenCalledWith('--tenant-primary-color', '#3B82F6');
    expect(setPropertySpy).toHaveBeenCalledWith('--tenant-secondary-color', '#6B7280');

    setPropertySpy.mockRestore();
  });

  it('should clear branding when tenant is removed', () => {
    const removePropertySpy = jest.spyOn(document.documentElement.style, 'removeProperty');
    
    const { rerender } = render(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    // First render with tenant
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    rerender(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    // Second render without tenant
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: null,
      availableTenants: [],
      switchTenant: jest.fn(),
      user: null,
      isAuthenticated: false,
    } as any);

    rerender(
      <TenantContextProvider>
        <TestComponent />
      </TenantContextProvider>
    );

    expect(removePropertySpy).toHaveBeenCalledWith('--tenant-primary-color');
    expect(removePropertySpy).toHaveBeenCalledWith('--tenant-secondary-color');

    removePropertySpy.mockRestore();
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTenantContext must be used within a TenantContextProvider');

    consoleSpy.mockRestore();
  });
});

describe('useTenantBranding hook', () => {
  it('should return branding information', () => {
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: mockTenant1,
      availableTenants: [mockTenant1],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    const TestBrandingComponent: React.FC = () => {
      const { useTenantBranding } = require('../TenantContextProvider');
      const { branding, primaryColor, tenantName } = useTenantBranding();

      return (
        <div>
          <div data-testid="primary-color">{primaryColor}</div>
          <div data-testid="tenant-name">{tenantName}</div>
        </div>
      );
    };

    render(
      <TenantContextProvider>
        <TestBrandingComponent />
      </TenantContextProvider>
    );

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#3B82F6');
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('Test School District');
  });

  it('should return default values when no branding', () => {
    const tenantWithoutBranding = { ...mockTenant1, branding: undefined };
    
    mockUseEnhancedAuth.mockReturnValue({
      currentTenant: tenantWithoutBranding,
      availableTenants: [tenantWithoutBranding],
      switchTenant: jest.fn(),
      user: { id: 'user-1' },
      isAuthenticated: true,
    } as any);

    const TestBrandingComponent: React.FC = () => {
      const { useTenantBranding } = require('../TenantContextProvider');
      const { primaryColor } = useTenantBranding();

      return <div data-testid="primary-color">{primaryColor}</div>;
    };

    render(
      <TenantContextProvider>
        <TestBrandingComponent />
      </TenantContextProvider>
    );

    expect(screen.getByTestId('primary-color')).toHaveTextContent('#3B82F6'); // Default color
  });
});
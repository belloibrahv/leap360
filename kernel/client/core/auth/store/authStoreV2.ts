/**
 * Enhanced Authentication Store
 * 
 * Manages authentication state for the multi-tenant school platform.
 * Handles login, logout, token management, and user profile.
 */

import { User, AuthState, LoginRequest } from '../../../types/auth';
import { AuthApiClient, TokenManager } from '../../services/authApi';

type AuthStateListener = (state: AuthState) => void;

/**
 * Enhanced authentication store with reactive state management
 */
class AuthStoreV2 {
  private static instance: AuthStoreV2;
  private state: AuthState;
  private listeners: Set<AuthStateListener> = new Set();

  private constructor() {
    // Initialize state
    this.state = {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };

    // Load initial state from storage
    this.loadFromStorage();
  }

  static getInstance(): AuthStoreV2 {
    if (!AuthStoreV2.instance) {
      AuthStoreV2.instance = new AuthStoreV2();
    }
    return AuthStoreV2.instance;
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: AuthStateListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current authentication state
   */
  getState(): AuthState {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  private setState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Load authentication state from storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const accessToken = await TokenManager.getValidAccessToken();
      
      if (accessToken) {
        // Validate token and get user profile
        const userProfile = await AuthApiClient.getCurrentUser(accessToken);
        
        this.setState({
          user: userProfile.data,
          token: accessToken,
          refreshToken: TokenManager.getRefreshToken(),
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      // Token is invalid, clear storage
      TokenManager.clearTokens();
      this.setState({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<void> {
    this.setState({ isLoading: true, error: null });

    try {
      const response = await AuthApiClient.login(credentials);
      
      // Store tokens
      TokenManager.storeTokens(
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );

      // Update state
      this.setState({
        user: response.data.user,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.response?.message || error.message || 'Login failed',
      });
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const token = this.state.token;

    // Clear state immediately
    this.setState({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    // Clear storage
    TokenManager.clearTokens();

    // Call logout API if we have a token
    if (token) {
      try {
        await AuthApiClient.logout(token);
      } catch (error) {
        // Ignore logout API errors since we've already cleared local state
        console.warn('Logout API call failed:', error);
      }
    }
  }

  /**
   * Refresh current user profile
   */
  async refreshUserProfile(): Promise<void> {
    const token = await TokenManager.getValidAccessToken();
    
    if (!token) {
      await this.logout();
      return;
    }

    try {
      const userProfile = await AuthApiClient.getCurrentUser(token);
      
      this.setState({
        user: userProfile.data,
        token,
        error: null,
      });
    } catch (error: any) {
      // If profile fetch fails, logout
      await this.logout();
      throw error;
    }
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  async getValidToken(): Promise<string | null> {
    try {
      const token = await TokenManager.getValidAccessToken();
      
      if (token && token !== this.state.token) {
        // Token was refreshed, update state
        this.setState({ token });
      }
      
      return token;
    } catch (error) {
      // Token refresh failed, logout
      await this.logout();
      return null;
    }
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permission: string): boolean {
    if (!this.state.user) return false;
    
    // Import permission checking logic from types
    const { hasPermission } = require('../../../types/auth');
    return hasPermission(this.state.user.role, permission);
  }

  /**
   * Check if user has admin role
   */
  isAdmin(): boolean {
    if (!this.state.user) return false;
    
    const { isAdminRole } = require('../../../types/auth');
    return isAdminRole(this.state.user.role);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Get current error
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setState({ error: null });
  }
}

// Export singleton instance
export const authStore = AuthStoreV2.getInstance();

// Export class for testing
export { AuthStoreV2 };
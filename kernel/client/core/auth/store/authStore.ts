/**
 * Legacy Authentication Store (Deprecated)
 * 
 * This store is maintained for backward compatibility.
 * New code should use enhancedAuthStore instead.
 */

import { useEnhancedAuthStore } from './enhancedAuthStore';

class AuthStore {
  private static instance: AuthStore;

  private constructor() {
    console.warn('AuthStore is deprecated. Use enhancedAuthStore instead.');
  }

  static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  // Delegate to enhanced store
  setCredentials(token: string, email: string) {
    console.warn('AuthStore.setCredentials is deprecated. Use enhancedAuthStore.login instead.');
  }

  getToken(): string | null {
    const store = useEnhancedAuthStore.getState();
    return store.accessToken;
  }

  getEmail(): string | null {
    const store = useEnhancedAuthStore.getState();
    return store.user?.email || null;
  }

  clearAuth() {
    const store = useEnhancedAuthStore.getState();
    store.logout();
  }

  isAuthenticated(): boolean {
    const store = useEnhancedAuthStore.getState();
    return store.isAuthenticated;
  }

  async logout(): Promise<void> {
    const store = useEnhancedAuthStore.getState();
    await store.logout();
  }
}

export const authStore = AuthStore.getInstance();

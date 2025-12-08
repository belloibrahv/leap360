class AuthStore {
  private static instance: AuthStore;
  private token: string | null = null;
  private email: string | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      // Only access sessionStorage in browser environment
      this.token = sessionStorage.getItem('auth_token');
      this.email = sessionStorage.getItem('auth_email');
    }
  }

  static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  setCredentials(token: string, email: string) {
    this.token = token;
    this.email = email;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth_token', token);
      sessionStorage.setItem('auth_email', email);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_token') || this.token;
    }
    return this.token;
  }

  getEmail(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('auth_email') || this.email;
    }
    return this.email;
  }

  clearAuth() {
    this.token = null;
    this.email = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_email');
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async logout(): Promise<void> {
    this.clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}

export const authStore = AuthStore.getInstance();

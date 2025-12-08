export type ErrorType = 
  | 'validation' 
  | 'authentication' 
  | 'network' 
  | 'server' 
  | 'timeout';

export const ERROR_MESSAGES = {
  validation: {
    email: {
      required: "Email address is required",
      invalid: "Please enter a valid email address"
    },
    password: {
      required: "Password is required",
      tooShort: "Password must be at least 6 characters"
    }
  },
  authentication: {
    invalidCredentials: "Invalid email or password",
    accountLocked: "Account temporarily locked. Try again later"
  },
  network: {
    connectionFailed: "Unable to connect to server",
    timeout: "Request timed out. Please check your connection",
    offline: "You appear to be offline. Check your connection"
  },
  server: {
    internalError: "Server error occurred. Please try again",
    serviceUnavailable: "Service temporarily unavailable"
  }
} as const;

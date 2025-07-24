import auth0 from 'auth0-js';
import { AuthTokens, AuthUser, LoginCredentials, SignupCredentials, AuthError } from '../types/auth.types';

class AuthService {
  private auth0: auth0.WebAuth;
  private accessToken: string | null = null;
  private idToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;

  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: process.env.REACT_APP_AUTH0_DOMAIN || '',
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/callback`,
      responseType: 'token id_token',
      scope: 'openid profile email offline_access',
      audience: process.env.REACT_APP_AUTH0_AUDIENCE || `https://${process.env.REACT_APP_AUTH0_DOMAIN}/userinfo`
    });
  }

  public login = (credentials: LoginCredentials): Promise<AuthTokens> => {
    return new Promise((resolve, reject) => {
      this.auth0.login({
        realm: 'Username-Password-Authentication',
        username: credentials.email,
        password: credentials.password,
        scope: 'openid profile email offline_access'
      }, (err, authResult) => {
        if (err) {
          reject(this.formatError(err));
          return;
        }
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve({
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            refreshToken: authResult.refreshToken,
            expiresIn: authResult.expiresIn || 86400,
            scope: authResult.scope
          });
        } else {
          reject({ error: 'authentication_failed', errorDescription: 'No tokens received' });
        }
      });
    });
  };

  public signup = (credentials: SignupCredentials): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.auth0.signup({
        connection: 'Username-Password-Authentication',
        email: credentials.email,
        password: credentials.password,
        userMetadata: {
          name: credentials.name,
          workspaceName: credentials.workspaceName
        }
      }, (err) => {
        if (err) {
          reject(this.formatError(err));
          return;
        }
        resolve();
      });
    });
  };

  public getUserInfo = (): Promise<AuthUser> => {
    return new Promise((resolve, reject) => {
      if (!this.accessToken) {
        reject({ error: 'no_token', errorDescription: 'No access token found' });
        return;
      }

      this.auth0.client.userInfo(this.accessToken, (err, user) => {
        if (err) {
          reject(this.formatError(err));
          return;
        }
        
        const userAny = user as any;
        resolve({
          id: user.sub || '',
          auth0Id: user.sub || '',
          email: user.email || '',
          name: user.name || '',
          picture: user.picture,
          emailVerified: user.email_verified,
          workspaceId: userAny['https://productivityapp.com/workspace_id'],
          role: userAny['https://productivityapp.com/role']
        });
      });
    });
  };

  public renewTokens = (): Promise<AuthTokens> => {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) {
          reject(this.formatError(err));
          return;
        }
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve({
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            refreshToken: authResult.refreshToken,
            expiresIn: authResult.expiresIn || 86400,
            scope: authResult.scope
          });
        } else {
          reject({ error: 'renewal_failed', errorDescription: 'Failed to renew tokens' });
        }
      });
    });
  };

  public logout = (): void => {
    // Clear tokens
    this.accessToken = null;
    this.idToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;

    // Logout from Auth0
    this.auth0.logout({
      returnTo: window.location.origin,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID
    });
  };

  public isAuthenticated = (): boolean => {
    return new Date().getTime() < this.expiresAt && !!this.accessToken;
  };

  public getAccessToken = (): string | null => {
    return this.accessToken;
  };

  public getIdToken = (): string | null => {
    return this.idToken;
  };

  private setSession = (authResult: any): void => {
    // Set the time that the access token will expire at
    const expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.refreshToken = authResult.refreshToken;
    this.expiresAt = expiresAt;
  };

  private formatError = (err: any): AuthError => {
    // Map common Auth0 error codes to user-friendly messages
    const errorMessages: { [key: string]: string } = {
      'wrong_email_or_password': 'Invalid email or password. Please try again.',
      'invalid_password': 'Password doesn\'t meet security requirements.',
      'user_exists': 'An account with this email already exists. Please sign in instead.',
      'invalid_signup': 'An account with this email already exists. Please sign in instead.',
      'too_many_attempts': 'Too many failed attempts. Please try again later.',
      'lock.network': 'Network error. Please check your connection and try again.',
      'lock.unauthorized': 'Access denied. Please check your credentials.',
      'lock.invalid_email_password': 'Invalid email or password. Please try again.',
      'invalid_grant': 'Invalid credentials. Please check your email and password.',
      'access_denied': 'Access denied. You may not have permission to access this resource.',
      'unauthorized': 'Your session has expired. Please sign in again.',
      'password_change_required': 'Password change required. Please reset your password.',
      'password_leaked': 'This password has been compromised in a data breach. Please choose a different password.',
      'requires_verification': 'Please verify your email address before signing in.',
      'invalid_connection': 'Authentication configuration error. Please contact support.',
      'no_connection': 'Authentication service unavailable. Please try again later.',
      'timeout': 'Request timed out. Please check your connection and try again.',
      'user_blocked': 'Your account has been blocked. Please contact support.',
      'email_verified': 'Email verification required. Please check your inbox.',
      'bad.email': 'Please enter a valid email address.',
      'bad.password': 'Password is required.',
      'bad.connection': 'Connection error. Please try again.',
      // Catch specific error descriptions
      'The user already exists.': 'An account with this email already exists. Please sign in instead.',
      'Wrong email or password.': 'Invalid email or password. Please try again.',
      'Invalid sign up': 'Unable to create account. Please check your information and try again.'
    };

    // Extract error code and description
    const errorCode = err.code || err.error || err.name || 'unknown_error';
    const errorDescription = err.description || err.error_description || err.message || '';
    
    // Check if we have a user-friendly message for this error
    let friendlyMessage = errorMessages[errorCode] || errorMessages[errorDescription];
    
    // If no specific mapping found, provide a more helpful generic message
    if (!friendlyMessage) {
      // Check if the error description contains known patterns
      for (const [key, value] of Object.entries(errorMessages)) {
        if (errorDescription.toLowerCase().includes(key.toLowerCase())) {
          friendlyMessage = value;
          break;
        }
      }
    }
    
    // Log the original error for debugging (without sensitive data)
    console.error('[Auth Error]', {
      code: errorCode,
      description: errorDescription,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString()
    });

    return {
      error: errorCode,
      errorDescription: friendlyMessage || errorDescription || 'An error occurred during authentication. Please try again.',
      statusCode: err.statusCode
    };
  };

  public parseHashFromUrl = (): Promise<AuthTokens> => {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash({ hash: window.location.hash }, (err, authResult) => {
        if (err) {
          reject(this.formatError(err));
          return;
        }
        if (authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = '';
          this.setSession(authResult);
          resolve({
            accessToken: authResult.accessToken,
            idToken: authResult.idToken,
            refreshToken: authResult.refreshToken,
            expiresIn: authResult.expiresIn || 86400,
            scope: authResult.scope
          });
        } else {
          reject({ error: 'invalid_hash', errorDescription: 'No valid tokens in URL hash' });
        }
      });
    });
  };
}

const authService = new AuthService();
export default authService;
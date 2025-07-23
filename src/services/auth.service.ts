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
    return {
      error: err.code || err.error || 'unknown_error',
      errorDescription: err.description || err.error_description || err.message || 'An unknown error occurred',
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
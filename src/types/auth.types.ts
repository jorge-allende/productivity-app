export interface AuthUser {
  id: string;
  auth0Id: string;
  email: string;
  name: string;
  avatar?: string;
  picture?: string;
  workspaceId?: string;
  workspaceName?: string;
  role?: 'Admin' | 'Manager';
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken?: string;
  expiresIn: number;
  scope?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  workspaceName?: string;
}

export interface AuthError {
  error: string;
  code?: string;
  message?: string;
  errorDescription?: string;
  statusCode?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: AuthError | null;
}

export interface WorkspaceInvite {
  code: string;
  workspaceId: string;
  workspaceName: string;
  role: 'Admin' | 'Manager';
  email?: string;
}
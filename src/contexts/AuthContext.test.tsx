import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import authService from '../services/auth.service';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../services/auth.service', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    getAccessToken: jest.fn(),
    isAuthenticated: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    parseHashFromUrl: jest.fn(),
    getUserInfo: jest.fn(),
    renewTokens: jest.fn(),
  },
}));

jest.mock('react-hot-toast');
jest.mock('convex/react', () => ({
  ...jest.requireActual('convex/react'),
  ConvexProvider: ({ children }: any) => children,
  ConvexReactClient: jest.fn(),
  useConvexAuth: jest.fn(),
  useMutation: jest.fn(() => jest.fn()),
  useQuery: jest.fn(() => undefined),
}));
jest.mock('./WorkspaceContext', () => ({
  useWorkspace: jest.fn(() => ({ 
    currentWorkspace: null,
    setCurrentWorkspace: jest.fn()
  })),
  WorkspaceProvider: ({ children }: any) => children,
}));

// Mock the Convex API
jest.mock('../convex/_generated/api', () => ({
  api: {
    auth: {
      syncUser: jest.fn(),
      joinWorkspaceViaInvitation: jest.fn(),
      getCurrentUser: jest.fn(),
      getUserWorkspace: jest.fn(),
    },
  },
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockToast = toast as jest.Mocked<typeof toast>;

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (user) return <div>User: {user.name}</div>;
  
  return <div>Not authenticated</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToast.error = jest.fn();
    mockToast.success = jest.fn();
    
    // Reset auth service mock
    mockAuthService.getAccessToken.mockReturnValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    mockAuthService.parseHashFromUrl.mockRejectedValue({ error: 'login_required' });
    mockAuthService.getUserInfo.mockRejectedValue({ error: 'no_token' });
    mockAuthService.renewTokens.mockRejectedValue({ error: 'login_required' });
    
    // Reset localStorage
    localStorage.clear();
  });

  it('should render loading state initially', async () => {
    const { useMutation } = require('convex/react');
    useMutation.mockReturnValue(jest.fn());

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should render authenticated user', async () => {
    const mockUser = {
      id: 'user123',
      auth0Id: 'auth0|user123',
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    mockAuthService.getUserInfo.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getAccessToken.mockReturnValue('mock-token');

    const { useMutation } = require('convex/react');
    useMutation.mockReturnValue(jest.fn());

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: Test User')).toBeInTheDocument();
    });
  });

  it('should handle authentication errors', async () => {
    const mockError = new Error('Authentication failed');
    
    const { useMutation } = require('convex/react');
    const mockLogin = jest.fn().mockRejectedValue(mockError);
    useMutation.mockReturnValue(mockLogin);

    const LoginTestComponent = () => {
      const { login, error } = useAuth();
      
      const handleLogin = async () => {
        try {
          await login({ email: 'test@example.com', password: 'password' });
        } catch (e) {
          // Error handled in context
        }
      };
      
      return (
        <>
          <button onClick={handleLogin}>Login</button>
          {error && <div>Error: {error.message}</div>}
        </>
      );
    };

    render(
      <AuthProvider>
        <LoginTestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    // Authentication error should be handled by the component
  });

  it('should handle logout', async () => {
    const mockUser = {
      id: 'user123',
      auth0Id: 'auth0|user123',
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    mockAuthService.getUserInfo.mockResolvedValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.logout.mockImplementation(() => {
      mockAuthService.getUserInfo.mockRejectedValue({ error: 'no_token' });
      mockAuthService.isAuthenticated.mockReturnValue(false);
    });

    const { useMutation } = require('convex/react');
    useMutation.mockReturnValue(jest.fn());

    const LogoutTestComponent = () => {
      const { logout, user } = useAuth();
      return (
        <>
          {user && <div>User: {user.name}</div>}
          <button onClick={logout}>Logout</button>
        </>
      );
    };

    render(
      <AuthProvider>
        <LogoutTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: Test User')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    
    act(() => {
      logoutButton.click();
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should render not authenticated when no user', async () => {
    mockAuthService.getUserInfo.mockRejectedValue({ error: 'no_token' });
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const { useMutation } = require('convex/react');
    useMutation.mockReturnValue(jest.fn());

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('should handle login successfully', async () => {
    const mockUser = {
      id: 'user123',
      auth0Id: 'auth0|user123',
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    const { useMutation } = require('convex/react');
    const mockGetOrCreateByEmail = jest.fn().mockResolvedValue(mockUser);
    useMutation.mockReturnValue(mockGetOrCreateByEmail);

    mockAuthService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      idToken: 'mock-id-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 86400,
      scope: 'openid profile email'
    });
    
    // After login, getUserInfo should return the user
    mockAuthService.getUserInfo.mockResolvedValue({
      ...mockUser,
      auth0Id: 'auth0|' + mockUser.id
    });

    const LoginTestComponent = () => {
      const { login, user } = useAuth();
      
      const handleLogin = async () => {
        await login({ email: 'test@example.com', password: 'password' });
      };
      
      return (
        <>
          <button onClick={handleLogin}>Login</button>
          {user && <div>User: {user.name}</div>}
        </>
      );
    };

    render(
      <AuthProvider>
        <LoginTestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });
});
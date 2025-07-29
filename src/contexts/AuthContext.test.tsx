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
    getCurrentUser: jest.fn(),
    getAccessToken: jest.fn(),
    isAuthenticated: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
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
  const { user, isLoading, error, logout } = useAuth();
  
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
    mockAuthService.getCurrentUser.mockReturnValue(null);
    mockAuthService.getAccessToken.mockReturnValue(null);
    mockAuthService.isAuthenticated.mockReturnValue(false);
    
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
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
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

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.');
    });
  });

  it('should handle logout', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    mockAuthService.getCurrentUser.mockReturnValue(mockUser);
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.logout.mockImplementation(() => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
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
    expect(mockToast.success).toHaveBeenCalledWith('Logged out successfully');
  });

  it('should render not authenticated when no user', async () => {
    mockAuthService.getCurrentUser.mockReturnValue(null);
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
      email: 'test@example.com',
      name: 'Test User',
      workspaceId: 'workspace123',
    };

    const { useMutation } = require('convex/react');
    const mockGetOrCreateByEmail = jest.fn().mockResolvedValue(mockUser);
    useMutation.mockReturnValue(mockGetOrCreateByEmail);

    mockAuthService.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-token',
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
      expect(mockToast.success).toHaveBeenCalledWith('Login successful!');
    });
  });
});
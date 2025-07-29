import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import authService from '../services/auth.service';
import { AuthUser, AuthState, LoginCredentials, SignupCredentials, AuthError } from '../types/auth.types';
import { useWorkspace } from './WorkspaceContext';

// Import api with require to avoid TypeScript depth issues
const { api } = require('../convex/_generated/api');

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  getAccessToken: () => string | null;
  setCurrentUser: (user: AuthUser | null) => void; // For compatibility
  currentUser: AuthUser | null; // Alias for user
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { setCurrentWorkspace } = useWorkspace();
  const syncUser = useMutation(api.auth.syncUser);
  const joinWorkspaceViaInvitation = useMutation(api.auth.joinWorkspaceViaInvitation);
  
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });
  
  const [auth0Id, setAuth0Id] = useState<string | null>(null);
  const convexUser = useQuery(api.auth.getCurrentUser, auth0Id ? { auth0Id } : "skip");
  const userWorkspace = useQuery(api.auth.getUserWorkspace, 
    convexUser ? { userId: convexUser._id } : "skip"
  );

  // Sync Convex user with Auth0 user
  useEffect(() => {
    if (convexUser && userWorkspace) {
      setAuthState(prev => ({
        ...prev,
        user: {
          id: convexUser._id,
          auth0Id: convexUser.auth0Id,
          email: convexUser.email,
          name: convexUser.name,
          avatar: convexUser.avatar,
          role: convexUser.role,
          workspaceId: convexUser.workspaceId
        }
      }));
      
      setCurrentWorkspace({
        id: userWorkspace._id,
        name: userWorkspace.name,
        plan: userWorkspace.plan || 'free'
      });
    }
  }, [convexUser, userWorkspace, setCurrentWorkspace]);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we have a valid session
        if (authService.isAuthenticated()) {
          const auth0User = await authService.getUserInfo();
          setAuth0Id(auth0User.auth0Id);
          
          // Try to sync with Convex
          try {
            await syncUser({
              auth0Id: auth0User.auth0Id,
              email: auth0User.email,
              name: auth0User.name || auth0User.email,
              picture: auth0User.picture,
              workspaceName: auth0User.workspaceName
            });
            
            // syncUser now always creates a workspace for new users
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              isLoading: false
            }));
          } catch (error: any) {
            console.error('Failed to sync user:', error);
            
            // Determine the type of error and provide appropriate message
            let errorMessage = 'Failed to create user account';
            let errorCode = 'SYNC_FAILED';
            
            if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
              errorMessage = 'Network error. Please check your connection and try again.';
              errorCode = 'NETWORK_ERROR';
            } else if (error.message?.includes('workspace')) {
              errorMessage = 'Failed to create workspace. Please try again.';
              errorCode = 'WORKSPACE_ERROR';
            }
            
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: { 
                error: errorCode, 
                code: errorCode, 
                message: errorMessage,
                errorDescription: errorMessage 
              }
            });
          }
        } else {
          // Try to parse hash if coming from Auth0 redirect
          try {
            await authService.parseHashFromUrl();
            const auth0User = await authService.getUserInfo();
            setAuth0Id(auth0User.auth0Id);
            
            // Check for invitation code in URL
            const urlParams = new URLSearchParams(window.location.search);
            const inviteCode = urlParams.get('invite');
            
            if (inviteCode) {
              // Join via invitation
              await joinWorkspaceViaInvitation({
                auth0Id: auth0User.auth0Id,
                email: auth0User.email,
                name: auth0User.name || auth0User.email,
                inviteCode,
                picture: auth0User.picture
              });
              
              setAuthState(prev => ({
                ...prev,
                isAuthenticated: true,
                isLoading: false
              }));
            } else {
              // Try normal sync
              await syncUser({
                auth0Id: auth0User.auth0Id,
                email: auth0User.email,
                name: auth0User.name || auth0User.email,
                picture: auth0User.picture,
                workspaceName: auth0User.workspaceName
              });
              
              // syncUser now always creates a workspace for new users
              setAuthState(prev => ({
                ...prev,
                isAuthenticated: true,
                isLoading: false
              }));
            }
          } catch (error: any) {
            // No valid session or error during authentication
            console.error('Auth initialization error:', error);
            
            // Only set error state if there's an actual error (not just no session)
            const hasError = error && error.error !== 'login_required';
            
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: hasError ? error : null
            });
          }
        }
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: error as AuthError
        });
      }
    };

    initAuth();
  }, [syncUser, joinWorkspaceViaInvitation]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.login(credentials);
      const auth0User = await authService.getUserInfo();
      setAuth0Id(auth0User.auth0Id);
      
      // Check for invitation code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const inviteCode = urlParams.get('invite');
      
      if (inviteCode) {
        // Join via invitation
        await joinWorkspaceViaInvitation({
          auth0Id: auth0User.auth0Id,
          email: auth0User.email,
          name: auth0User.name || auth0User.email,
          inviteCode,
          picture: auth0User.picture
        });
      } else {
        // Try normal sync
        await syncUser({
          auth0Id: auth0User.auth0Id,
          email: auth0User.email,
          name: auth0User.name || auth0User.email,
          picture: auth0User.picture,
          workspaceName: auth0User.workspaceName
        });
      }
      
      // syncUser now always creates a workspace for new users
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Enhance error message based on error type
      let enhancedError = error;
      
      if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
        enhancedError = {
          ...error,
          errorDescription: 'Network error. Please check your connection and try again.'
        };
      }
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: enhancedError as AuthError
      });
      throw enhancedError;
    }
  }, [syncUser, joinWorkspaceViaInvitation]);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // First create the user in Auth0
      await authService.signup(credentials);
      
      // Then log them in which will create workspace
      await login({
        email: credentials.email,
        password: credentials.password
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error as AuthError
      }));
      throw error;
    }
  }, [login]);

  const logout = useCallback(() => {
    authService.logout();
    setAuth0Id(null);
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
    setCurrentWorkspace(null);
  }, [setCurrentWorkspace]);

  const refreshAuth = useCallback(async () => {
    try {
      await authService.renewTokens();
      const user = await authService.getUserInfo();
      setAuthState(prev => ({
        ...prev,
        user
      }));
    } catch (error) {
      // If refresh fails, log out
      logout();
    }
  }, [logout]);

  const getAccessToken = useCallback(() => {
    return authService.getAccessToken();
  }, []);

  // For compatibility with existing code
  const setCurrentUser = useCallback((user: AuthUser | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
  }, []);

  // Refresh tokens before they expire
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      refreshAuth();
    }, 3600000); // Refresh every hour

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshAuth]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      currentUser: authState.user, // Alias for compatibility
      login,
      signup,
      logout,
      refreshAuth,
      getAccessToken,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
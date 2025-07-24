import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Calendar } from './pages/Calendar';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { Landing } from './pages/Landing';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement; allowedRoles?: ('Admin' | 'Manager')[] }> = ({ element, allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && currentUser && currentUser.role && !allowedRoles.includes(currentUser.role)) {
    // Redirect to dashboard if not authorized
    return <Navigate to="/" replace />;
  }
  
  return element;
};

// Auth route component (redirects to dashboard if already logged in)
const AuthRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

// Auth callback component for handling Auth0 redirects
const AuthCallback: React.FC = () => {
  const { isLoading, isAuthenticated, error } = useAuth();
  
  React.useEffect(() => {
    // The AuthContext will handle parsing the hash automatically
    if (!isLoading && isAuthenticated) {
      // Redirect to dashboard after successful auth
      window.location.href = '/dashboard';
    }
  }, [isLoading, isAuthenticated]);
  
  if (error) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute element={<LoginForm />} />} />
      <Route path="/signup" element={<AuthRoute element={<SignupForm />} />} />
      <Route path="/callback" element={<AuthCallback />} />
      
      {/* Protected App Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
      } />
      <Route path="/calendar" element={
        <ProtectedRoute element={
          <Layout>
            <Calendar />
          </Layout>
        } />
      } />
      <Route path="/users" element={
        <ProtectedRoute element={
          <Layout>
            <Users />
          </Layout>
        } allowedRoles={['Admin']} />
      } />
      <Route path="/settings" element={
        <ProtectedRoute element={
          <Layout>
            <Settings />
          </Layout>
        } allowedRoles={['Admin']} />
      } />
    </Routes>
  );
}

function App() {
  return (
    <WorkspaceProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </WorkspaceProvider>
  );
}

export default App;
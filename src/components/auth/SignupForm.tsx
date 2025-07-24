import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Building2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

type SignupStep = 'email' | 'workspace' | 'complete';

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, error: authError } = useAuth();
  const { setCurrentWorkspace } = useWorkspace();
  
  const [step, setStep] = useState<SignupStep>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Check if there's an invitation code
  const inviteCode = searchParams.get('invite');
  const isInvitation = !!inviteCode;

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(pass)) return 'Password must contain at least one number';
    return null;
  };

  const getPasswordStrength = (pass: string): { strength: number; label: string; color: string } => {
    if (!pass) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    
    // Length check
    if (pass.length >= 8) strength += 25;
    if (pass.length >= 12) strength += 10;
    
    // Character variety
    if (/[a-z]/.test(pass)) strength += 15;
    if (/[A-Z]/.test(pass)) strength += 15;
    if (/[0-9]/.test(pass)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 20; // Special characters
    
    // Determine label and color
    if (strength < 30) {
      return { strength, label: 'Weak', color: 'text-red-500' };
    } else if (strength < 50) {
      return { strength, label: 'Fair', color: 'text-orange-500' };
    } else if (strength < 70) {
      return { strength, label: 'Good', color: 'text-yellow-500' };
    } else {
      return { strength, label: 'Strong', color: 'text-green-500' };
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (isInvitation) {
      // If joining via invitation, skip workspace creation
      setIsLoading(true);
      try {
        // TODO: Validate invitation code and join workspace
        await signup({ email, password, name });
        navigate('/');
      } catch (err: any) {
        setError(err.errorDescription || 'Failed to join workspace. Please check your invitation.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Proceed to workspace creation
      setStep('workspace');
    }
  };

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!workspaceName) {
      setError('Please enter a workspace name');
      return;
    }

    setIsLoading(true);
    try {
      await signup({ email, password, name, workspaceName });
      setCurrentWorkspace({
        id: 'workspace-' + Date.now(),
        name: workspaceName,
        plan: 'free'
      });
      setStep('complete');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.errorDescription || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isInvitation ? 'Join Workspace' : 'Create Your Account'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isInvitation 
              ? 'You\'ve been invited to join a workspace'
              : 'Start your productivity journey'}
          </p>
        </div>

        {/* Progress indicator */}
        {!isInvitation && (
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'email' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${
              step !== 'email' ? 'bg-primary' : 'bg-border'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'workspace' ? 'bg-primary text-primary-foreground' 
              : step === 'complete' ? 'bg-primary/20 text-primary' 
              : 'bg-border text-muted-foreground'
            }`}>
              2
            </div>
            <div className={`w-24 h-1 ${
              step === 'complete' ? 'bg-primary' : 'bg-border'
            }`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step === 'complete' ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              {password && (
                <>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Password strength:</span>
                      <span className={`text-xs font-medium ${getPasswordStrength(password).color}`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          getPasswordStrength(password).strength < 30 ? 'bg-red-500' :
                          getPasswordStrength(password).strength < 50 ? 'bg-orange-500' :
                          getPasswordStrength(password).strength < 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getPasswordStrength(password).strength}%` }}
                      />
                    </div>
                  </div>
                  {validatePassword(password) && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validatePassword(password)}
                    </p>
                  )}
                </>
              )}
              {!password && (
                <p className="text-xs text-muted-foreground mt-1">
                  At least 8 characters with uppercase, lowercase, and numbers
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
              {confirmPassword && password && confirmPassword !== password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && password && confirmPassword === password && (
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </p>
              )}
            </div>

            {(error || authError) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error || authError?.errorDescription}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 'workspace' && (
          <form onSubmit={handleWorkspaceSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Workspace Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Acme Corp"
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be the name of your team's workspace
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-2">
                What you'll get:
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Admin access to manage your workspace
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Invite unlimited team members
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Full access to tasks and calendar
                </li>
              </ul>
            </div>

            {(error || authError) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error || authError?.errorDescription}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating workspace...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Workspace Created!</h2>
            <p className="text-muted-foreground">
              Setting up your workspace. Redirecting...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
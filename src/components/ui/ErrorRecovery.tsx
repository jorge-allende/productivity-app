import React, { useState } from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, Bug } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

interface ErrorRecoveryProps {
  title: string;
  message: string;
  error?: Error;
  actions?: RecoveryAction[];
  showDetails?: boolean;
  className?: string;
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  title,
  message,
  error,
  actions = [],
  showDetails = false,
  className
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [loadingActions, setLoadingActions] = useState<Set<number>>(new Set());

  const handleAction = async (action: RecoveryAction, index: number) => {
    setLoadingActions(prev => new Set(prev).add(index));
    
    try {
      await action.action();
    } catch (err) {
      console.error('Recovery action failed:', err);
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const defaultActions: RecoveryAction[] = [
    {
      label: 'Refresh Page',
      action: () => window.location.reload(),
      variant: 'primary'
    },
    {
      label: 'Go Back',
      action: () => window.history.back(),
      variant: 'secondary'
    }
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={cn(
      "flex items-center justify-center p-4 bg-background min-h-[200px]",
      className
    )}>
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-6 border">
        <div className="flex items-center gap-3 text-destructive mb-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <p className="text-muted-foreground mb-6">
          {message}
        </p>

        {showDetails && error && (
          <div className="mb-6">
            <button
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bug className="w-4 h-4" />
              {showErrorDetails ? 'Hide' : 'Show'} error details
            </button>
            
            {showErrorDetails && (
              <details className="mt-2" open>
                <summary className="sr-only">Error details</summary>
                <pre className="text-xs bg-muted p-3 rounded mt-2 overflow-auto max-h-32">
                  {error.toString()}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {allActions.map((action, index) => {
            const isLoading = loadingActions.has(index);
            const isPrimary = action.variant !== 'secondary';
            
            return (
              <button
                key={index}
                onClick={() => handleAction(action, index)}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  isPrimary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : action.label === 'Go Back' ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : action.label === 'Refresh Page' ? (
                  <RefreshCw className="w-4 h-4" />
                ) : null}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
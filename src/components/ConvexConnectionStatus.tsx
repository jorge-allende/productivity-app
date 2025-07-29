import React, { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { WifiOff, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export const ConvexConnectionStatus: React.FC = () => {
  const convex = useConvex();
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if Convex URL is configured
    if (!process.env.REACT_APP_CONVEX_URL) {
      setError('Convex URL not configured');
      setIsConnected(false);
      setShowStatus(true);
      return;
    }
    
    // Monitor connection state
    let checkInterval: NodeJS.Timeout;
    
    const checkConnection = async () => {
      try {
        // Try to ping the Convex backend
        const client = convex as any;
        if (client._state?.isWebSocketConnected === false) {
          setIsConnected(false);
          setShowStatus(true);
        } else {
          setIsConnected(true);
          setError(null);
          // Hide status after 3 seconds when connected
          if (showStatus) {
            setTimeout(() => setShowStatus(false), 3000);
          }
        }
      } catch (err) {
        console.error('Connection check error:', err);
        setIsConnected(false);
        setError('Connection error');
        setShowStatus(true);
      }
    };
    
    // Check immediately
    checkConnection();
    
    // Check periodically
    checkInterval = setInterval(checkConnection, 5000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [convex, showStatus]);
  
  // Always show if there's an error or disconnected
  if (!isConnected || error) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all",
          "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
        )}>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            {error || 'Connection lost'}
          </span>
        </div>
      </div>
    );
  }
  
  // Show connected status briefly
  if (showStatus && isConnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all",
          "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400"
        )}>
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Connected</span>
        </div>
      </div>
    );
  }
  
  return null;
};

// Hook to check Convex configuration
export const useConvexStatus = () => {
  const [status, setStatus] = useState<{
    isConfigured: boolean;
    isConnected: boolean;
    error: string | null;
  }>({
    isConfigured: true,
    isConnected: true,
    error: null
  });
  
  useEffect(() => {
    // Check environment variables
    const convexUrl = process.env.REACT_APP_CONVEX_URL;
    
    if (!convexUrl) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        error: 'Convex URL not configured. Please check your .env.local file.'
      });
      return;
    }
    
    // Validate URL format
    try {
      new URL(convexUrl);
    } catch (err) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        error: 'Invalid Convex URL format'
      });
      return;
    }
    
    setStatus({
      isConfigured: true,
      isConnected: true,
      error: null
    });
  }, []);
  
  return status;
};
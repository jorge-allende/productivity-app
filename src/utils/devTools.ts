// Development tools and utilities
// Only active when REACT_APP_DEV_MODE is true

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isDevMode = process.env.REACT_APP_DEV_MODE === 'true';

// Device breakpoints for testing
export const deviceSizes = {
  mobile: 375,
  mobileL: 425,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920
};

// Add development helpers to window object
if (isDevMode && typeof window !== 'undefined') {
  (window as any).devTools = {
    // Quick theme toggle
    toggleTheme: () => {
      document.documentElement.classList.toggle('dark');
    },
    
    // Simulate different viewport sizes
    setViewport: (device: keyof typeof deviceSizes) => {
      const size = deviceSizes[device];
      window.resizeTo(size, 800);
      console.log(`Viewport set to ${device} (${size}px)`);
    },
    
    // Show current breakpoint
    getCurrentBreakpoint: () => {
      const width = window.innerWidth;
      if (width < deviceSizes.mobile) return 'xs';
      if (width < deviceSizes.tablet) return 'sm';
      if (width < deviceSizes.laptop) return 'md';
      if (width < deviceSizes.desktop) return 'lg';
      if (width < deviceSizes.wide) return 'xl';
      return '2xl';
    },
    
    // Performance metrics
    measurePerformance: () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        'Load Complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        'Total Load Time': Math.round(perfData.loadEventEnd - perfData.fetchStart),
        'Time to Interactive': Math.round(perfData.domInteractive - perfData.fetchStart)
      };
    },
    
    // Clear all local storage (useful for testing)
    clearStorage: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('All storage cleared');
      window.location.reload();
    },
    
    // Log all Convex queries
    logConvexQueries: (enabled: boolean = true) => {
      localStorage.setItem('convex-debug', enabled ? 'true' : 'false');
      console.log(`Convex query logging ${enabled ? 'enabled' : 'disabled'}`);
    }
  };
  
  console.log(`
🚀 Development Tools Loaded!
Available commands:
- devTools.toggleTheme() - Toggle dark/light theme
- devTools.setViewport('mobile' | 'tablet' | 'desktop') - Simulate device
- devTools.getCurrentBreakpoint() - Show current responsive breakpoint
- devTools.measurePerformance() - Show performance metrics
- devTools.clearStorage() - Clear all local storage
- devTools.logConvexQueries() - Toggle Convex query logging
  `);
}

// Visual grid overlay for design alignment
export const addGridOverlay = () => {
  if (!isDevMode) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'grid-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 9999;
    background-image: 
      repeating-linear-gradient(0deg, rgba(255,0,0,0.1) 0px, transparent 1px, transparent 8px, rgba(255,0,0,0.1) 8px),
      repeating-linear-gradient(90deg, rgba(255,0,0,0.1) 0px, transparent 1px, transparent 8px, rgba(255,0,0,0.1) 8px);
    display: none;
  `;
  document.body.appendChild(overlay);
  
  // Toggle with Ctrl+G
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'g') {
      overlay.style.display = overlay.style.display === 'none' ? 'block' : 'none';
    }
  });
};

// Add responsive indicators
export const addResponsiveIndicator = () => {
  if (!isDevMode) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'responsive-indicator';
  indicator.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 9999;
    font-family: monospace;
  `;
  
  const updateIndicator = () => {
    const width = window.innerWidth;
    const breakpoint = (window as any).devTools.getCurrentBreakpoint();
    indicator.textContent = `${breakpoint} • ${width}px`;
  };
  
  updateIndicator();
  window.addEventListener('resize', updateIndicator);
  document.body.appendChild(indicator);
};

// Initialize dev tools
if (isDevMode && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    addGridOverlay();
    addResponsiveIndicator();
  });
}

// React hook for dev tools
import { useState, useEffect } from 'react';

export const useDevTools = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showOrderDebugger, setShowOrderDebugger] = useState(false);

  useEffect(() => {
    // Only enable in development
    if (!isDevMode) {
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      // Toggle debug info with Ctrl/Cmd + Shift + D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDebugInfo(prev => !prev);
        console.log('Debug info toggled');
      }
      // Toggle order debugger with Ctrl/Cmd + Shift + O
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        setShowOrderDebugger(prev => !prev);
        console.log('Order debugger toggled');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { showDebugInfo, showOrderDebugger };
};
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from '../store/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset the store state
    useThemeStore.setState({ theme: 'light' });
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.theme).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    const { result } = renderHook(() => useThemeStore());
    
    // Set to dark first
    act(() => {
      result.current.toggleTheme();
    });
    
    // Toggle back to light
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('should set theme directly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
  });

  it('should persist theme preference in localStorage', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.toggleTheme();
    });

    // Check localStorage
    const storedState = localStorage.getItem('theme-storage');
    expect(storedState).toBeTruthy();
    
    const parsedState = JSON.parse(storedState!);
    expect(parsedState.state.theme).toBe('dark');
  });

  it('should load theme preference from localStorage on initialization', () => {
    // Set dark theme in localStorage
    localStorage.setItem('theme-storage', JSON.stringify({
      state: { theme: 'dark' },
      version: 0
    }));

    // Create a new hook instance
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.theme).toBe('dark');
  });

  it('should handle multiple rapid toggles correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.toggleTheme(); // to dark
      result.current.toggleTheme(); // to light
      result.current.toggleTheme(); // to dark
    });

    expect(result.current.theme).toBe('dark');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // Set invalid data in localStorage
    localStorage.setItem('theme-storage', 'invalid-json');

    // Should not throw and should use default
    const { result } = renderHook(() => useThemeStore());
    
    expect(result.current.theme).toBe('light');
  });
});
// Safe localStorage utility functions with error handling

interface StorageOptions {
  fallback?: any;
  validate?: (value: any) => boolean;
}

export const safeLocalStorage = {
  getItem<T>(key: string, options?: StorageOptions): T | null {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        return options?.fallback ?? null;
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return options?.fallback ?? null;
      }

      try {
        const parsed = JSON.parse(item);
        
        // Validate if provided
        if (options?.validate && !options.validate(parsed)) {
          console.warn(`Invalid data for key ${key}, using fallback`);
          return options?.fallback ?? null;
        }
        
        return parsed as T;
      } catch (parseError) {
        // If it's not JSON, return as string
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return options?.fallback ?? null;
    }
  },

  setItem(key: string, value: any): boolean {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        return false;
      }

      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        // Optionally clear old data here
      }
      
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        return false;
      }

      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('localStorage is not available');
        return false;
      }

      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Migration utility for updating stored data structures
  migrate<T>(key: string, migrationFn: (oldData: any) => T): T | null {
    const existing = this.getItem<any>(key);
    if (existing === null) return null;

    try {
      const migrated = migrationFn(existing);
      this.setItem(key, migrated);
      return migrated;
    } catch (error) {
      console.error(`Error migrating localStorage key "${key}":`, error);
      return null;
    }
  }
};
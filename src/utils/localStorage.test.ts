import { safeLocalStorage } from './localStorage';

describe('safeLocalStorage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('retrieves stored string values', () => {
      localStorage.setItem('test-key', 'test-value');
      
      const result = safeLocalStorage.getItem<string>('test-key');
      
      expect(result).toBe('test-value');
    });

    it('retrieves and parses JSON values', () => {
      const testObject = { name: 'test', value: 123 };
      localStorage.setItem('test-key', JSON.stringify(testObject));
      
      const result = safeLocalStorage.getItem<typeof testObject>('test-key');
      
      expect(result).toEqual(testObject);
    });

    it('returns null for non-existent keys', () => {
      const result = safeLocalStorage.getItem('non-existent');
      
      expect(result).toBeNull();
    });

    it('returns fallback value when key does not exist', () => {
      const fallback = { default: true };
      
      const result = safeLocalStorage.getItem('non-existent', { fallback });
      
      expect(result).toEqual(fallback);
    });

    it('validates data and returns fallback on validation failure', () => {
      localStorage.setItem('test-key', JSON.stringify({ invalid: true }));
      
      const result = safeLocalStorage.getItem('test-key', {
        fallback: { valid: true },
        validate: (value) => value.valid === true
      });
      
      expect(result).toEqual({ valid: true });
    });

    it('handles localStorage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Mock localStorage.getItem to throw an error
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const result = safeLocalStorage.getItem('test-key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error reading from localStorage'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('returns string as-is when JSON parsing fails', () => {
      // Restore original localStorage.getItem for this test
      jest.restoreAllMocks();
      localStorage.setItem('test-key', 'not-json-string');
      
      const result = safeLocalStorage.getItem<string>('test-key');
      
      expect(result).toBe('not-json-string');
    });
  });

  describe('setItem', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    
    it('stores string values', () => {
      const success = safeLocalStorage.setItem('test-key', 'test-value');
      
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBe('test-value');
    });

    it('stores JSON values', () => {
      const testObject = { name: 'test', value: 123 };
      
      const success = safeLocalStorage.setItem('test-key', testObject);
      
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify(testObject));
    });

    it('handles quota exceeded errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('QuotaExceededError');
      Object.defineProperty(error, 'name', {
        value: 'QuotaExceededError',
        writable: false
      });
      
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw error;
      });
      
      const success = safeLocalStorage.setItem('test-key', 'value');
      
      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error writing to localStorage'),
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith('localStorage quota exceeded');
      
      consoleSpy.mockRestore();
    });

    it('handles general storage errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const success = safeLocalStorage.setItem('test-key', 'value');
      
      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error writing to localStorage'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    
    it('removes stored items', () => {
      localStorage.setItem('test-key', 'test-value');
      
      const success = safeLocalStorage.removeItem('test-key');
      
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('handles removal errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const success = safeLocalStorage.removeItem('test-key');
      
      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error removing localStorage key'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    
    it('clears all stored items', () => {
      localStorage.setItem('key1', 'value1');
      localStorage.setItem('key2', 'value2');
      
      const success = safeLocalStorage.clear();
      
      expect(success).toBe(true);
      expect(localStorage.length).toBe(0);
    });

    it('handles clear errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const success = safeLocalStorage.clear();
      
      expect(success).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing localStorage:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('migrate', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });
    
    it('migrates existing data successfully', () => {
      const oldData = { version: 1, data: 'old' };
      localStorage.setItem('test-key', JSON.stringify(oldData));
      
      const migrated = safeLocalStorage.migrate('test-key', (old) => ({
        version: 2,
        data: old.data,
        migrated: true
      }));
      
      expect(migrated).toEqual({
        version: 2,
        data: 'old',
        migrated: true
      });
      
      // Check that it was saved
      const stored = JSON.parse(localStorage.getItem('test-key')!);
      expect(stored.version).toBe(2);
    });

    it('returns null when key does not exist', () => {
      jest.restoreAllMocks();
      const result = safeLocalStorage.migrate('non-existent', (old) => old);
      
      expect(result).toBeNull();
    });

    it('handles migration errors gracefully', () => {
      jest.restoreAllMocks();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      localStorage.setItem('test-key', JSON.stringify({ data: 'test' }));
      
      const result = safeLocalStorage.migrate('test-key', () => {
        throw new Error('Migration error');
      });
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error migrating localStorage key'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('handles undefined window gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;
      
      const result = safeLocalStorage.getItem('test-key');
      
      expect(result).toBeNull();
      
      global.window = originalWindow;
    });

    it('handles localStorage being unavailable', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const originalLocalStorage = global.localStorage;
      // @ts-ignore
      delete global.localStorage;
      
      const result = safeLocalStorage.getItem('test-key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('localStorage is not available');
      
      global.localStorage = originalLocalStorage;
      consoleSpy.mockRestore();
    });
  });
});
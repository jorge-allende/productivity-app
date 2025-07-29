import { toast } from 'react-hot-toast';

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, userMessage?: string): void {
    console.error('Error occurred:', error);
    
    let message = userMessage || 'An unexpected error occurred';
    
    if (error instanceof Error) {
      if (error.message.includes('Not authenticated')) {
        message = 'Please log in to continue';
      } else if (error.message.includes('Access denied')) {
        message = 'You do not have permission to perform this action';
      } else if (error.message.includes('Network')) {
        message = 'Network error. Please check your connection';
      } else if (error.message) {
        message = error.message;
      }
    }
    
    toast.error(message);
  }
  
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      ErrorHandler.handle(error, errorMessage);
      return null;
    }
  }
  
  static createAsyncHandler<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    errorMessage?: string
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        ErrorHandler.handle(error, errorMessage);
        throw error;
      }
    }) as T;
  }
}
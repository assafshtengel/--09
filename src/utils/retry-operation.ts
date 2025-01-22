type RetryConfig = {
  maxAttempts?: number;
  delayMs?: number;
  onError?: (error: any, attempt: number) => void;
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> => {
  const { 
    maxAttempts = 3, 
    delayMs = 1000,
    onError 
  } = config;

  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Operation failed (attempt ${attempt}/${maxAttempts}):`, error);
      
      if (onError) {
        onError(error, attempt);
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};
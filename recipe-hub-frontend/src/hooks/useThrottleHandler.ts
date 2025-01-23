// src/hooks/useThrottleHandler.ts

import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { AxiosError } from 'axios';

/**
 * Custom hook to handle API throttling errors (429 status).
 * This hook provides a consistent way to handle rate limiting across the application
 * by redirecting users to a friendly error page when they've made too many requests.
 */
export const useThrottleHandler = () => {
  // Get the navigation function from React Router
  const navigate = useNavigate();

  // Use useCallback to memoize our error handler function
  const handleError = useCallback((error: unknown) => {
    // First, check if we have an error object
    if (error instanceof Error) {
      // Try to cast it to an AxiosError to access response status
      const axiosError = error as AxiosError;
      
      // Check specifically for 429 (Too Many Requests) status
      if (axiosError.response?.status === 429) {
        // Redirect to our friendly throttle error page
        // Using replace: true means this won't add to the browser history
        navigate('/throttle-error', { replace: true });
        return true; // Indicate that we handled this error
      }
    }
    return false; // Indicate that this wasn't a throttle error
  }, [navigate]);

  // Return our handler function
  return handleError;
};
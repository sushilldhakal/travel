import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, isValidToken } from '@/util/authUtils';
import useTokenStore from '@/store/store';

interface UseTokenExpirationOptions {
  checkInterval?: number; // in milliseconds
  redirectTo?: string;
  onTokenExpired?: () => void;
}

export const useTokenExpiration = (options: UseTokenExpirationOptions = {}) => {
  const {
    checkInterval = 300000, // 30 seconds default
    redirectTo = '/', // home page default
    onTokenExpired
  } = options;

  const navigate = useNavigate();
  const { setToken } = useTokenStore((state) => state);

  const clearTokenData = useCallback(() => {
    setToken('');
    localStorage.removeItem('token-store');
    localStorage.removeItem('token');
  }, [setToken]);

  const handleTokenExpiration = useCallback(() => {
    console.log('Token expired, clearing data and redirecting to:', redirectTo);
    clearTokenData();
    
    if (onTokenExpired) {
      onTokenExpired();
    }
    
    navigate(redirectTo, { 
      replace: true, 
      state: { reason: 'token_expired', message: 'Your session has expired. Please log in again.' }
    });
  }, [clearTokenData, navigate, redirectTo, onTokenExpired]);

  const checkTokenValidity = useCallback(() => {
    const token = getAccessToken();
    
    if (!token || !isValidToken(token)) {
      handleTokenExpiration();
      return false;
    }
    
    return true;
  }, [handleTokenExpiration]);

  useEffect(() => {
    // Check immediately on mount
    if (!checkTokenValidity()) {
      return;
    }

    // Set up periodic checks
    const interval = setInterval(() => {
      checkTokenValidity();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkTokenValidity, checkInterval]);

  return {
    checkTokenValidity,
    clearTokenData,
    handleTokenExpiration
  };
};

export default useTokenExpiration;

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

interface SecurityState {
  attempts: number;
  lastAttempt: number;
  isLocked: boolean;
  lockoutEndTime: number | null;
}

interface AuthSecurityConfig {
  maxAttempts: number;
  lockoutDuration: number; // in minutes
  sessionTimeout: number; // in minutes
  requireEmailVerification: boolean;
  enable2FA: boolean;
}

const defaultConfig: AuthSecurityConfig = {
  maxAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 60,
  requireEmailVerification: true,
  enable2FA: false,
};

// Rate limiting storage key
const RATE_LIMIT_KEY = 'auth_security_state';

export const useAuthSecurity = (config: Partial<AuthSecurityConfig> = {}) => {
  const fullConfig = { ...defaultConfig, ...config };
  const [securityState, setSecurityState] = useState<SecurityState>({
    attempts: 0,
    lastAttempt: 0,
    isLocked: false,
    lockoutEndTime: null,
  });

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL || '',
    import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  );

  // Load security state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();

        // Check if lockout has expired
        if (parsed.lockoutEndTime && now > parsed.lockoutEndTime) {
          // Reset state if lockout expired
          const resetState = {
            attempts: 0,
            lastAttempt: 0,
            isLocked: false,
            lockoutEndTime: null,
          };
          setSecurityState(resetState);
          localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(resetState));
        } else {
          setSecurityState(parsed);
        }
      } catch (error) {
        console.error('Error parsing security state:', error);
      }
    }
  }, []);

  // Update localStorage when state changes
  useEffect(() => {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(securityState));
  }, [securityState]);

  const recordFailedAttempt = useCallback(() => {
    const now = Date.now();
    const newAttempts = securityState.attempts + 1;

    if (newAttempts >= fullConfig.maxAttempts) {
      const lockoutEndTime = now + (fullConfig.lockoutDuration * 60 * 1000);
      setSecurityState({
        attempts: newAttempts,
        lastAttempt: now,
        isLocked: true,
        lockoutEndTime,
      });
      return {
        isLocked: true,
        timeRemaining: fullConfig.lockoutDuration * 60,
        attemptsRemaining: 0,
      };
    }

    setSecurityState({
      ...securityState,
      attempts: newAttempts,
      lastAttempt: now,
    });

    return {
      isLocked: false,
      timeRemaining: 0,
      attemptsRemaining: fullConfig.maxAttempts - newAttempts,
    };
  }, [securityState, fullConfig.maxAttempts, fullConfig.lockoutDuration]);

  const recordSuccessfulAttempt = useCallback(() => {
    setSecurityState({
      attempts: 0,
      lastAttempt: 0,
      isLocked: false,
      lockoutEndTime: null,
    });
  }, []);

  const checkSessionValidity = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Session check error:', error);
        return { isValid: false, error: error.message };
      }

      if (!session) {
        return { isValid: false, error: 'No active session' };
      }

      // Check if session has expired
      const now = Date.now() / 1000;
      const sessionAge = now - (session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).getTime() / 1000 : 0);

      if (sessionAge > fullConfig.sessionTimeout * 60) {
        await supabase.auth.signOut();
        return { isValid: false, error: 'Session expired' };
      }

      // Check email verification if required
      if (fullConfig.requireEmailVerification && !session.user.email_confirmed_at) {
        return { isValid: false, error: 'Email verification required' };
      }

      return { isValid: true, session };
    } catch (error: any) {
      return { isValid: false, error: error.message };
    }
  }, [fullConfig.sessionTimeout, fullConfig.requireEmailVerification]);

  const validatePasswordStrength = useCallback((password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    return {
      isValid: score >= 4, // Require at least 4 out of 5 criteria
      strength,
      requirements,
      score,
    };
  }, []);

  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Check if account is locked
    if (securityState.isLocked) {
      const timeRemaining = securityState.lockoutEndTime ?
        Math.max(0, Math.ceil((securityState.lockoutEndTime - Date.now()) / 60000)) : 0;

      return {
        success: false,
        error: `Account temporarily locked. Try again in ${timeRemaining} minutes.`,
        isLocked: true,
        timeRemaining,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const attemptResult = recordFailedAttempt();
        return {
          success: false,
          error: error.message,
          ...attemptResult,
        };
      }

      recordSuccessfulAttempt();
      return {
        success: true,
        data,
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      const attemptResult = recordFailedAttempt();
      return {
        success: false,
        error: error.message,
        ...attemptResult,
      };
    }
  }, [securityState, recordFailedAttempt, recordSuccessfulAttempt]);

  const initiatePasswordReset = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, session: data.session };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }, []);

  // Auto-refresh session before expiry
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const setupAutoRefresh = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Refresh 5 minutes before expiry
        const refreshTime = (fullConfig.sessionTimeout - 5) * 60 * 1000;
        intervalId = setInterval(() => {
          refreshSession();
        }, refreshTime);
      }
    };

    setupAutoRefresh();

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fullConfig.sessionTimeout, refreshSession]);

  const getLockoutTimeRemaining = useCallback(() => {
    if (!securityState.isLocked || !securityState.lockoutEndTime) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, Math.ceil((securityState.lockoutEndTime - now) / 60000));
  }, [securityState]);

  return {
    // State
    isLocked: securityState.isLocked,
    attemptsRemaining: Math.max(0, fullConfig.maxAttempts - securityState.attempts),
    lockoutTimeRemaining: getLockoutTimeRemaining(),

    // Methods
    secureSignIn,
    validatePasswordStrength,
    checkSessionValidity,
    initiatePasswordReset,
    verifyEmail,
    refreshSession,
    recordFailedAttempt,
    recordSuccessfulAttempt,

    // Utils
    config: fullConfig,
  };
};
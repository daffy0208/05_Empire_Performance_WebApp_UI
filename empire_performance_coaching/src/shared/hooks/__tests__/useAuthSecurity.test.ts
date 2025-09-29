import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuthSecurity } from '../useAuthSecurity';

// Mock Supabase
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    verifyOtp: vi.fn(),
    refreshSession: vi.fn(),
  },
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useAuthSecurity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('initializes with default security state', () => {
    const { result } = renderHook(() => useAuthSecurity());

    expect(result.current.isLocked).toBe(false);
    expect(result.current.attemptsRemaining).toBe(5);
    expect(result.current.lockoutTimeRemaining).toBe(0);
  });

  it('accepts custom configuration', () => {
    const config = {
      maxAttempts: 3,
      lockoutDuration: 30,
    };

    const { result } = renderHook(() => useAuthSecurity(config));

    expect(result.current.attemptsRemaining).toBe(3);
    expect(result.current.config.maxAttempts).toBe(3);
    expect(result.current.config.lockoutDuration).toBe(30);
  });

  describe('secureSignIn', () => {
    it('handles successful sign in', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'token' };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const signInResult = await result.current.secureSignIn('test@example.com', 'password');

        expect(signInResult.success).toBe(true);
        expect(signInResult.user).toEqual(mockUser);
        expect(signInResult.session).toEqual(mockSession);
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('handles failed sign in attempts', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const signInResult = await result.current.secureSignIn('test@example.com', 'wrongpassword');

        expect(signInResult.success).toBe(false);
        expect(signInResult.error).toBe('Invalid credentials');
        expect(signInResult.attemptsRemaining).toBe(4);
      });
    });

    it('locks account after max attempts', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuthSecurity({ maxAttempts: 2 }));

      // First failed attempt
      await act(async () => {
        await result.current.secureSignIn('test@example.com', 'wrong1');
      });

      expect(result.current.attemptsRemaining).toBe(1);
      expect(result.current.isLocked).toBe(false);

      // Second failed attempt - should lock
      await act(async () => {
        const signInResult = await result.current.secureSignIn('test@example.com', 'wrong2');

        expect(signInResult.success).toBe(false);
        expect(signInResult.isLocked).toBe(true);
        expect(result.current.isLocked).toBe(true);
        expect(result.current.attemptsRemaining).toBe(0);
      });
    });

    it('prevents sign in when account is locked', async () => {
      // Pre-set locked state
      const lockedState = {
        attempts: 5,
        lastAttempt: Date.now(),
        isLocked: true,
        lockoutEndTime: Date.now() + (15 * 60 * 1000), // 15 minutes from now
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(lockedState));

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const signInResult = await result.current.secureSignIn('test@example.com', 'password');

        expect(signInResult.success).toBe(false);
        expect(signInResult.isLocked).toBe(true);
        expect(signInResult.error).toContain('Account temporarily locked');
      });

      // Should not call Supabase if locked
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('validatePasswordStrength', () => {
    it('validates weak passwords', () => {
      const { result } = renderHook(() => useAuthSecurity());

      const validation = result.current.validatePasswordStrength('weak');

      expect(validation.isValid).toBe(false);
      expect(validation.strength).toBe('weak');
      expect(validation.requirements.minLength).toBe(false);
      expect(validation.score).toBeLessThan(4);
    });

    it('validates strong passwords', () => {
      const { result } = renderHook(() => useAuthSecurity());

      const validation = result.current.validatePasswordStrength('StrongPass123!');

      expect(validation.isValid).toBe(true);
      expect(validation.strength).toBe('strong');
      expect(validation.requirements.minLength).toBe(true);
      expect(validation.requirements.hasUppercase).toBe(true);
      expect(validation.requirements.hasLowercase).toBe(true);
      expect(validation.requirements.hasNumbers).toBe(true);
      expect(validation.requirements.hasSpecialChars).toBe(true);
      expect(validation.score).toBe(5);
    });

    it('validates medium strength passwords', () => {
      const { result } = renderHook(() => useAuthSecurity());

      const validation = result.current.validatePasswordStrength('Password123');

      expect(validation.strength).toBe('medium');
      expect(validation.requirements.hasSpecialChars).toBe(false);
      expect(validation.score).toBe(4);
    });
  });

  describe('checkSessionValidity', () => {
    it('returns valid for active session', async () => {
      const mockSession = {
        user: {
          last_sign_in_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          email_confirmed_at: new Date().toISOString(),
        },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const validity = await result.current.checkSessionValidity();

        expect(validity.isValid).toBe(true);
        expect(validity.session).toEqual(mockSession);
      });
    });

    it('returns invalid for expired session', async () => {
      const mockSession = {
        user: {
          last_sign_in_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 minutes ago
          email_confirmed_at: new Date().toISOString(),
        },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthSecurity({ sessionTimeout: 60 }));

      await act(async () => {
        const validity = await result.current.checkSessionValidity();

        expect(validity.isValid).toBe(false);
        expect(validity.error).toBe('Session expired');
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('returns invalid for unverified email', async () => {
      const mockSession = {
        user: {
          last_sign_in_at: new Date().toISOString(),
          email_confirmed_at: null, // Not verified
        },
      };

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthSecurity({ requireEmailVerification: true }));

      await act(async () => {
        const validity = await result.current.checkSessionValidity();

        expect(validity.isValid).toBe(false);
        expect(validity.error).toBe('Email verification required');
      });
    });
  });

  describe('initiatePasswordReset', () => {
    it('successfully initiates password reset', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const resetResult = await result.current.initiatePasswordReset('test@example.com');

        expect(resetResult.success).toBe(true);
      });

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      );
    });

    it('handles password reset errors', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'User not found' },
      });

      const { result } = renderHook(() => useAuthSecurity());

      await act(async () => {
        const resetResult = await result.current.initiatePasswordReset('test@example.com');

        expect(resetResult.success).toBe(false);
        expect(resetResult.error).toBe('User not found');
      });
    });
  });

  describe('localStorage integration', () => {
    it('saves security state to localStorage', () => {
      renderHook(() => useAuthSecurity());

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'auth_security_state',
        expect.stringContaining('attempts')
      );
    });

    it('loads security state from localStorage', () => {
      const savedState = {
        attempts: 2,
        lastAttempt: Date.now(),
        isLocked: false,
        lockoutEndTime: null,
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

      const { result } = renderHook(() => useAuthSecurity());

      expect(result.current.attemptsRemaining).toBe(3); // 5 - 2 = 3
    });

    it('resets expired lockout state', () => {
      const expiredLockoutState = {
        attempts: 5,
        lastAttempt: Date.now() - 20 * 60 * 1000, // 20 minutes ago
        isLocked: true,
        lockoutEndTime: Date.now() - 5 * 60 * 1000, // Expired 5 minutes ago
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(expiredLockoutState));

      const { result } = renderHook(() => useAuthSecurity());

      expect(result.current.isLocked).toBe(false);
      expect(result.current.attemptsRemaining).toBe(5);
    });
  });
});
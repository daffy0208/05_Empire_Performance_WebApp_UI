import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';
import { createMockUser, createMockUserProfile } from '../../utils/test-utils';

// Mock the supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}));

const renderAuthHook = () => {
  return renderHook(() => useAuth(), {
    wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
  });
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within AuthProvider');
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderAuthHook();

      expect(result.current).toEqual({
        user: null,
        userProfile: null,
        loading: true,
        signUp: expect.any(Function),
        signIn: expect.any(Function),
        signOut: expect.any(Function),
        resetPassword: expect.any(Function)
      });
    });
  });

  describe('Authentication methods', () => {
    it('should handle successful sign in', async () => {
      const mockUser = createMockUser();
      const mockSession = { user: mockUser };

      (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'password123');
        expect(response.error).toBeNull();
        expect(response.data).toEqual({ session: mockSession });
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle sign in error', async () => {
      const mockError = { message: 'Invalid credentials' };

      (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const response = await result.current.signIn('test@example.com', 'wrongpassword');
        expect(response.error).toEqual(mockError);
        expect(response.data).toBeNull();
      });
    });

    it('should handle successful sign up', async () => {
      const mockUser = createMockUser();
      const userData = { full_name: 'Test User', role: 'parent' };

      (supabase.auth.signUp as any).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123', userData);
        expect(response.error).toBeNull();
        expect(response.data).toEqual({ user: mockUser });
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: userData
        }
      });
    });

    it('should handle successful sign out', async () => {
      (supabase.auth.signOut as any).mockResolvedValueOnce({ error: null });

      const { result } = renderAuthHook();

      await act(async () => {
        const response = await result.current.signOut();
        expect(response.error).toBeNull();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle password reset', async () => {
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      const { result } = renderAuthHook();

      await act(async () => {
        const response = await result.current.resetPassword('test@example.com');
        expect(response.error).toBeNull();
        expect(response.data).toEqual({ success: true });
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('User profile fetching', () => {
    it('should fetch user profile when user is authenticated', async () => {
      const mockUser = createMockUser();
      const mockProfile = createMockUserProfile();
      const mockSession = { user: mockUser };

      // Mock initial session
      (supabase.auth.getSession as any).mockResolvedValueOnce({
        data: { session: mockSession }
      });

      // Mock profile fetch
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: mockProfile,
              error: null
            })
          })
        })
      });

      // Mock auth state change subscription
      (supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
        data: { subscription: { unsubscribe: vi.fn() } }
      });

      const { result } = renderAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userProfile).toEqual(mockProfile);
    });

    it('should handle profile fetch error gracefully', async () => {
      const mockUser = createMockUser();
      const mockSession = { user: mockUser };

      // Mock initial session
      (supabase.auth.getSession as any).mockResolvedValueOnce({
        data: { session: mockSession }
      });

      // Mock profile fetch error
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({
              data: null,
              error: { message: 'Profile not found' }
            })
          })
        })
      });

      // Mock auth state change subscription
      (supabase.auth.onAuthStateChange as any).mockReturnValueOnce({
        data: { subscription: { unsubscribe: vi.fn() } }
      });

      const { result } = renderAuthHook();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      }, { timeout: 3000 });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.userProfile).toBeNull();
    });
  });
});
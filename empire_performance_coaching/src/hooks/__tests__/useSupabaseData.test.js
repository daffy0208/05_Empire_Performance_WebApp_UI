import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSupabaseData } from '../useSupabaseData';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  createMockUser,
  createMockUserProfile,
  createMockSession,
  createMockAthlete,
  mockSupabaseResponse
} from '../../utils/test-utils';

// Mock dependencies
vi.mock('../../lib/supabase');
vi.mock('../../contexts/AuthContext');

const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        gte: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn()
          }))
        })),
        lte: vi.fn(() => ({
          order: vi.fn()
        })),
        order: vi.fn(() => ({
          limit: vi.fn()
        }))
      })),
      in: vi.fn(() => ({
        gte: vi.fn(() => ({
          order: vi.fn()
        }))
      })),
      gte: vi.fn(() => ({
        order: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn()
    }))
  }))
};

describe('useSupabaseData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    supabase.from = mockSupabase.from;
    useAuth.mockReturnValue({
      user: null,
      userProfile: null
    });
  });

  describe('Parent Dashboard Data Fetching', () => {
    it('should fetch parent data successfully', async () => {
      const mockUser = createMockUser({ id: 'parent-1' });
      const mockProfile = createMockUserProfile({ role: 'parent' });
      const mockAthletes = [createMockAthlete()];
      const mockSessions = [createMockSession()];

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      // Mock athletes query
      const athletesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSupabaseResponse.success(mockAthletes))
        })
      };

      // Mock sessions query with fallback handling
      const sessionsQuery = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(mockSupabaseResponse.success(mockSessions))
            })
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(athletesQuery) // First call for athletes
        .mockReturnValueOnce(sessionsQuery); // Second call for sessions

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.athletes).toEqual(mockAthletes);
      expect(result.current.upcomingSessions).toEqual(mockSessions);
      expect(result.current.error).toBeNull();
    });

    it('should handle RLS infinite recursion errors with fallback', async () => {
      const mockUser = createMockUser({ id: 'parent-1' });
      const mockProfile = createMockUserProfile({ role: 'parent' });
      const mockAthletes = [createMockAthlete()];

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      // Mock athletes query (successful)
      const athletesQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue(mockSupabaseResponse.success(mockAthletes))
        })
      };

      // Mock sessions query with RLS recursion error
      const sessionsQueryWithError = {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockRejectedValue(new Error('infinite recursion detected'))
            })
          })
        })
      };

      // Mock fallback sessions query (basic query without joins)
      const fallbackSessionsQuery = {
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue(mockSupabaseResponse.success([]))
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(athletesQuery) // First call for athletes
        .mockReturnValueOnce(sessionsQueryWithError) // Second call for sessions (fails)
        .mockReturnValueOnce(fallbackSessionsQuery); // Fallback call

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.athletes).toEqual(mockAthletes);
      expect(result.current.upcomingSessions).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should provide mock data when all queries fail', async () => {
      const mockUser = createMockUser({ id: 'parent-1' });
      const mockProfile = createMockUserProfile({ role: 'parent' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      // Mock all queries to fail
      const failingQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Database connection failed')),
          in: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockRejectedValue(new Error('Database connection failed'))
            })
          }),
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error('Database connection failed'))
          })
        })
      };

      mockSupabase.from.mockReturnValue(failingQuery);

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should have mock data when all queries fail
      expect(result.current.upcomingSessions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'mock-1',
            title: 'Football Training Session'
          })
        ])
      );
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Coach Dashboard Data Fetching', () => {
    it('should fetch coach data successfully', async () => {
      const mockUser = createMockUser({ id: 'coach-1' });
      const mockProfile = createMockUserProfile({ role: 'coach' });
      const mockSessions = [createMockSession({ coach_id: 'coach-1' })];

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      // Mock sessions query for coach
      const sessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(mockSupabaseResponse.success(mockSessions))
              })
            })
          })
        })
      };

      // Mock notifications query
      const notificationsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockSupabaseResponse.success([]))
            })
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(sessionsQuery) // Sessions query
        .mockReturnValueOnce(notificationsQuery); // Notifications query

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todaysSessions).toEqual(mockSessions);
      expect(result.current.coachStats).toEqual(
        expect.objectContaining({
          totalSessions: 1,
          completedSessions: 0,
          attendanceRate: '0'
        })
      );
    });

    it('should handle coach data fetching with RLS fallback', async () => {
      const mockUser = createMockUser({ id: 'coach-1' });
      const mockProfile = createMockUserProfile({ role: 'coach' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      // Mock sessions query with RLS error, then successful fallback
      const sessionsQueryWithError = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockRejectedValue(new Error('infinite recursion detected'))
              })
            })
          })
        })
      };

      const fallbackSessionsQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(mockSupabaseResponse.success([]))
              })
            })
          })
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(sessionsQueryWithError) // First call (fails)
        .mockReturnValueOnce(fallbackSessionsQuery) // Fallback call
        .mockReturnValueOnce({ // Notifications query
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue(mockSupabaseResponse.success([]))
              })
            })
          })
        });

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todaysSessions).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Data Update Operations', () => {
    it('should update attendance successfully', async () => {
      const mockUser = createMockUser({ id: 'coach-1' });
      const mockProfile = createMockUserProfile({ role: 'coach' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      const updateQuery = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(mockSupabaseResponse.success({}))
          })
        })
      };

      mockSupabase.from.mockReturnValue(updateQuery);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.updateAttendance('session-1', 'athlete-1', true);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('session_participants');
    });

    it('should handle update errors gracefully', async () => {
      const mockUser = createMockUser({ id: 'coach-1' });
      const mockProfile = createMockUserProfile({ role: 'coach' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      const updateQuery = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockRejectedValue(new Error('Update failed'))
          })
        })
      };

      mockSupabase.from.mockReturnValue(updateQuery);

      const { result } = renderHook(() => useSupabaseData());

      await act(async () => {
        await result.current.updateAttendance('session-1', 'athlete-1', true);
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const mockUser = createMockUser({ id: 'parent-1' });
      const mockProfile = createMockUserProfile({ role: 'parent' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      const networkErrorQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('NETWORK_ERROR'))
        })
      };

      mockSupabase.from.mockReturnValue(networkErrorQuery);

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should not fetch data for invalid user roles', async () => {
      const mockUser = createMockUser({ id: 'director-1' });
      const mockProfile = createMockUserProfile({ role: 'director' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      const { result } = renderHook(() => useSupabaseData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not make any API calls for director role
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      const mockUser = createMockUser({ id: 'parent-1' });
      const mockProfile = createMockUserProfile({ role: 'parent' });

      useAuth.mockReturnValue({
        user: mockUser,
        userProfile: mockProfile
      });

      const { result } = renderHook(() => useSupabaseData());

      expect(result.current.loading).toBe(true);
    });

    it('should handle missing user gracefully', () => {
      useAuth.mockReturnValue({
        user: null,
        userProfile: null
      });

      const { result } = renderHook(() => useSupabaseData());

      expect(result.current.loading).toBe(true);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });
});
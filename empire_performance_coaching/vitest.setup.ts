import { expect, beforeEach, afterEach, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { createClient } from '@supabase/supabase-js';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: vi.fn(() => Promise.resolve({ data: null, error: null })),
      onAuthStateChange: vi.fn((callback) => {
        // Don't call callback immediately in tests
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }))
}));

// Mock environment variables
Object.assign(import.meta.env, {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  VITE_APP_NAME: 'Empire Performance Coaching Test',
  DEV: true
});

// Mock monitoring functions
vi.mock('../lib/monitoring', () => ({
  initializeErrorMonitoring: vi.fn(),
  setupGlobalErrorHandling: vi.fn(),
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
  performanceMonitor: {
    startMeasurement: vi.fn(),
    endMeasurement: vi.fn(),
    measureAsync: vi.fn(),
  },
  AppError: class MockAppError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AppError';
    }
  },
}));

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

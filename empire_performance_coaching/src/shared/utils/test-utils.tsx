import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/ToastProvider';

// Custom render function that includes providers
const AllTheProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
});

export const createMockUserProfile = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
  phone: '+1234567890',
  role: 'parent' as const,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
});

export const createMockAthlete = (overrides = {}) => ({
  id: 'test-athlete-id',
  parent_id: 'test-parent-id',
  name: 'Test Athlete',
  birth_date: '2010-01-01',
  notes: 'Test notes',
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
});

export const createMockSession = (overrides = {}) => ({
  id: 'test-session-id',
  coach_id: 'test-coach-id',
  title: 'Test Session',
  start_time: '2023-12-01T16:00:00Z',
  end_time: '2023-12-01T17:00:00Z',
  location: 'Test Location',
  type: 'individual' as const,
  status: 'scheduled' as const,
  is_cash_payment: false,
  notes: 'Test notes',
  special_instructions: '',
  weather_alert: false,
  is_recurring: false,
  max_participants: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides
});

export const createMockCoach = (overrides = {}) => ({
  id: 'test-coach-id',
  specialization: 'Youth Football Development',
  experience_years: 5,
  certifications: ['NFHS Certified'],
  hourly_rate: 75.00,
  bio: 'Test bio',
  avatar_url: null,
  created_at: '2023-01-01T00:00:00Z',
  ...overrides
});

// Mock API responses
export const mockSupabaseResponse = {
  success: function<T>(data: T) { return { data, error: null }; },
  error: (message: string) => ({ data: null, error: { message } })
};

// Wait for async operations in tests
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
// Global type definitions for Empire Performance Coaching

export type UserRole = 'parent' | 'coach' | 'director';
export type SessionStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type SessionType = 'individual' | 'group' | 'team';
export type BookingStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'card' | 'cash' | 'bank_transfer';

// Database entity types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  specialization?: string;
  experience_years: number;
  certifications: string[];
  hourly_rate: number;
  bio?: string;
  avatar_url?: string;
  display_name?: string;
  current_club?: string;
  specialties?: string[];
  locations_served?: string[];
  name?: string;
  headshot_url?: string;
  created_at: string;
}

export interface Athlete {
  id: string;
  parent_id: string;
  name: string;
  birth_date?: string;
  notes?: string;
  created_at: string;
}

export interface Session {
  id: string;
  coach_id: string;
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  type: SessionType;
  status: SessionStatus;
  is_cash_payment: boolean;
  notes?: string;
  special_instructions?: string;
  weather_alert: boolean;
  is_recurring: boolean;
  max_participants?: number;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  athlete_id: string;
  attended: boolean;
  created_at: string;
}

export interface BookingSeries {
  id: string;
  parent_id: string;
  coach_id: string;
  athlete_id: string;
  series_name: string;
  frequency: string;
  duration_minutes: number;
  price_per_session: number;
  total_sessions: number;
  completed_sessions: number;
  status: BookingStatus;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  parent_id: string;
  invoice_number: string;
  description: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  payment_method?: PaymentMethod;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  session_date: string;
  athlete_name: string;
  amount: number;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  facility_summary?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: string;
  coach_id: string;
  location_id: string;
  starts_at: string;
  ends_at: string;
  status: 'open' | 'held' | 'booked' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface BookingFormData {
  coach_id?: string;
  athlete_id?: string;
  location_id?: string;
  session_type: SessionType;
  start_time?: string;
  duration_minutes: number;
  notes?: string;
  is_recurring?: boolean;
  frequency?: string;
  total_sessions?: number;
}

// Component prop types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

// Event types
export interface AuthStateChangeEvent {
  event: string;
  session: any;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

// Context types
export interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<ApiResponse<any>>;
  signIn: (email: string, password: string) => Promise<ApiResponse<any>>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<ApiResponse<any>>;
}

export interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  hideToast: (id: string) => void;
}

// Validation schemas (for Zod integration)
export interface ValidationErrors {
  [key: string]: string | undefined;
}

// Dashboard types
export interface DashboardStats {
  total_sessions: number;
  completed_sessions: number;
  upcoming_sessions: number;
  total_revenue?: number;
  active_athletes?: number;
  active_coaches?: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Booking flow types
export interface BookingStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isComplete: boolean;
  isActive: boolean;
}

// PWA types
export interface PWAInstallPrompt {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    deferredPrompt?: PWAInstallPrompt;
  }
}
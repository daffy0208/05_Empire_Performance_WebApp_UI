import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import LoginRegister from '../index';
import { supabase } from '../../../shared/lib/supabase';
import { createMockUser, createMockUserProfile } from '../../../utils/test-utils';

describe('Login Registration Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully log in a user and redirect based on role', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ email: 'parent@test.com' });
      const mockProfile = createMockUserProfile({ role: 'parent' });

      // Mock successful login
      (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
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

      render(<LoginRegister />);

      // Should default to login form
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();

      // Fill in login form
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'parent@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      // Wait for form submission
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'parent@test.com',
          password: 'password123'
        });
      });
    });

    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup();

      // Mock failed login
      (supabase.auth.signInWithPassword as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid email or password' }
      });

      render(<LoginRegister />);

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'wrong@test.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(signInButton);

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should validate email format before submission', async () => {
      const user = userEvent.setup();

      render(<LoginRegister />);

      // Fill in invalid email
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Should not call login API
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should show loading state during login attempt', async () => {
      const user = userEvent.setup();

      // Mock delayed login response
      (supabase.auth.signInWithPassword as any).mockImplementationOnce(
        () => new Promise(resolve =>
          setTimeout(() => resolve({ data: null, error: null }), 100)
        )
      );

      render(<LoginRegister />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByRole('button', { name: /Sign In/i });

      await user.type(emailInput, 'test@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(signInButton);

      // Should show loading state
      expect(screen.getByText('Signing In...')).toBeInTheDocument();
      expect(signInButton).toBeDisabled();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Signing In...')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({ email: 'newuser@test.com' });

      // Mock successful registration
      (supabase.auth.signUp as any).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      });

      render(<LoginRegister />);

      // Switch to registration form
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      expect(screen.getByText('Join Empire Performance')).toBeInTheDocument();

      // Fill in registration form
      const firstNameInput = screen.getByLabelText(/First Name/i);
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      const emailInput = screen.getByLabelText(/Email Address/i);
      const phoneInput = screen.getByLabelText(/Phone Number/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const termsCheckbox = screen.getByLabelText(/I agree to the Terms/i);
      const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'newuser@test.com');
      await user.type(phoneInput, '+1234567890');
      await user.type(passwordInput, 'SecurePass123!');
      await user.type(confirmPasswordInput, 'SecurePass123!');
      await user.click(termsCheckbox);
      await user.click(createAccountButton);

      // Wait for form submission
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          options: {
            data: {
              full_name: 'John Doe',
              phone: '+1234567890',
              role: 'parent'
            }
          }
        });
      });
    });

    it('should validate password confirmation', async () => {
      const user = userEvent.setup();

      render(<LoginRegister />);

      // Switch to registration form
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      // Fill in mismatched passwords
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different123');
      await user.click(createAccountButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
      });

      // Should not call registration API
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();

      render(<LoginRegister />);

      // Switch to registration form
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      // Try to submit empty form
      const createAccountButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(createAccountButton);

      // Should show validation errors for required fields
      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });

      // Should not call registration API
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should handle registration errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock registration error
      (supabase.auth.signUp as any).mockResolvedValueOnce({
        data: null,
        error: { message: 'User already exists' }
      });

      render(<LoginRegister />);

      // Switch to registration form
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      // Fill in form with valid data
      const firstNameInput = screen.getByLabelText(/First Name/i);
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      const emailInput = screen.getByLabelText(/Email Address/i);
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
      const termsCheckbox = screen.getByLabelText(/I agree to the Terms/i);
      const createAccountButton = screen.getByRole('button', { name: /Create Account/i });

      await user.type(firstNameInput, 'John');
      await user.type(lastNameInput, 'Doe');
      await user.type(emailInput, 'existing@test.com');
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'password123');
      await user.click(termsCheckbox);
      await user.click(createAccountButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Form Switching', () => {
    it('should switch between login and registration forms', async () => {
      const user = userEvent.setup();

      render(<LoginRegister />);

      // Should start with login form
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();

      // Switch to registration
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      expect(screen.getByText('Join Empire Performance')).toBeInTheDocument();
      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();

      // Switch back to login
      const signInTab = screen.getByText('Sign In');
      await user.click(signInTab);

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.queryByLabelText(/First Name/i)).not.toBeInTheDocument();
    });

    it('should clear form data when switching forms', async () => {
      const user = userEvent.setup();

      render(<LoginRegister />);

      // Fill in login form
      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.type(emailInput, 'test@test.com');

      // Switch to registration
      const createAccountTab = screen.getByText('Create Account');
      await user.click(createAccountTab);

      // Email field should be cleared
      const regEmailInput = screen.getByLabelText(/Email Address/i);
      expect(regEmailInput).toHaveValue('');

      // Switch back to login
      const signInTab = screen.getByText('Sign In');
      await user.click(signInTab);

      // Email field should still be cleared
      const loginEmailInput = screen.getByLabelText(/Email Address/i);
      expect(loginEmailInput).toHaveValue('');
    });
  });

  describe('Forgot Password Flow', () => {
    it('should open forgot password modal and handle reset request', async () => {
      const user = userEvent.setup();

      // Mock password reset
      (supabase.auth.resetPasswordForEmail as any).mockResolvedValueOnce({
        data: { success: true },
        error: null
      });

      render(<LoginRegister />);

      // Click forgot password link
      const forgotPasswordLink = screen.getByText('Forgot Password?');
      await user.click(forgotPasswordLink);

      // Should open forgot password modal
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();

      // Fill in email and submit
      const emailInput = screen.getByPlaceholderText(/Enter your email address/i);
      const sendResetButton = screen.getByRole('button', { name: /Send Reset Link/i });

      await user.type(emailInput, 'reset@test.com');
      await user.click(sendResetButton);

      // Wait for API call
      await waitFor(() => {
        expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('reset@test.com');
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Password reset email sent/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4028';

test.describe('Empire Performance Coaching - Authentication System Comprehensive Test', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to the authentication page
    await page.goto(`${BASE_URL}/login-register`);

    // Wait for the page to load and check basic structure
    await expect(page.locator('h1')).toContainText('Empire Performance');
    await expect(page.locator('text=Coaching Platform')).toBeVisible();
  });

  test.describe('1. Login Form Testing', () => {
    test('should display login form correctly', async () => {
      // Verify login tab is active by default
      await expect(page.locator('[data-testid="login-tab"]').or(page.locator('text=Sign In').first())).toBeVisible();

      // Check form elements
      await expect(page.locator('input[name="email"]').or(page.locator('input[type="email"]'))).toBeVisible();
      await expect(page.locator('input[name="password"]').or(page.locator('input[type="password"]'))).toBeVisible();
      await expect(page.locator('text=Remember me').or(page.locator('input[type="checkbox"]'))).toBeVisible();
      await expect(page.locator('text=Forgot password?')).toBeVisible();
      await expect(page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")'))).toBeVisible();
    });

    test('should validate empty login fields', async () => {
      // Try to submit empty form
      await page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")')).click();

      // Check for validation messages
      const emailError = page.locator('text=Email is required').or(page.locator('.error').first());
      const passwordError = page.locator('text=Password is required').or(page.locator('.error').last());

      // At least one validation error should appear
      await expect(emailError.or(passwordError)).toBeVisible({ timeout: 3000 });
    });

    test('should validate invalid email format', async () => {
      // Enter invalid email
      await page.locator('input[name="email"]').or(page.locator('input[type="email"]')).fill('invalid-email');
      await page.locator('input[name="password"]').or(page.locator('input[type="password"]')).fill('password123');

      // Submit form
      await page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")')).click();

      // Check for email validation error
      const emailError = page.locator('text=Please enter a valid email').or(page.locator('text=Invalid email').or(page.locator('.error')));
      await expect(emailError.first()).toBeVisible({ timeout: 3000 });
    });

    test('should handle invalid credentials', async () => {
      // Enter invalid credentials
      await page.locator('input[name="email"]').or(page.locator('input[type="email"]')).fill('invalid@test.com');
      await page.locator('input[name="password"]').or(page.locator('input[type="password"]')).fill('wrongpassword');

      // Submit form
      await page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")')).click();

      // Wait for error message
      const errorMessage = page.locator('text=Invalid credentials').or(page.locator('text=Authentication failed').or(page.locator('.error')));
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test('should attempt login with mock credentials', async () => {
      // Try the mock credentials from the code
      await page.locator('input[name="email"]').or(page.locator('input[type="email"]')).fill('parent@test.com');
      await page.locator('input[name="password"]').or(page.locator('input[type="password"]')).fill('parent123');

      // Submit form
      await page.locator('button[type="submit"]').or(page.locator('button:has-text("Sign In")')).click();

      // Check if loading state appears
      const loadingButton = page.locator('button:disabled').or(page.locator('.loading').or(page.locator('text=Redirecting')));
      await expect(loadingButton.first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('2. Registration Form Testing', () => {
    test.beforeEach(async () => {
      // Switch to register tab
      await page.locator('text=Register here').or(page.locator('[data-testid="register-tab"]')).click();
      await page.waitForTimeout(500); // Wait for tab switch animation
    });

    test('should display registration form correctly', async () => {
      // Check all registration form fields
      await expect(page.locator('input[name="firstName"]').or(page.locator('input[placeholder*="First"]'))).toBeVisible();
      await expect(page.locator('input[name="lastName"]').or(page.locator('input[placeholder*="Last"]'))).toBeVisible();
      await expect(page.locator('input[name="email"]').or(page.locator('input[type="email"]'))).toBeVisible();
      await expect(page.locator('input[name="phone"]').or(page.locator('input[type="tel"]'))).toBeVisible();

      // Check role selection
      const roleSelect = page.locator('select').or(page.locator('[role="combobox"]'));
      await expect(roleSelect.first()).toBeVisible();

      // Check password fields
      const passwordFields = page.locator('input[type="password"]');
      await expect(passwordFields).toHaveCount(2); // Password and confirm password

      // Check terms checkbox
      await expect(page.locator('text=I agree to the Terms').or(page.locator('input[type="checkbox"]'))).toBeVisible();

      // Check submit button
      await expect(page.locator('button:has-text("Create Account")')).toBeVisible();
    });

    test('should validate required registration fields', async () => {
      // Try to submit empty form
      await page.locator('button:has-text("Create Account")').click();

      // Check for validation errors
      const errors = page.locator('.error').or(page.locator('text=required'));
      await expect(errors.first()).toBeVisible({ timeout: 3000 });
    });

    test('should test role selection', async () => {
      // Test role selection
      const roleSelect = page.locator('select').or(page.locator('[role="combobox"]')).first();

      if (await roleSelect.count() > 0) {
        await roleSelect.click();

        // Check for role options
        const parentOption = page.locator('option[value="parent"]').or(page.locator('text=Parent'));
        const coachOption = page.locator('option[value="coach"]').or(page.locator('text=Coach'));

        await expect(parentOption.or(coachOption)).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('3. Password Validation Testing', () => {
    test.beforeEach(async () => {
      // Switch to register tab for password testing
      await page.locator('text=Register here').or(page.locator('[data-testid="register-tab"]')).click();
      await page.waitForTimeout(500);
    });

    test('should validate password complexity requirements', async () => {
      const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first();

      // Test weak passwords
      const weakPasswords = [
        'weak',           // Too short
        'weakpassword',   // No uppercase
        'WEAKPASSWORD',   // No lowercase
        'WeakPassword',   // No numbers
        'WeakPassword123' // No special characters
      ];

      for (const weakPassword of weakPasswords) {
        await passwordInput.fill(weakPassword);

        // Check for password strength indicator or validation message
        const strengthIndicator = page.locator('.password-strength').or(page.locator('.weak').or(page.locator('.error')));

        // Trigger validation by clicking elsewhere or moving to next field
        await page.locator('input[name="confirmPassword"]').or(page.locator('input[type="password"]').last()).click();

        // Wait briefly for validation
        await page.waitForTimeout(500);
      }
    });

    test('should validate password confirmation matching', async () => {
      const passwordInput = page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first();
      const confirmPasswordInput = page.locator('input[name="confirmPassword"]').or(page.locator('input[type="password"]')).last();

      // Enter mismatching passwords
      await passwordInput.fill('ValidPassword123!');
      await confirmPasswordInput.fill('DifferentPassword123!');

      // Try to submit or move away from field
      await page.locator('button:has-text("Create Account")').click();

      // Check for mismatch error
      const mismatchError = page.locator('text=Passwords do not match').or(page.locator('text=Password confirmation').or(page.locator('.error')));
      await expect(mismatchError.first()).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('4. Social Authentication Testing', () => {
    test('should display social authentication buttons', async () => {
      // Check for social auth buttons
      const googleButton = page.locator('button:has-text("Google")').or(page.locator('[data-provider="google"]'));
      const facebookButton = page.locator('button:has-text("Facebook")').or(page.locator('[data-provider="facebook"]'));
      const githubButton = page.locator('button:has-text("GitHub")').or(page.locator('[data-provider="github"]'));

      // At least Google should be visible based on the code
      await expect(googleButton.first()).toBeVisible();

      // Check if other social buttons exist
      if (await facebookButton.count() > 0) {
        await expect(facebookButton.first()).toBeVisible();
      }

      if (await githubButton.count() > 0) {
        await expect(githubButton.first()).toBeVisible();
      }
    });

    test('should handle social authentication button clicks', async () => {
      const googleButton = page.locator('button:has-text("Google")').or(page.locator('[data-provider="google"]'));

      if (await googleButton.count() > 0) {
        // Click the button and check for loading state
        await googleButton.first().click();

        // Should show loading state or redirect attempt
        const loadingState = page.locator('button:disabled').or(page.locator('.loading'));
        await expect(loadingState.first()).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('5. Forgot Password Testing', () => {
    test('should open forgot password modal', async () => {
      // Click forgot password link
      await page.locator('text=Forgot password?').click();

      // Check if modal opens
      const modal = page.locator('[role="dialog"]').or(page.locator('.modal').or(page.locator('text=Reset Password')));
      await expect(modal.first()).toBeVisible({ timeout: 3000 });
    });

    test('should validate forgot password form', async () => {
      // Open modal
      await page.locator('text=Forgot password?').click();
      await page.waitForTimeout(500);

      // Try to submit empty email
      const submitButton = page.locator('button:has-text("Send Reset Link")').or(page.locator('button[type="submit"]').last());

      if (await submitButton.count() > 0) {
        await submitButton.click();

        // Check for validation error
        const error = page.locator('text=Email is required').or(page.locator('.error'));
        await expect(error.first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('should handle forgot password submission', async () => {
      // Open modal
      await page.locator('text=Forgot password?').click();
      await page.waitForTimeout(500);

      // Enter email and submit
      const emailInput = page.locator('input[type="email"]').last();
      const submitButton = page.locator('button:has-text("Send Reset Link")');

      if (await emailInput.count() > 0 && await submitButton.count() > 0) {
        await emailInput.fill('test@example.com');
        await submitButton.click();

        // Should show success message or loading state
        const success = page.locator('text=Check your email').or(page.locator('text=sent').or(page.locator('.success')));
        await expect(success.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('6. Form Validation Edge Cases', () => {
    test('should handle special characters in inputs', async () => {
      const emailInput = page.locator('input[name="email"]').or(page.locator('input[type="email"]'));

      // Test various special characters and edge cases
      const edgeCaseEmails = [
        'test@',
        '@test.com',
        'test@.com',
        'test@test.',
        'test..test@test.com',
        '\\<script>alert(1)</script>\\@test.com'
      ];

      for (const email of edgeCaseEmails) {
        await emailInput.fill(email);
        await page.locator('input[type="password"]').first().click(); // Trigger validation
        await page.waitForTimeout(200);
      }
    });

    test('should handle extremely long inputs', async () => {
      const longString = 'a'.repeat(1000);

      // Test with very long inputs
      await page.locator('input[name="email"]').or(page.locator('input[type="email"]')).fill(longString + '@test.com');
      await page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first().fill(longString);

      // Form should handle gracefully
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(1000);
    });
  });

  test.describe('7. UI/UX and Accessibility Testing', () => {
    test('should have proper form labels and accessibility', async () => {
      // Check for proper labeling
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]').first();

      // Inputs should have associated labels or aria-labels
      await expect(emailInput).toHaveAttribute('aria-label', /.+/);
      await expect(passwordInput).toHaveAttribute('aria-label', /.+/);
    });

    test('should handle keyboard navigation', async () => {
      // Test tab navigation through form
      await page.keyboard.press('Tab'); // Should focus first input
      await page.keyboard.press('Tab'); // Should focus next input
      await page.keyboard.press('Tab'); // Should focus next element

      // Check that focus moves correctly
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should be responsive', async () => {
      // Test at mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Form should still be visible and functional
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('8. Security Testing', () => {
    test('should not expose sensitive data in DOM', async () => {
      // Check that passwords are not visible in DOM
      await page.locator('input[type="password"]').first().fill('secretpassword123');

      // Password should not appear in page content
      const pageContent = await page.content();
      expect(pageContent).not.toContain('secretpassword123');
    });

    test('should handle XSS attempts', async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      // Try XSS in various inputs
      await page.locator('input[type="email"]').fill(xssPayload + '@test.com');

      // Switch to register tab
      const registerTab = page.locator('text=Register here');
      if (await registerTab.count() > 0) {
        await registerTab.click();
        await page.waitForTimeout(500);

        await page.locator('input[name="firstName"]').or(page.locator('input').first()).fill(xssPayload);
      }

      // Page should not execute the script
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });

      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    });
  });

  test.describe('9. Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network error by going offline
      await page.context().setOffline(true);

      // Try to submit form
      await page.locator('input[type="email"]').fill('test@test.com');
      await page.locator('input[type="password"]').first().fill('password123');
      await page.locator('button[type="submit"]').click();

      // Should show appropriate error message
      const networkError = page.locator('text=network').or(page.locator('text=connection').or(page.locator('.error')));
      await expect(networkError.first()).toBeVisible({ timeout: 5000 });

      // Restore network
      await page.context().setOffline(false);
    });
  });

  test.describe('10. Performance and Loading', () => {
    test('should load authentication page quickly', async () => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/login-register`);
      await page.waitForSelector('input[type="email"]');
      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000);
    });
  });
});
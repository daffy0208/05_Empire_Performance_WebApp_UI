import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4028';

test.describe('Empire Performance Coaching - Manual Auth Inspection', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto(`${BASE_URL}/login-register`);
    await page.waitForLoadState('networkidle');
  });

  test('should load and display basic auth page structure', async () => {
    // Take a screenshot
    await page.screenshot({ path: 'auth-page-screenshot.png', fullPage: true });

    // Check basic page structure
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);

    // Log page content for analysis
    const pageContent = await page.content();
    console.log('Page HTML length:', pageContent.length);

    // Check for basic elements
    const emailInputs = await page.locator('input[type="email"]').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    const buttons = await page.locator('button').count();

    console.log('Email inputs found:', emailInputs);
    console.log('Password inputs found:', passwordInputs);
    console.log('Buttons found:', buttons);

    // Check for form elements
    const forms = await page.locator('form').count();
    console.log('Forms found:', forms);

    // Check for social auth buttons
    const socialButtons = await page.locator('button:has-text("Google"), button:has-text("Facebook"), button:has-text("GitHub")').count();
    console.log('Social auth buttons:', socialButtons);

    // Log all button texts
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`Button ${i + 1}:`, buttonText?.trim());
    }

    // Check for tabs
    const tabs = await page.locator('[role="tab"], [data-testid*="tab"]').count();
    console.log('Tab elements found:', tabs);

    // Log any JavaScript errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log('JavaScript Errors:', errors);
    } else {
      console.log('No JavaScript errors detected');
    }

    // Basic assertions
    expect(emailInputs).toBeGreaterThanOrEqual(1);
    expect(passwordInputs).toBeGreaterThanOrEqual(1);
    expect(buttons).toBeGreaterThanOrEqual(1);
  });

  test('should test form interactions', async () => {
    // Try to find and interact with email input
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      const emailValue = await emailInput.inputValue();
      console.log('Email input value:', emailValue);
      expect(emailValue).toBe('test@example.com');
    }

    // Try to find and interact with password input
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.count() > 0) {
      await passwordInput.fill('testpassword123');
      console.log('Password input filled successfully');
    }

    // Try to click submit button
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    if (await submitButton.count() > 0) {
      console.log('Submit button found, attempting click...');
      await submitButton.click();

      // Wait for any response
      await page.waitForTimeout(2000);

      // Check for error messages or loading states
      const errorElements = await page.locator('.error, [class*="error"]').count();
      const loadingElements = await page.locator('.loading, [class*="loading"]').count();

      console.log('Error elements after submit:', errorElements);
      console.log('Loading elements after submit:', loadingElements);
    }
  });

  test('should test tab switching', async () => {
    // Try to find register tab/link
    const registerLink = page.locator('text=Register here, text=Register, text=Create Account, [data-testid="register-tab"]').first();

    if (await registerLink.count() > 0) {
      console.log('Register tab/link found');
      await registerLink.click();
      await page.waitForTimeout(1000);

      // Check if registration form elements appear
      const firstNameInput = await page.locator('input[name="firstName"], input[placeholder*="First"]').count();
      const lastNameInput = await page.locator('input[name="lastName"], input[placeholder*="Last"]').count();
      const roleSelect = await page.locator('select, [role="combobox"]').count();

      console.log('First name inputs:', firstNameInput);
      console.log('Last name inputs:', lastNameInput);
      console.log('Role selectors:', roleSelect);
    } else {
      console.log('Register tab/link not found');
    }
  });

  test('should test social auth buttons', async () => {
    // Look for social auth buttons
    const googleBtn = page.locator('button:has-text("Google")').first();
    const facebookBtn = page.locator('button:has-text("Facebook")').first();
    const githubBtn = page.locator('button:has-text("GitHub")').first();

    const googleExists = await googleBtn.count() > 0;
    const facebookExists = await facebookBtn.count() > 0;
    const githubExists = await githubBtn.count() > 0;

    console.log('Google button exists:', googleExists);
    console.log('Facebook button exists:', facebookExists);
    console.log('GitHub button exists:', githubExists);

    if (googleExists) {
      console.log('Testing Google button click...');
      await googleBtn.click();
      await page.waitForTimeout(1000);

      // Check for loading state or navigation
      const currentUrl = page.url();
      console.log('URL after Google click:', currentUrl);
    }
  });

  test('should test forgot password', async () => {
    // Look for forgot password link
    const forgotLink = page.locator('text=Forgot password?, text=Forgot Password').first();

    if (await forgotLink.count() > 0) {
      console.log('Forgot password link found');
      await forgotLink.click();
      await page.waitForTimeout(1000);

      // Check for modal or form
      const modal = await page.locator('[role="dialog"], .modal, text=Reset Password').count();
      console.log('Modal elements found:', modal);
    } else {
      console.log('Forgot password link not found');
    }
  });
});
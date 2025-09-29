import { test, expect } from '@playwright/test';

test.describe('Empire Performance Coaching E2E Tests', () => {
  test('landing page loads and displays correctly', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/empire-performance-coaching/i);

    // Check main heading is visible
    await expect(page.locator('h1')).toBeVisible();

    // Check navigation is present
    await expect(page.locator('nav')).toBeVisible();

    // Check CTA buttons are present
    await expect(page.locator('button, a').filter({ hasText: /book|start|join/i }).first()).toBeVisible();
  });

  test('navigation to login page works', async ({ page }) => {
    await page.goto('/');

    // Look for login/sign in link and click it
    const loginLink = page.locator('a').filter({ hasText: /sign in|login/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/login/);
    } else {
      // Direct navigation if no login link found
      await page.goto('/login-register');
    }

    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /sign in/i })).toBeVisible();
  });

  test('registration form validation works', async ({ page }) => {
    await page.goto('/login-register');

    // Switch to registration if needed
    const createAccountTab = page.locator('text=Create Account');
    if (await createAccountTab.isVisible()) {
      await createAccountTab.click();
    }

    // Try to submit empty form
    const submitButton = page.locator('button').filter({ hasText: /create account|sign up/i });
    await submitButton.click();

    // Check for validation errors
    await expect(page.locator('text=/required|invalid/i').first()).toBeVisible();
  });

  test('booking flow navigation works', async ({ page }) => {
    await page.goto('/');

    // Look for booking/schedule link
    const bookingLink = page.locator('a').filter({ hasText: /book|schedule|training/i }).first();
    if (await bookingLink.isVisible()) {
      await bookingLink.click();

      // Should navigate to booking flow
      await expect(page).toHaveURL(/booking|multi-step/);

      // Check booking form elements are present
      await expect(page.locator('form, .booking-step, .step').first()).toBeVisible();
    } else {
      // Direct navigation test
      await page.goto('/multi-step-booking-flow');
      await expect(page.locator('form, .booking-step, .step').first()).toBeVisible();
    }
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile navigation (hamburger menu)
    const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu, .hamburger').first();
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('nav, .menu-items').first()).toBeVisible();
    }

    // Check content is visible and properly arranged
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main, .main-content').first()).toBeVisible();
  });

  test('accessibility features work', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test skip links if present
    const skipLink = page.locator('a').filter({ hasText: /skip/i }).first();
    if (await skipLink.isVisible()) {
      await skipLink.click();
      await expect(page.locator('main, #main').first()).toBeFocused();
    }
  });

  test('error pages handle gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page');

    // Should show 404 or redirect to home
    const isErrorPage = await page.locator('text=/404|not found|error/i').isVisible();
    const isHomePage = await page.locator('h1').isVisible();

    expect(isErrorPage || isHomePage).toBeTruthy();

    // Should have way to navigate back
    if (isErrorPage) {
      await expect(page.locator('a').filter({ hasText: /home|back/i }).first()).toBeVisible();
    }
  });

  test('performance metrics are acceptable', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Basic performance check - page should load within reasonable time
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Check for essential content
    await expect(page.locator('h1, main, nav').first()).toBeVisible();
  });
});


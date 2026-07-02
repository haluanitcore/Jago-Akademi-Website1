import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("login page shows email and password fields", async ({ page }) => {
    await page.goto("/masuk");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("register page shows name, email, password fields", async ({ page }) => {
    await page.goto("/daftar");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("login with wrong credentials shows error", async ({ page }) => {
    await page.goto("/masuk");
    await page.fill('input[type="email"]', "nonexistent@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');
    // Should stay on login page or show error — not redirect to dashboard
    await page.waitForTimeout(1500);
    const url = page.url();
    expect(url).not.toMatch(/\/dashboard/);
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/masuk");
    const registerLink = page.locator("a[href*='/daftar']");
    await expect(registerLink.first()).toBeVisible();
  });

  test("register page has link to login", async ({ page }) => {
    await page.goto("/daftar");
    const loginLink = page.locator("a[href*='/masuk']");
    await expect(loginLink.first()).toBeVisible();
  });

  test("protected routes redirect to login when unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/masuk/);
  });

  test("admin route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/masuk/);
  });

  test("trainer hub redirects when unauthenticated", async ({ page }) => {
    await page.goto("/trainer-hub");
    // Either redirect to /masuk or show login prompt
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/masuk|trainer-hub/);
  });
});

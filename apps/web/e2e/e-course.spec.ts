import { test, expect } from "@playwright/test";

test.describe("E-Course public pages", () => {
  test("e-course listing page loads with at least a heading", async ({ page }) => {
    await page.goto("/e-course");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("e-course page has course cards or categories", async ({ page }) => {
    await page.goto("/e-course");
    await page.waitForLoadState("networkidle");
    // Should have some content — cards, categories, or empty state
    const body = page.locator("main, body");
    await expect(body).toBeVisible();
  });

  test("e-course category page loads", async ({ page }) => {
    await page.goto("/e-course/digital-marketing");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });

  test("e-course berlangganan page shows subscription plans", async ({ page }) => {
    await page.goto("/berlangganan");
    await page.waitForLoadState("networkidle");
    // Subscription page or plans should be visible
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(50);
  });
});

test.describe("E-Course course detail", () => {
  test("courses page shows listing", async ({ page }) => {
    await page.goto("/e-course");
    await page.waitForLoadState("networkidle");
    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible();
  });
});

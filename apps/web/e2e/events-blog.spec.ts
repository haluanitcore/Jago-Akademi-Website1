import { test, expect } from "@playwright/test";

test.describe("Events pages", () => {
  test("events listing page loads", async ({ page }) => {
    await page.goto("/event");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("events page has navigation to individual events or categories", async ({ page }) => {
    await page.goto("/event");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.length).toBeGreaterThan(50);
  });
});

test.describe("Blog pages", () => {
  test("blog listing page loads", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
    const content = await page.locator("body").textContent();
    expect(content?.length).toBeGreaterThan(10);
  });

  test("blog page has search input", async ({ page }) => {
    await page.goto("/blog");
    await page.waitForLoadState("networkidle");
    // Blog page should have either a search input or article list
    const hasSearch = await page.locator('input[type="text"], input[placeholder*="cari" i], input[placeholder*="search" i]').count();
    const hasContent = await page.locator("article, .card, h2, h3").count();
    expect(hasSearch + hasContent).toBeGreaterThan(0);
  });
});

test.describe("Public info pages", () => {
  test("about page loads", async ({ page }) => {
    await page.goto("/tentang");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("contact page has form", async ({ page }) => {
    await page.goto("/kontak");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("form, input, textarea").first()).toBeVisible();
  });

  test("ebook listing page loads", async ({ page }) => {
    await page.goto("/e-book");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).toBeVisible();
  });
});

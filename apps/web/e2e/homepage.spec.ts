import { test, expect } from "@playwright/test";

test.describe("Homepage — Phase 1 smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("halaman dimuat tanpa error", async ({ page }) => {
    await expect(page).toHaveTitle(/Jago Akademi/);
  });

  test("navbar tampil dengan logo", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    const logo = page.locator('header img[alt="Jago Akademi"]');
    await expect(logo).toBeVisible();
  });

  test("hero section tampil dengan heading utama", async ({ page }) => {
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Belajar|Berlatih|Berkarier/i);
  });

  test("tombol CTA utama hero berfungsi", async ({ page }) => {
    const ctaBtn = page.locator("a", { hasText: "Mulai Belajar Gratis" });
    await expect(ctaBtn).toBeVisible();
    await expect(ctaBtn).toHaveAttribute("href", "/kursus");
  });

  test("section 6 unit bisnis tampil", async ({ page }) => {
    const section = page.locator("section").filter({ hasText: "6 Unit Bisnis" });
    await expect(section).toBeVisible();

    // Minimal 4 product cards visible
    const cards = page.locator("a.card-dark");
    await expect(cards).toHaveCount(6);
  });

  test("testimonial section tampil", async ({ page }) => {
    const section = page.locator("section").filter({ hasText: "Testimoni" });
    await expect(section).toBeVisible();
  });

  test("footer tampil dengan link navigasi", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Footer berisi link Kebijakan Privasi
    const privacyLink = footer.locator("a", { hasText: "Kebijakan Privasi" });
    await expect(privacyLink).toBeVisible();
  });

  test("navbar mobile toggle berfungsi (viewport mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Hamburger button visible di mobile
    const hamburger = page.locator('button[aria-label="Buka menu"]');
    await expect(hamburger).toBeVisible();

    // Klik untuk buka menu
    await hamburger.click();
    const mobileMenu = page.locator("#mobile-nav-menu");
    await expect(mobileMenu).toBeVisible();

    // Tombol berubah menjadi tutup
    const closeBtn = page.locator('button[aria-label="Tutup menu"]');
    await expect(closeBtn).toBeVisible();
  });
});

test.describe("API health check", () => {
  test("GET /api/health returns 200 healthy", async ({ request }) => {
    const response = await request.get("http://127.0.0.1:4000/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json() as { status: string; service: string };
    expect(body.status).toBe("healthy");
    expect(body.service).toContain("Jago Akademi");
  });
});

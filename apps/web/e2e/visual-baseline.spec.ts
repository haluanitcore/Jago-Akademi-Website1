/**
 * Visual Baseline — Dark Theme "Before" Snapshots
 * Dijalankan SEBELUM migrasi light theme (Phase 0).
 * Screenshots disimpan sebagai referensi perbandingan di tiap Phase berikutnya.
 * Jalankan: pnpm playwright test visual-baseline --update-snapshots
 */

import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 320, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1024, height: 768 },
  { name: "wide", width: 1440, height: 900 },
] as const;

const ROUTES = [
  { name: "homepage", path: "/" },
  { name: "e-course-landing", path: "/e-course" },
  { name: "level1-digital-marketing", path: "/e-course/digital-marketing" },
  { name: "level2-marketing-management", path: "/e-course/digital-marketing/marketing-management" },
  { name: "level3-marketing-intro", path: "/e-course/digital-marketing/marketing-management/marketing-introduction" },
  { name: "mentor-ahmad-fauzi", path: "/mentor/ahmad-fauzi" },
] as const;

for (const route of ROUTES) {
  for (const vp of VIEWPORTS) {
    test(`baseline: ${route.name} @ ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route.path, { waitUntil: "networkidle" });

      await page.evaluate(() => document.fonts.ready);

      await expect(page).toHaveScreenshot(
        `${route.name}--${vp.name}--${vp.width}.png`,
        {
          fullPage: true,
          animations: "disabled",
          threshold: 0.1,
        }
      );
    });
  }
}

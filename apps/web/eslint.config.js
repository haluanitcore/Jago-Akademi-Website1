import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // `<img>` is intentional for arbitrary user-provided URLs (avatars, course
      // thumbnails, uploaded event/blog covers) where next/image's domain
      // allowlist would break rendering at runtime. Migrating these to a custom
      // next/image CDN loader is tracked as BL-08 (Phase 5 / TASK-060 performance).
      "@next/next/no-img-element": "off",
    },
  },
];

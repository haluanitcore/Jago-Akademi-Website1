/**
 * Feature flags (TASK-053). Default OFF for anything not yet built, so unbuilt
 * features/links never surface in production. Enable per-env with
 * `NEXT_PUBLIC_FEATURE_*=true` once the corresponding task ships.
 *
 * These are inlined at build time (NEXT_PUBLIC_*), so toggling requires a rebuild.
 */
const on = (v: string | undefined): boolean => v === "true" || v === "1";

export const features = {
  // Business-unit landing pages (currently "Segera Hadir" placeholders)
  marketplace: on(process.env.NEXT_PUBLIC_FEATURE_MARKETPLACE),
  trainerProgram: on(process.env.NEXT_PUBLIC_FEATURE_TRAINER_PROGRAM),
  lmsLanding: on(process.env.NEXT_PUBLIC_FEATURE_LMS_LANDING),
  collaboration: on(process.env.NEXT_PUBLIC_FEATURE_COLLABORATION),
  affiliate: on(process.env.NEXT_PUBLIC_FEATURE_AFFILIATE),

  // Private Class package page (/kelas-privat) — courses with format
  // "private_class". OFF until the backend catalog endpoint ships.
  privateClass: on(process.env.NEXT_PUBLIC_FEATURE_PRIVATE_CLASS),

  // EPIC 7 features — post-Soft-Launch (TASK-090/092/093...)
  allAccess: on(process.env.NEXT_PUBLIC_FEATURE_ALL_ACCESS),
  learningPath: on(process.env.NEXT_PUBLIC_FEATURE_LEARNING_PATH),
  community: on(process.env.NEXT_PUBLIC_FEATURE_COMMUNITY),
  gamification: on(process.env.NEXT_PUBLIC_FEATURE_GAMIFICATION),

  // Alumni stories page (/alumni) — approved alumni testimonials. OFF until
  // the testimonials endpoint ships with real, consented stories (BL-28).
  alumni: on(process.env.NEXT_PUBLIC_FEATURE_ALUMNI),
  // Member portfolio showcase (/portofolio-member) — published member
  // portfolios. OFF until the portfolios endpoint ships.
  portfolio: on(process.env.NEXT_PUBLIC_FEATURE_PORTFOLIO),
} as const;

export type FeatureKey = keyof typeof features;

export function isEnabled(key: FeatureKey): boolean {
  return features[key];
}

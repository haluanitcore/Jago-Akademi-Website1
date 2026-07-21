/**
 * Site-wide contact configuration (BL-45).
 *
 * Business WhatsApp number in international format without "+", spaces, or
 * dashes — the exact form the wa.me deep-link expects. Can be overridden per
 * environment via NEXT_PUBLIC_WA_NUMBER (build-time: Next.js inlines
 * NEXT_PUBLIC_* variables into the client bundle at compile time).
 */
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6285283423737";

/**
 * Human-readable form of WA_NUMBER for display, e.g. "+62 852-8342-3737".
 * Falls back to a plain "+<digits>" when the number does not match the
 * expected Indonesian format.
 */
export const WA_NUMBER_DISPLAY =
  WA_NUMBER.startsWith("62") && /^\d{10,15}$/.test(WA_NUMBER)
    ? `+62 ${WA_NUMBER.slice(2).replace(/^(\d{3})(\d{4})(\d+)$/, "$1-$2-$3")}`
    : `+${WA_NUMBER}`;

/**
 * Build a WhatsApp chat deep link, optionally with a URL-encoded prefilled
 * message (wa.me `?text=` parameter).
 */
export function waLink(text?: string): string {
  const base = `https://wa.me/${WA_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Returns the API base URL appropriate for the current environment.
 * - On the SERVER (SSR): uses absolute URL to backend (e.g., http://localhost:4000)
 * - On the BROWSER (client): returns "" (empty string) so requests are relative (/api/*)
 *   and go through the Next.js proxy rewrite to avoid CORS issues.
 */
export function getApiBase(): string {
  if (typeof window === "undefined") {
    // Server-side: use absolute URL
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  }
  // Client-side: use relative path, goes through Next.js /api/* proxy
  return "";
}

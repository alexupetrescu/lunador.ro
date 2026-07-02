/**
 * Normalize a media asset URL for use in the browser.
 *
 * The backend now returns relative /media/... paths, but older cached
 * responses (or a misconfigured PUBLIC_SITE_URL) may still contain absolute
 * URLs pointing at the internal Django host (127.0.0.1/localhost). Those are
 * unreachable from a visitor's browser, so strip them down to the same-origin
 * path served by the Next.js /media rewrite.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(\/media\/.*)$/);
  if (m) return m[1];
  return url;
}

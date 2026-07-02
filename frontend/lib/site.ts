export const siteConfig = {
  name: "lunador.ro",
  title: "lunador.ro",
  description:
    "Slow essays on the meaning of a life and the physics of the sky it happens under.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  locale: "en_US",
  author: {
    name: "Lunador",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  },
} as const;

export function absoluteUrl(path: string): string {
  // Rewrite internal media hosts (e.g. http://127.0.0.1:8010/media/...) to the
  // public site origin so OG/JSON-LD metadata never leaks unreachable URLs.
  const internalMedia = path.match(
    /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(\/media\/.*)$/,
  );
  if (internalMedia) path = internalMedia[1];
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

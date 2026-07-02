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
  if (/^https?:\/\//.test(path)) return path;
  return `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

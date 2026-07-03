import type { NextConfig } from "next";

// Fall back to DJANGO_INTERNAL_API_URL (the documented production var) so the
// /media rewrite reaches Gunicorn even when DJANGO_API_PROXY_TARGET is unset.
// A wrong target here breaks next/image with 400 "not a valid image".
const djangoTarget =
  process.env.DJANGO_API_PROXY_TARGET ||
  process.env.DJANGO_INTERNAL_API_URL ||
  "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Keep trailing slashes on proxied Django API paths (see app/api/[[...path]]/route.ts).
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        // Django-served media originals; kept same-origin so next/image can
        // optimize them and session cookies stay first-party.
        source: "/media/:path*",
        destination: `${djangoTarget}/media/:path*`,
      },
    ];
  },
  images: {
    // Media is proxied through the same origin under /media, so local paths are
    // enough; next/image optimizes the Django-served originals on demand.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;

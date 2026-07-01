import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const djangoTarget =
      process.env.DJANGO_API_PROXY_TARGET || "http://127.0.0.1:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${djangoTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
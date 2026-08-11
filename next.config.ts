import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable gzip compression: Next's prerender cache serves Content-Encoding:
  // gzip headers with mismatched bodies through the reverse proxy, which
  // browsers cannot inflate (renders as an empty page). Pages are ~50KB;
  // skipping compression is a non-issue and guarantees correct rendering.
  compress: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'www.w3schools.com' },
    ],
  },
};

export default nextConfig;

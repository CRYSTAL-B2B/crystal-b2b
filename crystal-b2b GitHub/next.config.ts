import type { NextConfig } from "next";

// Static export for GitHub Pages: no Node server, so no API routes, no
// on-the-fly image optimization, and no custom response headers (Pages
// doesn't support them — see docs/GITHUB_PAGES.md for what that costs).
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: false,
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;

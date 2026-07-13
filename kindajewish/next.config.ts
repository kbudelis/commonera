import type { NextConfig } from "next";

// The commonera GitHub Pages workflow builds with BASE_PATH=/commonera/kindajewish/
const base = process.env.BASE_PATH?.replace(/\/+$/, "") ?? "";

const nextConfig: NextConfig = {
  output: "export",
  // Directory-style URLs (holidays/hanukkah/index.html) so deep links and
  // refreshes work on GitHub Pages.
  trailingSlash: true,
  basePath: base || undefined,
  // Static export has no image-optimization server, and next/image does not
  // apply basePath to unoptimized src values — components prefix it themselves.
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: base,
  },
};

export default nextConfig;

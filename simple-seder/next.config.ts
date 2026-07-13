import type { NextConfig } from "next";

const rawBasePath = process.env.BASE_PATH ?? "";
const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");

const nextConfig: NextConfig = {
  ...(basePath ? { output: "export", basePath, assetPrefix: basePath, trailingSlash: true } : {}),
  env: {
    NEXT_PUBLIC_STATIC_DEMO: basePath ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;

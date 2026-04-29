import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  watchOptions: {
    pollIntervalMs: 1000,
  },
  outputFileTracingExcludes: {
    "/*": [
      "./tmp/**/*",
      "./output/**/*",
      "./Support materials/**/*",
      "./pdf reports/**/*",
      "./docs/claude-pdf-handoff/**/*",
      "./Screenshot*.png",
      "./public/**/*.pdf",
      "./public/**/*.psd",
      "./public/**/*.ai",
      "./public/**/*.sketch",
      "./public/**/*.mp4",
      "./public/**/*.mov",
      "./public/**/*.zip",
    ],
  },
};

export default nextConfig;

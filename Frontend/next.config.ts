import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep the workspace root pinned so a parent-directory lockfile
    // doesn't steal Turbopack's project root detection.
    root: path.join(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    // Keep the workspace root pinned so a parent-directory lockfile
    // doesn't steal Turbopack's project root detection.
    root: configDir,
  },
};

export default nextConfig;

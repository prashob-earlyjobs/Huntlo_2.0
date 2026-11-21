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
  async redirects() {
    return [
      { source: "/new", destination: "/", permanent: true },
      {
        source: "/huntlo-discovery-call",
        destination: "https://cal.id/team/huntlo/huntlo-discovery-call",
        permanent: false,
      },
      {
        source: "/book-a-demo",
        destination: "https://calendly.com/huntlo-info/15min",
        permanent: true,
      },
      {
        source: "/book-demo",
        destination: "https://calendly.com/huntlo-info/15min",
        permanent: true,
      },
      { source: "/compare/eightfold", destination: "/compare/eightfold-ai", statusCode: 301 },
      {
        source: "/solutions/gccs",
        destination: "/solutions/global-capability-centers",
        statusCode: 301,
      },
      {
        source: "/solutions",
        destination: "/solutions/ai-hiring-agents",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

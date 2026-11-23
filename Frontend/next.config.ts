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
      {
        source: "/platform/voice",
        destination: "/platform/voice-ai",
        permanent: true,
      },
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
        source: "/compare/humanly",
        destination: "/compare/huntlo-vs-humanly",
        statusCode: 301,
      },
      {
        source: "/compare/paradox-ai",
        destination: "/compare/huntlo-vs-paradox",
        statusCode: 301,
      },
      {
        source: "/compare/heymilo",
        destination: "/compare/huntlo-vs-heymilo",
        statusCode: 301,
      },
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
      {
        source: "/agents/ai-screening-agent",
        destination: "/solutions/ai-screening",
        permanent: true,
      },
      {
        source: "/agents/interview-scheduling-agent",
        destination: "/solutions/interview-coordination",
        permanent: true,
      },
      {
        source: "/agents/joining-confirmation",
        destination: "/solutions/joining-confirmation",
        permanent: true,
      },
      {
        source: "/agents/pre-joining-engagement",
        destination: "/solutions/pre-joining-follow-ups",
        permanent: true,
      },
      {
        source: "/agents/onboarding-document-readiness",
        destination: "/solutions/day-1-readiness",
        permanent: true,
      },
      {
        source: "/agents/new-hire-check-in-surveys",
        destination: "/solutions/employee-check-ins",
        permanent: true,
      },
      {
        source: "/agents/employee-pulse-surveys",
        destination: "/solutions/workforce-feedback",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

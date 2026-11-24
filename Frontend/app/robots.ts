import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/siteMetadata";

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/admin", "/onboarding", "/candidates"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
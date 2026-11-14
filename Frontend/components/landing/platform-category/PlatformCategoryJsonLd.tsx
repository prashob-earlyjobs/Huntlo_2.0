import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { PLATFORM_PATH, type PlatformCategoryPageContent } from "@/lib/platformCategoryPages";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export function PlatformCategoryJsonLd({ page }: { page: PlatformCategoryPageContent }) {
  return (
    <JsonLd
      data={[
        webPageJsonLd({
          name: page.seo.title,
          description: page.seo.description,
          url: absoluteUrl(page.path),
          primaryImageOfPage: OG_IMAGES.platform,
          aboutName: page.name,
          mainEntityName: `Huntlo ${page.name}`,
        }),
        breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Platform", href: PLATFORM_PATH },
          { name: page.name, href: page.path },
        ]),
        faqPageJsonLd([...page.faqs]),
      ]}
    />
  );
}

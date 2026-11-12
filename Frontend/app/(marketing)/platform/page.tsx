import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { PlatformPageHero } from "@/components/landing/platform-category/PlatformSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { MARKETING_PAGES, marketingPageMetadata } from "@/lib/marketingPages";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata = marketingPageMetadata("platform");

export default function PlatformPage() {
  const page = MARKETING_PAGES.platform;

  return (
    <div className="landing-page selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <JsonLd
        data={[
          webPageJsonLd({
            name: page.title,
            description: page.description,
            url: absoluteUrl(page.path),
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Huntlo Platform",
            mainEntityName: "Huntlo AI Hiring Intelligence Infrastructure",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Platform", href: page.path },
          ]),
        ]}
      />
      <LandingNav />
      <main>
        <PlatformPageHero />
      </main>
      <LandingFooter />
    </div>
  );
}

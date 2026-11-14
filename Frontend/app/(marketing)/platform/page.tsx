import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { PlatformHubContent } from "@/components/landing/platform-category/PlatformSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { PLATFORM_PATH } from "@/lib/platformCategoryPages";
import {
  PLATFORM_HUB_FAQS,
  PLATFORM_HUB_GEO,
  PLATFORM_HUB_SEO,
  platformHubMetadata,
} from "@/lib/platformHub";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata = platformHubMetadata();

export default function PlatformPage() {
  return (
    <div className="landing-page selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <JsonLd
        data={[
          webPageJsonLd({
            name: PLATFORM_HUB_SEO.title,
            description: PLATFORM_HUB_SEO.description,
            url: absoluteUrl(PLATFORM_PATH),
            primaryImageOfPage: OG_IMAGES.platform,
            aboutName: "Huntlo Platform",
            aboutSoftware: true,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Platform", href: PLATFORM_PATH },
          ]),
          faqPageJsonLd([...PLATFORM_HUB_FAQS]),
        ]}
      />
      <LandingNav />
      <main>
        <PlatformHubContent />
      </main>
      <LandingFooter aiAskPrompt={PLATFORM_HUB_GEO.askPrompt} aiAskTopic={PLATFORM_HUB_GEO.askTopic} />
    </div>
  );
}

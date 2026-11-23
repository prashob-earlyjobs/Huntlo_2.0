import type { Metadata } from "next";

import { ContactPageContent } from "@/components/landing/ContactPageContent";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";

const PAGE_PATH = "/contact";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Huntlo | Sales, Support & General Enquiries",
  description:
    "Contact Huntlo for product enquiries, AI voice solutions, partnerships, demos and general questions. Connect with our team.",
  ogImage: OG_IMAGES.platform,
  path: PAGE_PATH,
});

export default function ContactPage() {
  return (
    <div className="landing-page selection:bg-[#2563EB] selection:text-[#c1cfff]">
      <LandingNav />

      <main className="bg-white px-4 py-12 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto w-full max-w-[600px] lg:max-w-5xl">
          <div className="max-w-[600px]">
            <h1 className="text-3xl font-bold tracking-tight text-[#141b2b] md:text-4xl">
              Let&apos;s Talk.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Have a question about Huntlo? Share a few details and our team will get back to you.
            </p>
          </div>
          <ContactPageContent />
        </div>
      </main>

      <LandingFooter
        showAiAskBand
        aiAskTopic="contacting Huntlo"
        aiAskPrompt="How can I contact Huntlo for product enquiries, demos, partnerships or support?"
      />
    </div>
  );
}

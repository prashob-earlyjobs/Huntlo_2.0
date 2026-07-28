import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MarketingPageShell } from "@/components/landing/MarketingPageShell";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  contactPageJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  BOOK_DEMO_FAQ,
  BOOK_DEMO_GEO_ASK_PROMPT,
  BOOK_DEMO_GEO_ASK_TOPIC,
  MARKETING_PAGES,
} from "@/lib/marketingPages";
import {
  absoluteOgImage,
  absoluteUrl,
  buildPageMetadata,
  OG_IMAGES,
} from "@/lib/siteMetadata";

const page = MARKETING_PAGES.bookDemo;
const PAGE_PATH = page.path;
const PAGE_TITLE = "Book a Demo | Huntlo AI – Agentic AI Hiring Infrastructure";
const META_DESCRIPTION =
  "Book a personalized demo of Huntlo AI, the Agentic AI Hiring Infrastructure. See how AI-powered sourcing, outreach, voice and video interviews, and recruiter workflows can work for your team.";
const OG_TITLE = "Book a Demo | Huntlo AI";
const OG_DESCRIPTION =
  "See Huntlo AI's Agentic AI Hiring Infrastructure in action. Book a personalized demo covering sourcing, outreach, AI interviews, and recruiter workflows.";
const TWITTER_DESCRIPTION =
  "Book a personalized demo of Huntlo AI's Agentic AI Hiring Infrastructure.";
const CATEGORY = "Agentic AI Hiring Infrastructure";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: META_DESCRIPTION,
  ogTitle: OG_TITLE,
  ogDescription: OG_DESCRIPTION,
  twitterTitle: OG_TITLE,
  twitterDescription: TWITTER_DESCRIPTION,
  siteName: "Huntlo AI",
  ogImage: OG_IMAGES.bookDemo,
  path: PAGE_PATH,
});

export default function BookDemoPage() {
  const pageUrl = absoluteUrl(PAGE_PATH);

  const jsonLdBlocks = [
    contactPageJsonLd({
      name: "Book a Demo | Huntlo AI",
      description:
        "Book a personalized demo of Huntlo AI's Agentic AI Hiring Infrastructure, covering AI-powered sourcing, outreach, voice and video interviews, and recruiter workflows.",
      url: pageUrl,
      aboutName: CATEGORY,
    }),
    faqPageJsonLd([...BOOK_DEMO_FAQ]),
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Book a Demo", href: PAGE_PATH },
    ]),
    webPageJsonLd({
      name: "Book a Demo | Huntlo AI",
      url: pageUrl,
      description:
        "Book a personalized demo of Huntlo AI's Agentic AI Hiring Infrastructure.",
      primaryImageOfPage: absoluteOgImage(OG_IMAGES.bookDemo),
      aboutName: CATEGORY,
    }),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} />
      <MarketingPageShell
        eyebrow={page.eyebrow}
        title={page.title}
        description={page.description}
        aiAskPrompt={BOOK_DEMO_GEO_ASK_PROMPT}
        aiAskTopic={BOOK_DEMO_GEO_ASK_TOPIC}
        afterContent={<BookDemoFaqSection />}
      >
        <div className="mt-6">
          <BookDemoLink className="inline-flex rounded-full bg-[#0050cb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0050cb]/20 transition-colors hover:bg-[#003fa4]">
            Schedule your demo
          </BookDemoLink>
        </div>
      </MarketingPageShell>
    </>
  );
}

function BookDemoFaqSection() {
  return (
    <section
      className="faq-section border-t border-[#c3c6d6]/20 bg-white px-4 py-16 md:px-8 md:py-20 lg:px-12"
      id="faq"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0050cb]">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#141b2b] md:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-10 space-y-8">
          {BOOK_DEMO_FAQ.map((item) => (
            <div key={item.question}>
              <h3 className="text-lg font-semibold text-[#141b2b]">{item.question}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                {emphasizeCategoryPhrase(item.answer)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function emphasizeCategoryPhrase(text: string) {
  const index = text.indexOf(CATEGORY);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong>{CATEGORY}</strong>
      {text.slice(index + CATEGORY.length)}
    </>
  );
}

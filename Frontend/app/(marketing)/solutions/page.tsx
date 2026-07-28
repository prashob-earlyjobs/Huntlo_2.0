import { SolutionPageLayout } from "@/components/landing/SolutionPageLayout";
import { SolutionsIndexContent } from "@/components/landing/SolutionsIndexContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  absoluteOgImage,
  absoluteUrl,
  buildPageMetadata,
  OG_IMAGES,
} from "@/lib/siteMetadata";
import {
  listSolutionPages,
  SOLUTIONS_INDEX_FAQ,
  solutionCollectionItemName,
} from "@/lib/solutionPages";

const PAGE_PATH = "/solutions";
const PAGE_TITLE = "Agentic AI Hiring Infrastructure — Solutions by Team | Huntlo AI";
const META_DESCRIPTION =
  "Huntlo AI is an Agentic AI Hiring Infrastructure built for every type of hiring team. Explore solutions for staffing agencies, recruitment firms, executive search, startups, enterprise hiring, and Global Capability Centers (GCCs).";
const OG_DESCRIPTION =
  "See how Huntlo AI's Agentic AI Hiring Infrastructure adapts to staffing agencies, recruitment firms, executive search, startups, enterprise hiring, and GCCs.";
const TWITTER_DESCRIPTION =
  "Explore Huntlo AI's Agentic AI Hiring Infrastructure across staffing agencies, recruitment firms, executive search, startups, enterprise hiring, and GCCs.";
const GEO_ASK_TOPIC = "Huntlo AI Solutions";
const GEO_ASK_PROMPT =
  "What is Huntlo AI Agentic AI Hiring Infrastructure (https://huntlo.ai/solutions)? Explain how it helps different hiring teams like staffing agencies, recruitment firms, executive search, startups, enterprise talent teams and GCCs automate sourcing, outreach, AI interviews and hiring workflows.";

export const metadata = buildPageMetadata({
  title: PAGE_TITLE,
  description: META_DESCRIPTION,
  ogDescription: OG_DESCRIPTION,
  twitterDescription: TWITTER_DESCRIPTION,
  siteName: "Huntlo AI",
  ogImage: OG_IMAGES.solutions,
  path: PAGE_PATH,
});

export default function SolutionsPage() {
  const pageUrl = absoluteUrl(PAGE_PATH);
  const solutionPages = listSolutionPages();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: PAGE_PATH },
  ];

  const jsonLdBlocks = [
    breadcrumbJsonLd(
      breadcrumbItems.map((item) => ({
        name: item.label,
        href: item.href,
      }))
    ),
    collectionPageJsonLd({
      name: "Agentic AI Hiring Infrastructure — Solutions by Team",
      description:
        "Huntlo AI is an Agentic AI Hiring Infrastructure built for every type of hiring team, from staffing agencies and recruitment firms to executive search, startups, enterprise hiring, and Global Capability Centers.",
      url: pageUrl,
      items: solutionPages.map((page) => ({
        name: solutionCollectionItemName(page),
        href: page.href,
      })),
    }),
    webPageJsonLd({
      name: "Agentic AI Hiring Infrastructure — Solutions by Team",
      url: pageUrl,
      description:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for every type of hiring team, with dedicated solutions for staffing agencies, recruitment firms, executive search, startups, enterprise hiring, and GCCs.",
      primaryImageOfPage: absoluteOgImage(OG_IMAGES.solutions),
      aboutName: "Agentic AI Hiring Infrastructure",
    }),
    faqPageJsonLd(SOLUTIONS_INDEX_FAQ),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} />
      <SolutionPageLayout
        breadcrumbItems={[
          { label: "Home", href: "/" },
          { label: "Solutions" },
        ]}
        aiAskPrompt={GEO_ASK_PROMPT}
        aiAskTopic={GEO_ASK_TOPIC}
      >
        <SolutionsIndexContent />
      </SolutionPageLayout>
    </>
  );
}

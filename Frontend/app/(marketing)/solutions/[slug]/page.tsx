import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SolutionPageContent } from "@/components/landing/SolutionPageContent";
import { SolutionPageLayout } from "@/components/landing/SolutionPageLayout";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import {
  getSolutionPage,
  SOLUTION_PAGE_SLUGS,
} from "@/lib/solutionPages";
import {
  absoluteOgImage,
  absoluteUrl,
  buildPageMetadata,
  OG_IMAGES,
} from "@/lib/siteMetadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SOLUTION_PAGE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) {
    return { title: "Solution not found | Huntlo" };
  }
  return buildPageMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    ogDescription: page.ogDescription,
    twitterDescription: page.twitterDescription,
    siteName: page.ogSiteName,
    ogImage: OG_IMAGES.solutions,
    path: page.href,
  });
}

export default async function SolutionSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) notFound();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Solutions", href: "/solutions" },
    { label: page.breadcrumbLabel ?? page.title.replace(/^For /, "") },
  ];

  const pageUrl = absoluteUrl(page.href);
  const jsonLdBlocks: Record<string, unknown>[] = [
    breadcrumbJsonLd(
      breadcrumbItems.map((item) => ({
        name: item.label,
        href: item.href,
      }))
    ),
  ];

  const category = "Agentic AI Hiring Infrastructure";
  const solutionSchemas: Record<
    string,
    {
      serviceName: string;
      webPageName?: string;
      serviceDescription: string;
      webPageDescription: string;
    }
  > = {
    "enterprise-hiring": {
      serviceName: "Agentic AI Hiring Infrastructure for Enterprise Hiring",
      serviceDescription:
        "Huntlo AI helps enterprise talent acquisition teams automate sourcing, outreach, AI voice interviews, AI video interviews, cross-departmental recruiter collaboration and high-volume hiring workflows while keeping talent teams in control.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for enterprise talent teams by automating sourcing, outreach, AI interviews and high-volume recruiter workflows.",
    },
    "executive-search": {
      serviceName: "Agentic AI Hiring Infrastructure for Executive Search",
      serviceDescription:
        "Huntlo AI helps executive search and retained search firms automate candidate mapping, confidential outreach, AI voice interviews, AI video interviews, consultant collaboration and search workflows while keeping consultants in control.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for executive search firms by automating candidate mapping, confidential outreach, AI interviews and consultant workflows.",
    },
    "recruitment-firms": {
      serviceName: "Agentic AI Hiring Infrastructure for Recruitment Firms",
      serviceDescription:
        "Huntlo AI helps recruitment firms automate sourcing, outreach, AI voice interviews, AI video interviews, recruiter collaboration and placement workflows across contingency and permanent desks while keeping recruiters in control.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for recruitment firms by automating sourcing, outreach, AI interviews and placement workflows.",
    },
    "staffing-agencies": {
      serviceName: "Agentic AI Hiring Infrastructure for Staffing Agencies",
      serviceDescription:
        "Huntlo AI helps staffing agencies automate sourcing, outreach, AI voice interviews, AI video interviews, recruiter collaboration and hiring workflows while keeping recruiters in control.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for staffing agencies by automating sourcing, outreach, AI interviews and recruiter workflows.",
    },
    startups: {
      serviceName: "Agentic AI Hiring Infrastructure for Startups",
      serviceDescription:
        "Huntlo AI helps startups automate sourcing, outreach, AI voice interviews, AI video interviews, hiring manager collaboration and recruiting workflows so lean teams can hire fast without a dedicated recruiting function.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for startups by automating sourcing, outreach, AI interviews and founder-led hiring workflows.",
    },
    gccs: {
      serviceName: "Agentic AI Hiring Infrastructure for Global Capability Centers",
      webPageName:
        "Agentic AI Hiring Infrastructure for Global Capability Centers (GCCs)",
      serviceDescription:
        "Huntlo AI helps Global Capability Centers (GCCs) automate sourcing, outreach, AI voice interviews, AI video interviews, recruiter collaboration and high-volume hiring workflows while keeping talent teams in control.",
      webPageDescription:
        "Huntlo AI provides Agentic AI Hiring Infrastructure for Global Capability Centers by automating sourcing, outreach, AI interviews and high-volume hiring workflows.",
    },
  };

  const schema = solutionSchemas[slug];
  if (schema) {
    jsonLdBlocks.push(
      serviceJsonLd({
        name: schema.serviceName,
        serviceType: category,
        description: schema.serviceDescription,
        url: pageUrl,
        mainEntityName: category,
      }),
      webPageJsonLd({
        name: schema.webPageName ?? schema.serviceName,
        url: pageUrl,
        description: schema.webPageDescription,
        primaryImageOfPage: absoluteOgImage(OG_IMAGES.solutions),
        aboutName: category,
        mainEntityName: category,
      })
    );
  }

  if (page.faq?.length) {
    jsonLdBlocks.push(faqPageJsonLd(page.faq));
  }

  return (
    <>
      <JsonLd data={jsonLdBlocks} />
      <SolutionPageLayout page={page} breadcrumbItems={breadcrumbItems}>
        <SolutionPageContent page={page} />
      </SolutionPageLayout>
    </>
  );
}

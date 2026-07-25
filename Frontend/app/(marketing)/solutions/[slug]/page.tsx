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
    { label: page.title.replace(/^For /, "") },
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

  if (slug === "enterprise-hiring") {
    const category = "Agentic AI Hiring Infrastructure";
    jsonLdBlocks.push(
      serviceJsonLd({
        name: "Agentic AI Hiring Infrastructure for Enterprise Hiring",
        serviceType: category,
        description:
          "Huntlo AI helps enterprise talent acquisition teams automate sourcing, outreach, AI voice interviews, AI video interviews, cross-departmental recruiter collaboration and high-volume hiring workflows while keeping talent teams in control.",
        url: pageUrl,
        mainEntityName: category,
      }),
      webPageJsonLd({
        name: "Agentic AI Hiring Infrastructure for Enterprise Hiring",
        url: pageUrl,
        description:
          "Huntlo AI provides Agentic AI Hiring Infrastructure for enterprise talent teams by automating sourcing, outreach, AI interviews and high-volume recruiter workflows.",
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

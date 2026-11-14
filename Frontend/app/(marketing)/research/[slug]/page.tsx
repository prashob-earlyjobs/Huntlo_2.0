import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResearchReportPage } from "@/components/landing/research/ResearchReportPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { plainText } from "@/lib/learnPages";
import {
  getResearchReport,
  isResearchPublished,
  RESEARCH_OG_IMAGE,
  RESEARCH_REPORTS,
  researchBreadcrumbs,
  researchPath,
} from "@/lib/researchPages";
import { absoluteUrl, buildPageMetadata } from "@/lib/siteMetadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return RESEARCH_REPORTS.map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const report = getResearchReport(slug);
  if (!report) {
    return { title: "Research not found | Huntlo" };
  }
  const metadata = buildPageMetadata({
    title: report.seo.title,
    description: report.seo.description,
    ogTitle: report.seo.ogTitle,
    ogDescription: report.seo.ogDescription,
    ogImage: RESEARCH_OG_IMAGE,
    path: researchPath(report.slug),
  });
  return {
    ...metadata,
    // Methodology-only pages carry no findings yet, so they stay out of the index until data is published.
    ...(isResearchPublished(report) ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: report.published,
      modifiedTime: report.lastUpdated,
    },
  };
}

export default async function ResearchStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const report = getResearchReport(slug);
  if (!report) {
    notFound();
  }

  const url = absoluteUrl(researchPath(report.slug));

  return (
    <>
      <JsonLd
        data={[
          isResearchPublished(report)
            ? articleJsonLd({
                headline: report.title,
                description: report.seo.description,
                url,
                image: RESEARCH_OG_IMAGE,
                datePublished: report.published,
                dateModified: report.lastUpdated,
                aboutName: report.name,
              })
            : webPageJsonLd({
                name: report.title,
                url,
                description: report.seo.description,
                aboutName: report.name,
                dateModified: report.lastUpdated,
              }),
          breadcrumbJsonLd(researchBreadcrumbs(report)),
          faqPageJsonLd(report.faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) }))),
        ]}
      />
      <ResearchReportPage report={report} />
    </>
  );
}

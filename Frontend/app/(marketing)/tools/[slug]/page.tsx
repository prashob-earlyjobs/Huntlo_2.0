import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CostPerHireCalculator } from "@/components/landing/tools/CostPerHireCalculator";
import { RoiCalculator } from "@/components/landing/tools/RoiCalculator";
import { ToolPage } from "@/components/landing/tools/ToolPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, webApplicationJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { plainText } from "@/lib/learnPages";
import { absoluteUrl, buildPageMetadata } from "@/lib/siteMetadata";
import { getToolPage, TOOL_PAGES, TOOLS_OG_IMAGE, toolBreadcrumbs, toolPath, type ToolSlug } from "@/lib/toolsPages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const CALCULATORS: Record<ToolSlug, () => ReactNode> = {
  "cost-per-hire-calculator": () => <CostPerHireCalculator />,
  "recruitment-automation-roi-calculator": () => <RoiCalculator />,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOL_PAGES.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolPage(slug);
  if (!tool) {
    return { title: "Tool not found | Huntlo" };
  }
  return buildPageMetadata({
    title: tool.seo.title,
    description: tool.seo.description,
    ogTitle: tool.seo.ogTitle,
    ogDescription: tool.seo.ogDescription,
    ogImage: TOOLS_OG_IMAGE,
    path: toolPath(tool.slug),
  });
}

export default async function ToolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolPage(slug);
  if (!tool) {
    notFound();
  }

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: tool.title,
            url: absoluteUrl(toolPath(tool.slug)),
            description: tool.seo.description,
            aboutName: tool.name,
            dateModified: tool.lastUpdated,
          }),
          webApplicationJsonLd({
            name: tool.name,
            url: absoluteUrl(toolPath(tool.slug)),
            description: tool.seo.description,
          }),
          breadcrumbJsonLd(toolBreadcrumbs(tool)),
          faqPageJsonLd(tool.faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) }))),
        ]}
      />
      <ToolPage tool={tool} calculator={CALCULATORS[tool.slug]()} />
    </>
  );
}

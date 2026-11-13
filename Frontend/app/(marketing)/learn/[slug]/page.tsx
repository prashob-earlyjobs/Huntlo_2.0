import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LearnArticlePage } from "@/components/landing/learn/LearnArticlePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonLd";
import {
  getLearnPage,
  LEARN_OG_IMAGE,
  LEARN_PAGES,
  learnBreadcrumbs,
  learnPath,
  plainText,
} from "@/lib/learnPages";
import { absoluteUrl, buildPageMetadata } from "@/lib/siteMetadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getLearnPage(slug);
  if (!page) {
    return { title: "Guide not found | Huntlo" };
  }
  const metadata = buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    ogTitle: page.seo.ogTitle,
    ogDescription: page.seo.ogDescription,
    ogImage: LEARN_OG_IMAGE,
    path: learnPath(page.slug),
  });
  return {
    ...metadata,
    openGraph: {
      ...metadata.openGraph,
      type: "article",
      publishedTime: page.published,
      modifiedTime: page.lastUpdated,
    },
  };
}

export default async function LearnGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const page = getLearnPage(slug);
  if (!page) {
    notFound();
  }

  const url = absoluteUrl(learnPath(page.slug));

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            headline: page.title,
            description: page.seo.description,
            url,
            image: LEARN_OG_IMAGE,
            datePublished: page.published,
            dateModified: page.lastUpdated,
            aboutName: page.name,
          }),
          breadcrumbJsonLd(learnBreadcrumbs(page)),
          faqPageJsonLd(
            page.faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) })),
          ),
        ]}
      />
      <LearnArticlePage page={page} />
    </>
  );
}

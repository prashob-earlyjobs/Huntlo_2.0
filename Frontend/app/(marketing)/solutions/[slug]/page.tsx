import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SolutionDetailPage } from "@/components/landing/solutions/SolutionDetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import {
  getSolutionPage,
  SOLUTION_PAGES,
  solutionPath,
  SOLUTIONS_PATH,
} from "@/lib/solutionPages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SOLUTION_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) {
    return { title: "Solution not found | Huntlo" };
  }
  return buildPageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    ogImage: OG_IMAGES.solutions,
    path: solutionPath(page.slug),
  });
}

export default async function SolutionPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getSolutionPage(slug);
  if (!page) notFound();

  const path = solutionPath(page.slug);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: page.seo.title,
            description: page.seo.description,
            url: path,
            primaryImageOfPage: OG_IMAGES.solutions,
            aboutName: page.name,
            mainEntityName: `Huntlo ${page.name}`,
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Solutions", href: SOLUTIONS_PATH },
            { name: page.breadcrumb, href: path },
          ]),
          faqPageJsonLd(page.faqs),
        ]}
      />
      <SolutionDetailPage page={page} />
    </>
  );
}

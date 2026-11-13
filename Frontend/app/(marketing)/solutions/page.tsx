import { SolutionsHubPage } from "@/components/landing/solutions/SolutionsHubPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  webPageJsonLd,
} from "@/lib/jsonLd";
import { buildPageMetadata, OG_IMAGES } from "@/lib/siteMetadata";
import {
  SOLUTION_PAGES,
  SOLUTIONS_HUB,
  solutionPath,
  SOLUTIONS_PATH,
} from "@/lib/solutionPages";

export const metadata = buildPageMetadata({
  title: SOLUTIONS_HUB.seo.title,
  description: SOLUTIONS_HUB.seo.description,
  ogImage: OG_IMAGES.solutions,
  path: SOLUTIONS_PATH,
});

export default function SolutionsPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: SOLUTIONS_HUB.seo.title,
            description: SOLUTIONS_HUB.seo.description,
            url: SOLUTIONS_PATH,
            primaryImageOfPage: OG_IMAGES.solutions,
            aboutName: SOLUTIONS_HUB.name,
            mainEntityName: "Huntlo AI Hiring Intelligence Infrastructure",
          }),
          collectionPageJsonLd({
            name: SOLUTIONS_HUB.name,
            description: SOLUTIONS_HUB.seo.description,
            url: SOLUTIONS_PATH,
            items: SOLUTION_PAGES.map((page) => ({
              name: page.name,
              href: solutionPath(page.slug),
            })),
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Solutions", href: SOLUTIONS_PATH },
          ]),
          faqPageJsonLd(SOLUTIONS_HUB.faqs),
        ]}
      />
      <SolutionsHubPage />
    </>
  );
}

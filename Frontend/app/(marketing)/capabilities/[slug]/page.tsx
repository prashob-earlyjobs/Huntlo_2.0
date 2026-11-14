import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CapabilityDetailPage } from "@/components/landing/capabilities/CapabilityDetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { CAPABILITIES_PATH } from "@/lib/capabilities";
import { CAPABILITY_PAGES, capabilityPath, getCapabilityPage } from "@/lib/capabilityPages";
import { breadcrumbJsonLd, faqPageJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const OG_IMAGE_URL = `${OG_IMAGES.platform.startsWith("http") ? "" : "https://www.huntlo.ai"}${OG_IMAGES.platform}`;

export function generateStaticParams() {
  return CAPABILITY_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getCapabilityPage(slug);
  if (!page) {
    return { title: "Capability not found | Huntlo" };
  }
  const url = absoluteUrl(capabilityPath(page.slug));
  return {
    title: { absolute: page.seo.title },
    description: page.seo.description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: page.seo.ogTitle,
      description: page.seo.ogDescription,
      url,
      siteName: "Huntlo",
      type: "website",
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 626,
          alt: page.seo.ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo.ogTitle,
      description: page.seo.ogDescription,
      images: [OG_IMAGE_URL],
    },
  };
}

export default async function CapabilityPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getCapabilityPage(slug);
  if (!page) {
    notFound();
  }

  const path = capabilityPath(page.slug);

  const jsonLdBlocks: Record<string, unknown>[] = [
    webPageJsonLd({
      name: page.seo.title,
      description: page.seo.description,
      url: absoluteUrl(path),
      primaryImageOfPage: OG_IMAGES.platform,
      aboutName: page.name,
      aboutSoftware: true,
    }),
    breadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Capabilities", href: CAPABILITIES_PATH },
      { name: page.name, href: path },
    ]),
    faqPageJsonLd(page.faqs),
  ];

  return (
    <>
      <JsonLd data={jsonLdBlocks} />
      <CapabilityDetailPage page={page} />
    </>
  );
}

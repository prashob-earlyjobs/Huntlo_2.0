import Link from "next/link";

import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { JsonLd } from "@/components/seo/JsonLd";
import { MARKETING_PAGES, marketingPageMetadata } from "@/lib/marketingPages";
import { breadcrumbJsonLd, webPageJsonLd } from "@/lib/jsonLd";
import { RESOURCES_DIRECTORY } from "@/lib/resourcesDirectory";
import { absoluteUrl, OG_IMAGES } from "@/lib/siteMetadata";

export const metadata = marketingPageMetadata("resources");

export default function ResourcesPage() {
  const page = MARKETING_PAGES.resources;
  const pageUrl = absoluteUrl(page.path);

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: page.title,
            description: page.description,
            url: pageUrl,
            primaryImageOfPage: OG_IMAGES.resources,
            aboutName: "Huntlo Resources",
            mainEntityName: "Huntlo Resources Directory",
          }),
          breadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Resources", href: page.path },
          ]),
        ]}
      />
      <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f8fc] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
        <LandingNav />
        <main className="pt-16">
          <section className="relative overflow-hidden bg-[#050914] px-4 py-16 text-white md:px-8 md:py-24 lg:px-12">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_rgba(0,80,203,0.35),_transparent_55%)]"
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8eb0ff]">
                {page.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl text-[2rem] font-bold leading-tight tracking-tight md:text-[2.75rem]">
                Explore Huntlo&apos;s hiring intelligence pages
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
                {page.description} Browse every category, intelligence, and agent page in one place.
              </p>
            </div>
          </section>

          <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20 lg:px-12">
            <div className="space-y-14">
              {RESOURCES_DIRECTORY.map((group) => (
                <section key={group.title} aria-labelledby={`resources-${group.title}`}>
                  <h2
                    id={`resources-${group.title}`}
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]"
                  >
                    {group.title}
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="group flex h-full flex-col rounded-2xl border border-[#c3c6d6]/35 bg-white p-5 transition-colors hover:border-[#0050cb]/40 hover:bg-[#f1f3ff]"
                        >
                          <span className="text-sm font-bold text-[#141b2b] group-hover:text-[#0050cb]">
                            {item.label}
                          </span>
                          <span className="mt-2 text-sm leading-relaxed text-[#434654]">
                            {item.description}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </main>
        <LandingFooter
          aiAskTopic="Huntlo Resources"
          aiAskPrompt="What Huntlo hiring intelligence and AI agent pages are available on https://www.huntlo.ai/resources?"
        />
      </div>
    </>
  );
}

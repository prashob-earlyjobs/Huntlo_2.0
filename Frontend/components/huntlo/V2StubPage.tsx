"use client";

import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/huntlo/Navbar";
import { Footer } from "@/components/huntlo/Footer";
import { Button } from "@/components/huntlo/ui/button";
import { Eyebrow } from "@/components/huntlo/primitives";
import { V2_BOOK_DEMO_PATH, V2_HOME_PATH } from "@/lib/v2Nav";

export type V2StubRelated = { label: string; href: string };

type V2StubPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  related?: V2StubRelated[];
};

/** Temporary functional route shell until page content is approved. */
export function V2StubPage({ eyebrow, title, description, related = [] }: V2StubPageProps) {
  return (
    <div className="halo-home v2-home">
      <Navbar />
      <main className="page-frame">
        <section className="section-y">
          <div className="container-x max-w-3xl">
            <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <a href={V2_HOME_PATH} className="hover:text-foreground">
                    Home
                  </a>
                </li>
                <li aria-hidden>/</li>
                <li className="text-foreground" aria-current="page">
                  {title}
                </li>
              </ol>
            </nav>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display-tight mt-5 text-[clamp(2rem,1.4rem+2vw,3rem)]">{title}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Full page copy will be published when approved. Related verified pages remain available
              below.
            </p>
            {related.length > 0 && (
              <ul className="mt-8 space-y-2">
                {related.map((r) => (
                  <li key={r.href}>
                    <a
                      href={r.href}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      {r.label} <ArrowRight className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button variant="brand" size="lg" asChild>
                <a href={V2_BOOK_DEMO_PATH} target="_blank" rel="noopener noreferrer">
                  Book a Demo
                </a>
              </Button>
              <Button variant="quiet" size="lg" asChild>
                <a href={V2_HOME_PATH}>Back to Homepage</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer showAiAskBand />
    </div>
  );
}

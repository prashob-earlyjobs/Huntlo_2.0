import Link from "next/link";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  listSolutionPages,
  SOLUTIONS_INDEX_FAQ,
  solutionCollectionItemName,
} from "@/lib/solutionPages";

const SOLUTION_ICONS: Record<string, string> = {
  "staffing-agencies": "groups",
  "recruitment-firms": "trending_up",
  "executive-search": "person_search",
  startups: "rocket_launch",
  "enterprise-hiring": "apartment",
  gccs: "public",
};

const VALUE_PILLARS = [
  {
    icon: "travel_explore",
    title: "Source smarter",
    description: "AI discovery, enrichment, and talent pools tuned to your hiring model.",
  },
  {
    icon: "campaign",
    title: "Engage at scale",
    description: "Email and WhatsApp sequences with follow-ups that keep pipelines warm.",
  },
  {
    icon: "insights",
    title: "Hire with clarity",
    description: "Campaign visibility, reply tracking, and outcomes your team can act on.",
  },
];

const CATEGORY_PHRASE = "Agentic AI Hiring Infrastructure";

export function SolutionsIndexContent() {
  const pages = listSolutionPages();

  return (
    <>
      <section className="border-b border-[#c3c6d6]/20 bg-white px-4 py-14 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0050cb]">
              One platform, every hiring model
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#141b2b] md:text-3xl">
              Agentic AI Hiring Infrastructure for modern talent teams
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo combines AI sourcing, multi-channel outreach, and campaign operations so
              staffing agencies, recruitment firms, executive search, startups, enterprises, and
              Global Capability Centers (GCCs) can hire faster—with less manual work and more
              predictable pipeline.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VALUE_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-[#c3c6d6]/40 bg-[#faf9ff] p-6 text-center md:text-left"
              >
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9edff] text-[#0050cb] md:mx-0">
                  <MaterialIcon name={pillar.icon} className="text-[24px]" />
                </div>
                <h3 className="text-lg font-bold text-[#141b2b]">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#434654]">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0050cb]">
              By team type
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#141b2b] md:text-3xl">
              Choose the solution for your hiring context
            </h2>
            <p className="mt-3 text-base text-[#434654]">
              A short path into each vertical—staffing agencies, recruitment firms, executive
              search, startups, enterprise hiring, and GCCs.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="group flex flex-col rounded-2xl border border-[#c3c6d6]/40 bg-white p-6 shadow-sm transition-all hover:border-[#0050cb]/35 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9edff] text-[#0050cb] transition-colors group-hover:bg-[#0050cb] group-hover:text-white">
                  <MaterialIcon
                    name={SOLUTION_ICONS[page.id] ?? "work"}
                    className="text-[24px]"
                  />
                </div>
                <h2 className="text-lg font-bold text-[#141b2b] transition-colors group-hover:text-[#0050cb]">
                  {solutionCollectionItemName(page)}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#434654]">
                  {page.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0050cb]">
                  Learn more
                  <MaterialIcon name="arrow_forward" className="text-[18px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section
        className="faq-section border-t border-[#c3c6d6]/20 bg-white px-4 py-16 md:px-8 md:py-20 lg:px-12"
        id="faq"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0050cb]">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#141b2b] md:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mt-10 space-y-8">
            {SOLUTIONS_INDEX_FAQ.map((item) => (
              <div key={item.question}>
                <h3 className="text-lg font-semibold text-[#141b2b]">{item.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
                  {emphasizeCategoryPhrase(item.answer)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function emphasizeCategoryPhrase(text: string) {
  const index = text.indexOf(CATEGORY_PHRASE);
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <strong>{CATEGORY_PHRASE}</strong>
      {text.slice(index + CATEGORY_PHRASE.length)}
    </>
  );
}

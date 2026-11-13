import type { Metadata } from "next";
import Link from "next/link";

import { CtaBand, EditorialHero, IconCards } from "@/components/landing/editorial/EditorialBlocks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LearnRichText } from "@/components/landing/learn/LearnRichText";
import { LearnSection, learnTheme, learnToneAt } from "@/components/landing/learn/LearnSection";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CenteredFaq } from "@/components/landing/product-ui/CenteredFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, collectionPageJsonLd, faqPageJsonLd } from "@/lib/jsonLd";
import { formatLearnDate, plainText } from "@/lib/learnPages";
import {
  isResearchPublished,
  METRIC_GOVERNANCE_FIELDS,
  RESEARCH_HUB_FAQS,
  RESEARCH_PATH,
  RESEARCH_REPORTS,
  RESEARCH_SEO,
  RESEARCH_STANDARDS,
  researchBreadcrumbs,
  researchMetadata,
  researchPath,
  researchStatusLabel,
  type ResearchReport,
} from "@/lib/researchPages";
import { TOOL_PAGES, toolPath } from "@/lib/toolsPages";

export const metadata: Metadata = researchMetadata();

function researchFact(report: ResearchReport, label: string) {
  return report.atAGlance.find((fact) => fact.label === label)?.value;
}

export default function ResearchHubPage() {
  const lastUpdated = RESEARCH_REPORTS.map((report) => report.lastUpdated).sort().at(-1) ?? "";
  const publishedCount = RESEARCH_REPORTS.filter(isResearchPublished).length;

  const studiesTone = learnToneAt(0);
  const studies = learnTheme(studiesTone);
  const standardsTone = learnToneAt(1);
  const governanceTone = learnToneAt(2);
  const governance = learnTheme(governanceTone);
  const toolsTone = learnToneAt(3);
  const tools = learnTheme(toolsTone);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Hiring Intelligence Research",
            description: RESEARCH_SEO.description,
            url: RESEARCH_PATH,
            items: RESEARCH_REPORTS.map((report) => ({ name: report.title, href: researchPath(report.slug) })),
          }),
          breadcrumbJsonLd(researchBreadcrumbs()),
          faqPageJsonLd(RESEARCH_HUB_FAQS.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) }))),
        ]}
      />
      <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
        <LandingNav />
        <main>
          <EditorialHero
            breadcrumbs={researchBreadcrumbs()}
            eyebrow="Research · AI Hiring Intelligence Infrastructure"
            title="Hiring Intelligence Research"
            answerLabel="What this is"
            answer="Huntlo Research publishes evidence-based analysis of AI recruiting, candidate engagement and hiring operations. Each report states its methodology, sample, collection period, limitations and update date, so readers can tell observed findings apart from forecasts and commentary. Two studies are in preparation; neither has published findings yet."
            chips={[
              { icon: "science", label: `${RESEARCH_REPORTS.length} studies in preparation` },
              { icon: "rule", label: "Methodology published before findings" },
              {
                icon: "event_available",
                label: (
                  <>
                    Updated <time dateTime={lastUpdated}>{formatLearnDate(lastUpdated)}</time>
                  </>
                ),
              },
            ]}
            jump={{ sectionId: "research-studies", label: "Browse the studies" }}
            asideTitle="Research at a glance"
            aside={[
              { label: "Studies", value: String(RESEARCH_REPORTS.length) },
              { label: "Findings published", value: String(publishedCount) },
              { label: "Publisher", value: "Huntlo" },
              { label: "Standard", value: "Nine-point data checklist for every figure" },
            ]}
          />

          <LearnSection
            id="research-studies"
            tone={studiesTone}
            icon="library_books"
            eyebrow="Studies"
            title="Which studies is Huntlo running?"
            intro="Each study page sets out its research questions, scope, methodology and definitions, plus a checklist showing what has and hasn't been published."
          >
            <ul className="grid gap-5 md:grid-cols-2 md:gap-6">
              {RESEARCH_REPORTS.map((report) => (
                <li key={report.slug}>
                  <Link
                    href={researchPath(report.slug)}
                    className={`group flex h-full flex-col rounded-2xl border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-8 ${studies.card} ${studies.cardHover} ${studies.focus}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${studies.chip}`}>
                        <MaterialIcon name={report.icon} className="text-[22px]!" />
                      </span>
                      <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${studies.muted}`}>
                        {report.kind}
                      </span>
                    </div>
                    <h3 className={`mt-5 text-lg font-bold leading-snug md:text-xl ${studies.heading} ${studies.titleHover}`}>
                      {report.title}
                    </h3>
                    <p className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${studies.body}`}>{report.summary}</p>
                    <p className="mt-5 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c3c6d6]/60 bg-white px-3 py-1 text-xs font-semibold text-[#434654]">
                        <MaterialIcon
                          name={isResearchPublished(report) ? "verified" : "pending"}
                          className="text-[14px]! text-[#0050cb]"
                        />
                        {researchStatusLabel(report)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9edff] px-3 py-1 text-xs font-semibold text-[#0050cb]">
                        <MaterialIcon name="database" className="text-[14px]!" />
                        {report.dataOrigin}
                      </span>
                    </p>
                    <dl className={`mt-5 grid gap-2.5 border-t pt-5 text-sm ${studies.divider}`}>
                      {[
                        { label: "Published", value: <time dateTime={report.published}>{formatLearnDate(report.published)}</time> },
                        { label: "Research type", value: report.kind },
                        { label: "Data period", value: researchFact(report, "Data-collection period") ?? "Not yet set" },
                        { label: "Sample", value: researchFact(report, "Sample") ?? "Not yet determined" },
                      ].map((fact) => (
                        <div key={fact.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                          <dt className={`shrink-0 sm:w-28 ${studies.muted}`}>{fact.label}</dt>
                          <dd className={`font-medium ${studies.heading}`}>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <span className={`mt-auto inline-flex items-center gap-1 pt-6 text-xs font-bold ${studies.accent}`}>
                      Read the methodology
                      <MaterialIcon
                        name="arrow_forward"
                        className="text-[14px]! transition-transform motion-safe:group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </LearnSection>

          <LearnSection
            id="research-standards"
            tone={standardsTone}
            icon="verified"
            eyebrow="Research standards"
            title="How does Huntlo publish research?"
            intro="Every study follows the same six rules, so readers can judge what a figure means and how far to rely on it."
          >
            <IconCards items={RESEARCH_STANDARDS} tone={standardsTone} />
          </LearnSection>

          <LearnSection
            id="research-governance"
            tone={governanceTone}
            icon="fact_check"
            eyebrow="Data governance"
            title="What must every published figure have?"
            intro="No statistic is published as Huntlo research until all nine of these are documented. Each study page shows which are complete and which are still pending."
          >
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {METRIC_GOVERNANCE_FIELDS.map((field, index) => (
                <li key={field} className={`flex items-center gap-4 rounded-2xl border p-5 ${governance.card}`}>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${governance.number}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={`text-sm font-semibold md:text-[0.9375rem] ${governance.heading}`}>{field}</span>
                </li>
              ))}
            </ol>
          </LearnSection>

          <LearnSection
            id="research-tools"
            tone={toolsTone}
            icon="calculate"
            eyebrow="Put it to work"
            title="Which tools can you use today?"
            intro="While the studies are in preparation, these calculators let you work out your own recruiting figures with transparent formulas."
          >
            <ul className="grid gap-5 sm:grid-cols-2">
              {TOOL_PAGES.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={toolPath(tool.slug)}
                    className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${tools.card} ${tools.cardHover} ${tools.focus}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tools.chip}`}>
                      <MaterialIcon name={tool.icon} className="text-[20px]!" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${tools.heading} ${tools.titleHover}`}>{tool.name}</span>
                      <span className={`mt-1.5 block text-sm leading-relaxed ${tools.body}`}>{tool.summary}</span>
                    </span>
                    <MaterialIcon
                      name="arrow_forward"
                      className={`mt-0.5 shrink-0 text-[16px]! transition-transform motion-safe:group-hover:translate-x-0.5 ${tools.accent}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className={`mt-8 text-sm ${tools.body}`}>
              Looking for definitions rather than data? The{" "}
              <Link href="/learn" className={`font-semibold underline underline-offset-2 ${tools.accent}`}>
                AI Hiring Knowledge Centre
              </Link>{" "}
              explains the concepts these studies measure.
            </p>
          </LearnSection>

          <CenteredFaq
            id="research-faq"
            title="Questions about Huntlo research"
            items={RESEARCH_HUB_FAQS.map((faq) => ({ question: faq.question, answer: <LearnRichText text={faq.answer} /> }))}
          />

          <CtaBand
            id="research-hub-cta"
            title="Talk to the Huntlo team"
            body="See how Huntlo tracks outreach, replies and pipeline progression on your own roles, with recruiters in control of every decision."
          />
        </main>
        <LandingFooter
          aiAskTopic="Huntlo Hiring Intelligence Research"
          aiAskPrompt="Summarise Huntlo's Hiring Intelligence Research at https://www.huntlo.ai/research: which studies are planned, how is the methodology published, and what is the current data status?"
        />
      </div>
    </>
  );
}

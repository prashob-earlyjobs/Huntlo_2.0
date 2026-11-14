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
import { RESEARCH_PATH, RESEARCH_REPORTS, researchPath } from "@/lib/researchPages";
import {
  TOOL_PAGES,
  TOOLS_HUB_FAQS,
  TOOLS_PATH,
  TOOLS_SEO,
  TOOLS_STANDARDS,
  toolBreadcrumbs,
  toolPath,
  toolsMetadata,
} from "@/lib/toolsPages";

export const metadata: Metadata = toolsMetadata();

export default function ToolsHubPage() {
  const lastUpdated = TOOL_PAGES.map((tool) => tool.lastUpdated).sort().at(-1) ?? "";

  const toolsTone = learnToneAt(0);
  const tools = learnTheme(toolsTone);
  const standardsTone = learnToneAt(1);
  const researchTone = learnToneAt(2);
  const research = learnTheme(researchTone);

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: "Recruitment Tools & Calculators",
            description: TOOLS_SEO.description,
            url: TOOLS_PATH,
            items: TOOL_PAGES.map((tool) => ({ name: tool.title, href: toolPath(tool.slug) })),
          }),
          breadcrumbJsonLd(toolBreadcrumbs()),
          faqPageJsonLd(TOOLS_HUB_FAQS.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) }))),
        ]}
      />
      <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
        <LandingNav />
        <main>
          <EditorialHero
            breadcrumbs={toolBreadcrumbs()}
            eyebrow="Tools · Free recruitment calculators"
            title="Recruitment Tools & Calculators"
            answerLabel="What these are"
            answer="Free calculators for recruiting teams. Each one shows its formula and every assumption on the page, runs entirely in your browser, and gives an estimate you can check by hand, not a guaranteed saving."
            chips={[
              { icon: "calculate", label: `${TOOL_PAGES.length} calculators` },
              { icon: "lock", label: "No sign-up; inputs stay in your browser" },
              {
                icon: "event_available",
                label: (
                  <>
                    Reviewed <time dateTime={lastUpdated}>{formatLearnDate(lastUpdated)}</time>
                  </>
                ),
              },
            ]}
            jump={{ sectionId: "tools-list", label: "Choose a calculator" }}
          />

          <LearnSection
            id="tools-list"
            tone={toolsTone}
            icon="construction"
            eyebrow="Calculators"
            title="Which calculator do you need?"
            intro="Start with cost per hire to see what recruiting costs today, then use the ROI calculator to estimate what automation could change."
          >
            <ul className="grid gap-5 md:grid-cols-2 md:gap-6">
              {TOOL_PAGES.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={toolPath(tool.slug)}
                    className={`group flex h-full flex-col rounded-2xl border p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-8 ${tools.card} ${tools.cardHover} ${tools.focus}`}
                  >
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tools.chip}`}>
                      <MaterialIcon name={tool.icon} className="text-[22px]!" />
                    </span>
                    <h3 className={`mt-5 text-lg font-bold leading-snug md:text-xl ${tools.heading} ${tools.titleHover}`}>
                      {tool.title}
                    </h3>
                    <p className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${tools.body}`}>{tool.summary}</p>
                    <dl className={`mt-6 grid gap-3 border-t pt-5 text-sm ${tools.divider}`}>
                      {[...tool.atAGlance, { label: "Main limitation", value: tool.keyLimitation }].map((fact) => (
                        <div key={fact.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                          <dt className={`shrink-0 sm:w-32 ${tools.muted}`}>{fact.label}</dt>
                          <dd className={`font-medium ${tools.heading}`}>{fact.value}</dd>
                        </div>
                      ))}
                    </dl>
                    <span className={`mt-auto inline-flex items-center gap-1 pt-6 text-xs font-bold ${tools.accent}`}>
                      Open the {tool.name}
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
            id="tools-standards"
            tone={standardsTone}
            icon="verified"
            eyebrow="How they're built"
            title="How can you trust the results?"
            intro="The calculators are deliberately transparent: nothing is hidden behind the result."
          >
            <IconCards items={TOOLS_STANDARDS} tone={standardsTone} columns="sm:grid-cols-2 lg:grid-cols-4" />
          </LearnSection>

          <LearnSection
            id="tools-research"
            tone={researchTone}
            icon="science"
            eyebrow="Research"
            title="Where will benchmarks come from?"
            intro="The calculators include no industry benchmarks yet. Huntlo will only add them once these studies publish findings that meet its data checklist."
          >
            <ul className="grid gap-5 sm:grid-cols-2">
              {RESEARCH_REPORTS.map((report) => (
                <li key={report.slug}>
                  <Link
                    href={researchPath(report.slug)}
                    className={`group flex h-full items-start gap-4 rounded-2xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 md:p-6 ${research.card} ${research.cardHover} ${research.focus}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${research.chip}`}>
                      <MaterialIcon name={report.icon} className="text-[20px]!" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${research.heading} ${research.titleHover}`}>
                        {report.title}
                      </span>
                      <span className={`mt-1.5 block text-sm leading-relaxed ${research.body}`}>{report.summary}</span>
                    </span>
                    <MaterialIcon
                      name="arrow_forward"
                      className={`mt-0.5 shrink-0 text-[16px]! transition-transform motion-safe:group-hover:translate-x-0.5 ${research.accent}`}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <p className={`mt-8 text-sm ${research.body}`}>
              See every study and its data status in{" "}
              <Link href={RESEARCH_PATH} className={`font-semibold underline underline-offset-2 ${research.accent}`}>
                Hiring Intelligence Research
              </Link>
              .
            </p>
          </LearnSection>

          <CenteredFaq
            id="tools-faq"
            title="Questions about the calculators"
            items={TOOLS_HUB_FAQS.map((faq) => ({ question: faq.question, answer: <LearnRichText text={faq.answer} /> }))}
          />

          <CtaBand
            id="tools-hub-cta"
            title="See where Huntlo saves recruiter time"
            body="Book a demo to see Huntlo run sourcing, outreach, preliminary screening and scheduling on your own roles, with recruiters in control of every decision."
            background="bg-white"
          />
        </main>
        <LandingFooter
          aiAskTopic="Huntlo recruitment tools and calculators"
          aiAskPrompt="Summarise the Huntlo recruitment calculators at https://www.huntlo.ai/tools: what do the cost per hire and recruitment automation ROI calculators estimate, and which formulas do they use?"
        />
      </div>
    </>
  );
}

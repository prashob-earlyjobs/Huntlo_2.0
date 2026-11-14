import type { ReactNode } from "react";

import {
  CtaBand,
  EditorialHero,
  IconCards,
  PublisherReview,
  RelatedLinksGrid,
} from "@/components/landing/editorial/EditorialBlocks";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { LearnRichText } from "@/components/landing/learn/LearnRichText";
import { LearnSection, learnTheme, learnToneAt, type LearnTone } from "@/components/landing/learn/LearnSection";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CenteredFaq } from "@/components/landing/product-ui/CenteredFaq";
import { formatLearnDate } from "@/lib/learnPages";
import { TOOLS_PATH, toolBreadcrumbs, type ToolPage as ToolPageData } from "@/lib/toolsPages";

export function ToolPage({ tool, calculator }: { tool: ToolPageData; calculator: ReactNode }) {
  const toc = [
    { id: "calculator", label: "Calculator" },
    { id: "who-its-for", label: "What it estimates and who it's for" },
    { id: "methodology", label: "Methodology and assumptions" },
    { id: "limitations", label: "Limitations" },
    { id: "faq", label: "Frequently asked questions" },
    { id: "related", label: "Related tools and capabilities" },
    { id: "sources", label: "Sources and review" },
  ];
  const toned = toc.filter((item) => item.id !== "faq");
  const tone = Object.fromEntries(toned.map((item, index) => [item.id, learnToneAt(index)])) as Record<
    string,
    LearnTone
  >;
  const theme = (id: string) => learnTheme(tone[id]);
  const lastTone = learnToneAt(toned.length - 1);

  const who = theme("who-its-for");
  const method = theme("methodology");
  const limits = theme("limitations");

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <EditorialHero
          breadcrumbs={toolBreadcrumbs(tool)}
          eyebrow="Recruitment tools · Calculator"
          title={tool.title}
          answerLabel="What it calculates"
          answer={tool.answer}
          chips={[
            { icon: "functions", label: "Formula shown on the page" },
            { icon: "lock", label: "Runs in your browser" },
            {
              icon: "event_available",
              label: (
                <>
                  Reviewed <time dateTime={tool.lastUpdated}>{formatLearnDate(tool.lastUpdated)}</time>
                </>
              ),
            },
          ]}
          jump={{ sectionId: "calculator", label: "Use the calculator" }}
          aside={tool.atAGlance}
          toc={toc}
        />

        <LearnSection
          id="calculator"
          tone={tone.calculator}
          icon={tool.icon}
          eyebrow="Calculator"
          title={`Use the ${tool.name}`}
          intro="Fields start empty. Enter your own figures, or fill in example numbers to see how the calculation works. Results update as you type."
        >
          {calculator}
        </LearnSection>

        <LearnSection
          id="who-its-for"
          tone={tone["who-its-for"]}
          icon="person_search"
          eyebrow="Who it's for"
          title="What does it estimate, and who should use it?"
        >
          <ul className="mb-10 grid max-w-3xl gap-3">
            {tool.estimates.map((item) => (
              <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-base ${who.body}`}>
                <MaterialIcon name="check_circle" className={`mt-0.5 shrink-0 text-[18px]! ${who.accent}`} />
                {item}
              </li>
            ))}
          </ul>
          <IconCards items={tool.whoFor} tone={tone["who-its-for"]} />
        </LearnSection>

        <LearnSection
          id="methodology"
          tone={tone.methodology}
          icon="functions"
          eyebrow="Methodology"
          title="How is the estimate calculated?"
          intro="Every result comes from the formulas below, so you can check any figure by hand."
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
            <dl
              className={`divide-y rounded-2xl border ${method.divider} ${
                method.dark ? "border-white/10 bg-white/[0.03]" : "border-[#c3c6d6]/40 bg-white shadow-sm"
              }`}
            >
              {tool.formulas.map((item) => (
                <div key={item.label} className="px-5 py-4 md:px-6">
                  <dt className={`text-sm font-semibold ${method.heading}`}>{item.label}</dt>
                  <dd
                    className={`mt-1.5 font-mono text-[0.8125rem] leading-relaxed md:text-sm ${
                      method.dark ? "text-[#c1cfff]" : "text-[#0050cb]"
                    }`}
                  >
                    {item.formula}
                  </dd>
                </div>
              ))}
            </dl>
            <div className={`rounded-2xl border p-6 md:p-8 ${method.featured}`}>
              <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${method.heading}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.chip}`}>
                  <MaterialIcon name="rule" className="text-[20px]!" />
                </span>
                Assumptions
              </h3>
              <ul className="mt-5 space-y-3.5">
                {tool.assumptions.map((item) => (
                  <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${method.body}`}>
                    <MaterialIcon name="arrow_right" className={`mt-0.5 shrink-0 text-[18px]! ${method.accent}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </LearnSection>

        <LearnSection
          id="limitations"
          tone={tone.limitations}
          icon="report"
          eyebrow="Limitations"
          title="What the calculator does not tell you"
        >
          <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:gap-6">
            <ul className={`space-y-3.5 rounded-2xl border p-6 md:p-8 ${limits.card}`}>
              {tool.limitations.map((item) => (
                <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${limits.body}`}>
                  <MaterialIcon name="remove" className={`mt-0.5 shrink-0 text-[18px]! ${limits.muted}`} />
                  {item}
                </li>
              ))}
            </ul>
            <div className={`flex flex-col rounded-2xl border p-6 md:p-8 ${limits.featured}`} role="note">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                <MaterialIcon name="info" className="text-[20px]!" />
              </span>
              <h3 className={`mt-5 text-base font-bold md:text-lg ${limits.heading}`}>An estimate, not a guarantee</h3>
              <p className={`mt-2.5 text-sm leading-relaxed md:text-[0.9375rem] ${limits.body}`}>
                Results depend entirely on the figures and assumptions you enter. They are not guaranteed savings,
                a quote, or financial advice.
              </p>
            </div>
          </div>
        </LearnSection>

        <CenteredFaq
          id="faq"
          title={`Questions about the ${tool.name}`}
          items={tool.faqs.map((item) => ({
            question: item.question,
            answer: <LearnRichText text={item.answer} />,
          }))}
        />

        <LearnSection
          id="related"
          tone={tone.related}
          icon="account_tree"
          eyebrow="Related"
          title="Related tools and capabilities"
        >
          <RelatedLinksGrid
            links={tool.related}
            tone={tone.related}
            hub={{
              name: "All recruitment tools",
              href: TOOLS_PATH,
              icon: "construction",
              description: "Every Huntlo calculator, with formulas and assumptions shown.",
            }}
          />
        </LearnSection>

        <LearnSection id="sources" tone={tone.sources} icon="menu_book" eyebrow="Sources" title="Sources and review">
          <PublisherReview
            tone={tone.sources}
            published={tool.published}
            lastUpdated={tool.lastUpdated}
            sources={tool.sources}
            note={
              tool.sources.length > 0
                ? "The calculation structure follows the sources listed above. Cost-line examples and guidance are Huntlo's own and are reviewed on the date shown."
                : "This calculator uses standard arithmetic on your own inputs and does not rely on external data. Formulas and guidance are reviewed on the date shown."
            }
          />
        </LearnSection>

        <CtaBand
          id="tool-cta"
          title="See where Huntlo saves recruiter time"
          body="Book a demo to see Huntlo run sourcing, outreach, preliminary screening and scheduling on your own roles, with recruiters in control of every decision."
          background={lastTone === "light" ? "bg-[#eaf0ff]" : "bg-white"}
        />
      </main>
      <LandingFooter
        aiAskTopic={tool.title}
        aiAskPrompt={`Explain the Huntlo ${tool.name} at https://www.huntlo.ai/tools/${tool.slug}: what it estimates, which formula it uses and what its limitations are.`}
      />
    </div>
  );
}

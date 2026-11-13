import {
  CtaBand,
  DataTable,
  EditorialHero,
  IconCards,
  NumberedCards,
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
import {
  isResearchPublished,
  RESEARCH_PATH,
  researchBreadcrumbs,
  researchStatusLabel,
  type GovernanceItem,
  type ResearchReport,
} from "@/lib/researchPages";

function GovernanceTable({
  items,
  tone,
  label = "Data status checklist",
  caption = "Data status checklist for every published figure",
}: {
  items: GovernanceItem[];
  tone: LearnTone;
  label?: string;
  caption?: string;
}) {
  const t = learnTheme(tone);
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`overflow-x-auto rounded-2xl border focus:outline-none focus-visible:ring-2 ${t.focus} ${
        t.dark ? "border-white/10 bg-white/[0.03]" : "border-[#c3c6d6]/40 bg-white shadow-sm"
      }`}
    >
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm md:text-[0.9375rem]">
        <caption className="sr-only">{caption}</caption>
        <thead className={t.dark ? "bg-white/5 text-white" : "bg-[#f1f3ff] text-[#141b2b]"}>
          <tr>
            <th scope="col" className="px-5 py-4 font-semibold md:px-6">
              Requirement
            </th>
            <th scope="col" className="px-5 py-4 font-semibold md:px-6">
              Status
            </th>
            <th scope="col" className="px-5 py-4 font-semibold md:px-6">
              Detail
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${t.divider}`}>
          {items.map((item) => {
            const defined = item.status === "defined";
            return (
              <tr key={item.label} className="align-top">
                <th scope="row" className={`px-5 py-4 font-semibold md:px-6 ${t.heading}`}>
                  {item.label}
                </th>
                <td className="px-5 py-4 md:px-6">
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                      defined
                        ? "bg-[#e9edff] text-[#0050cb]"
                        : "border border-[#c3c6d6]/60 bg-[#faf9ff] text-[#434654]"
                    }`}
                  >
                    <MaterialIcon name={defined ? "check_circle" : "pending"} className="text-[14px]!" />
                    {defined ? "Defined" : "Pending"}
                  </span>
                </td>
                <td className={`px-5 py-4 leading-relaxed md:px-6 ${t.body}`}>{item.detail}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResearchReportPage({ report }: { report: ResearchReport }) {
  const published = isResearchPublished(report);
  const toc = [
    { id: "data-status", label: "Data status" },
    { id: "research-questions", label: "Research questions" },
    { id: "scope", label: "Scope and sample" },
    { id: "methodology", label: "Methodology" },
    { id: "definitions", label: report.definitions.title },
    { id: "reporting", label: "How findings will be reported" },
    { id: "faq", label: "Frequently asked questions" },
    { id: "related", label: "Related research and capabilities" },
    { id: "publisher", label: "Publisher and review" },
  ];
  const toned = toc.filter((item) => item.id !== "faq");
  const tone = Object.fromEntries(toned.map((item, index) => [item.id, learnToneAt(index)])) as Record<
    string,
    LearnTone
  >;
  const theme = (id: string) => learnTheme(tone[id]);
  const lastTone = learnToneAt(toned.length - 1);

  const status = theme("data-status");
  const questions = theme("research-questions");
  const scope = theme("scope");
  const reporting = theme("reporting");
  const definitions = theme("definitions");
  const methodology = theme("methodology");
  const pendingCount = report.governance.filter((item) => item.status === "pending").length;

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#faf9ff] text-[#141b2b] selection:bg-[#0050cb] selection:text-[#c1cfff]">
      <LandingNav />
      <main>
        <article>
          <EditorialHero
            breadcrumbs={researchBreadcrumbs(report)}
            eyebrow={`Hiring Intelligence Research · ${report.kind}`}
            title={report.title}
            answerLabel="Short answer"
            answer={report.answer}
            chips={[
              { icon: published ? "verified" : "pending", label: researchStatusLabel(report) },
              {
                icon: "event_available",
                label: (
                  <>
                    Updated <time dateTime={report.lastUpdated}>{formatLearnDate(report.lastUpdated)}</time>
                  </>
                ),
              },
              { icon: "database", label: report.dataOrigin },
            ]}
            jump={{ sectionId: "methodology", label: "Read the methodology" }}
            asideTitle="Study at a glance"
            aside={report.atAGlance}
            toc={toc}
          />

          <LearnSection
            id="data-status"
            tone={tone["data-status"]}
            icon="fact_check"
            eyebrow="Data status"
            title="What has been published so far?"
            intro="Before any figure appears in a Huntlo study, it must meet every requirement below. This checklist shows which are already defined on this page and which are still outstanding."
          >
            {report.disclosure ? (
              <p
                role="note"
                className={`mb-6 flex max-w-4xl gap-3 rounded-2xl border p-5 text-sm leading-relaxed md:p-6 md:text-[0.9375rem] ${status.card} ${status.body}`}
              >
                <MaterialIcon name="event_note" className={`mt-0.5 shrink-0 text-[18px]! ${status.accent}`} />
                <span>{report.disclosure}</span>
              </p>
            ) : null}
            {!published ? (
              <div className={`mb-8 flex gap-4 rounded-2xl border p-6 md:p-7 ${status.featured}`} role="note">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0050cb] text-white shadow-md shadow-[#0050cb]/20">
                  <MaterialIcon name="info" className="text-[20px]!" />
                </span>
                <div className="min-w-0">
                  <h3 className={`text-base font-bold md:text-lg ${status.heading}`}>No findings published yet</h3>
                  <p className={`mt-2 max-w-3xl text-sm leading-relaxed md:text-[0.9375rem] ${status.body}`}>
                    This page sets out the research design only. It contains no results, rates or statistics, and
                    nothing on it should be quoted as a Huntlo finding. {pendingCount} of {report.governance.length}{" "}
                    requirements are still pending.
                  </p>
                </div>
              </div>
            ) : null}
            <GovernanceTable items={report.governance} tone={tone["data-status"]} />
          </LearnSection>

          <LearnSection
            id="research-questions"
            tone={tone["research-questions"]}
            icon="help"
            eyebrow="Research questions"
            title="What will this research answer?"
          >
            <ol className="grid gap-4">
              {report.researchQuestions.map((question, index) => (
                <li
                  key={question}
                  className={`flex items-start gap-5 rounded-2xl border p-5 md:p-6 ${questions.card}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-xs font-bold tabular-nums ${questions.number}`}
                  >
                    Q{index + 1}
                  </span>
                  <p className={`pt-2 text-sm leading-relaxed md:text-base ${questions.heading}`}>{question}</p>
                </li>
              ))}
            </ol>
          </LearnSection>

          <LearnSection
            id="scope"
            tone={tone.scope}
            icon="target"
            eyebrow="Scope and sample"
            title="Who and what does the study cover?"
            intro="Items marked as pending have not been decided yet. They will be filled in before any finding is published."
          >
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {report.scope.map((item) => (
                <div key={item.label} className={`flex flex-col rounded-2xl border p-6 ${scope.card}`}>
                  <dt className={`flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] ${scope.accent}`}>
                    {item.label}
                    {item.pending ? (
                      <span className="rounded-full border border-[#c3c6d6]/60 bg-[#faf9ff] px-2 py-0.5 text-[0.65rem] font-semibold normal-case tracking-normal text-[#434654]">
                        Pending
                      </span>
                    ) : null}
                  </dt>
                  <dd className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${scope.body}`}>{item.value}</dd>
                </div>
              ))}
            </dl>
          </LearnSection>

          <LearnSection
            id="methodology"
            tone={tone.methodology}
            icon="science"
            eyebrow="Methodology"
            title="How will the research be carried out?"
          >
            <NumberedCards items={report.methodology} tone={tone.methodology} />

            <h3 className={`mt-12 text-base font-bold md:text-lg ${methodology.heading}`}>
              What every statistic will state
            </h3>
            <p className={`mt-2 mb-6 max-w-3xl text-sm leading-relaxed md:text-[0.9375rem] ${methodology.body}`}>
              Each figure will carry this information beside it, not in a footnote, so the source, method and
              claim can be read together.
            </p>
            <GovernanceTable
              items={report.methodologyDisclosure}
              tone={tone.methodology}
              label="Methodology disclosure"
              caption="Information published alongside every statistic in this study"
            />
          </LearnSection>

          <LearnSection
            id="definitions"
            tone={tone.definitions}
            icon="table_chart"
            eyebrow="Definitions"
            title={report.definitions.title}
            intro={report.definitions.intro}
          >
            <DataTable table={report.definitions} tone={tone.definitions} />
            {report.definitionsNote ? (
              <p
                className={`mt-6 flex max-w-3xl gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${definitions.body}`}
              >
                <MaterialIcon name="info" className={`mt-0.5 shrink-0 text-[18px]! ${definitions.accent}`} />
                {report.definitionsNote}
              </p>
            ) : null}
          </LearnSection>

          <LearnSection
            id="reporting"
            tone={tone.reporting}
            icon="bar_chart"
            eyebrow="Reporting"
            title="How will findings be reported?"
            intro="These are the sections the published report will contain. They are listed so readers know what to expect; none contain data yet."
          >
            <IconCards items={report.plannedOutputs} tone={tone.reporting} />

            <div className="mt-10 grid gap-5 md:grid-cols-2 md:gap-6">
              <div className={`rounded-2xl border p-6 md:p-8 ${reporting.featured}`}>
                <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${reporting.heading}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${reporting.chip}`}>
                    <MaterialIcon name="database" className="text-[20px]!" />
                  </span>
                  Observed data
                </h3>
                <p className={`mt-4 text-sm leading-relaxed md:text-[0.9375rem] ${reporting.body}`}>
                  Figures exactly as measured, with the number of respondents or contacts behind each one and the
                  period they cover. Shown in tables and charts with no commentary mixed in.
                </p>
              </div>
              <div className={`rounded-2xl border p-6 md:p-8 ${reporting.card}`}>
                <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${reporting.heading}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${reporting.chip}`}>
                    <MaterialIcon name="psychology" className="text-[20px]!" />
                  </span>
                  Interpretation and recommendations
                </h3>
                <p className={`mt-4 text-sm leading-relaxed md:text-[0.9375rem] ${reporting.body}`}>
                  Huntlo&apos;s reading of what the data means, and what recruiting teams might do about it. These
                  sections are labelled separately, so readers can always tell findings apart from opinion.
                </p>
              </div>
            </div>

            <div className={`mt-6 rounded-2xl border p-6 md:p-8 ${reporting.card}`}>
              <h3 className={`flex items-center gap-3 text-base font-bold md:text-lg ${reporting.heading}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${reporting.chip}`}>
                  <MaterialIcon name="do_not_disturb_on" className="text-[20px]!" />
                </span>
                What this study will not claim
              </h3>
              <p className={`mt-3 text-sm leading-relaxed md:text-[0.9375rem] ${reporting.body}`}>
                Unless the published data directly supports it, the study will not state:
              </p>
              <ul className="mt-4 space-y-3">
                {report.willNotClaim.map((item) => (
                  <li key={item} className={`flex gap-3 text-sm leading-relaxed md:text-[0.9375rem] ${reporting.body}`}>
                    <MaterialIcon name="close" className={`mt-0.5 shrink-0 text-[18px]! ${reporting.muted}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </LearnSection>

          <CenteredFaq
            id="faq"
            title={`Questions about the ${report.name}`}
            items={report.faqs.map((item) => ({
              question: item.question,
              answer: <LearnRichText text={item.answer} />,
            }))}
          />

          <LearnSection
            id="related"
            tone={tone.related}
            icon="account_tree"
            eyebrow="Related"
            title="Related research and capabilities"
          >
            <RelatedLinksGrid
              links={report.related}
              tone={tone.related}
              hub={{
                name: "All Hiring Intelligence Research",
                href: RESEARCH_PATH,
                icon: "science",
                description: "Every Huntlo study, its methodology and data status.",
              }}
            />
          </LearnSection>

          <LearnSection id="publisher" tone={tone.publisher} icon="badge" eyebrow="Publisher" title="Publisher and review">
            <PublisherReview
              tone={tone.publisher}
              published={report.published}
              lastUpdated={report.lastUpdated}
              sources={report.sources}
              note={
                report.sources.length > 0
                  ? "Sources are listed with the date each was published. Huntlo is the publisher of this study."
                  : "This page describes research design only, so it cites no external data. Primary sources will be listed here with their date ranges when findings are published."
              }
            />
          </LearnSection>
        </article>

        <CtaBand
          id="research-cta"
          title="See how Huntlo measures hiring activity"
          body="Book a demo to see how Huntlo tracks outreach, replies and pipeline progression as work happens, with recruiters in control of every decision."
          background={lastTone === "light" ? "bg-[#eaf0ff]" : "bg-white"}
        />
      </main>
      <LandingFooter
        aiAskTopic={report.title}
        aiAskPrompt={`Summarise the Huntlo research page at https://www.huntlo.ai/research/${report.slug}: what is the research question, scope and methodology, and what is its current data status?`}
      />
    </div>
  );
}

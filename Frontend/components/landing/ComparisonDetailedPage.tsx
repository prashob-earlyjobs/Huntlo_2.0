import Link from "next/link";
import type { ReactNode } from "react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CTA } from "@/lib/ctaLabels";
import { COMPARISON_HUB_ENTRIES } from "@/lib/comparisons";
import type {
  ComparisonFeatureValue,
  ComparisonSource,
  DetailedComparisonPage,
  LegacyComparisonPage,
  VerifiedComparisonPage,
} from "@/lib/comparisonDetailed";
import { COMPARISON_REVIEW_INTERVAL_DAYS } from "@/lib/comparisonVerified";
import { formatLearnDate } from "@/lib/learnPages";

function FeatureBadge({ value }: { value: ComparisonFeatureValue }) {
  const normalized = String(value).toLowerCase();

  if (normalized === "yes") {
    return (
      <span className="landing-compare-badge landing-compare-badge--yes">
        <MaterialIcon name="check" className="text-sm" />
        Yes
      </span>
    );
  }
  if (normalized === "no") {
    return (
      <span className="landing-compare-badge landing-compare-badge--no">
        <MaterialIcon name="close" className="text-sm" />
        No
      </span>
    );
  }
  if (normalized === "partial" || normalized === "limited") {
    return (
      <span className="landing-compare-badge landing-compare-badge--partial">
        {value}
      </span>
    );
  }
  return <span className="landing-compare-text-value">{value}</span>;
}

function SectionCard({
  id,
  icon,
  title,
  children,
  className = "",
}: {
  id?: string;
  icon: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`landing-compare-section scroll-mt-24 ${className}`.trim()}>
      <div className="landing-compare-section-head">
        <span className="landing-compare-section-icon" aria-hidden>
          <MaterialIcon name={icon} />
        </span>
        <h2 className="landing-compare-section-title">{title}</h2>
      </div>
      <div className="landing-compare-section-body">{children}</div>
    </section>
  );
}

function CompareDataTable({
  columns,
  rows,
  huntloColumnIndex,
}: {
  columns: string[];
  rows: { label: string; cells: ReactNode[] }[];
  huntloColumnIndex?: number;
}) {
  return (
    <div className="landing-compare-table-wrap">
      <table className="landing-compare-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th
                key={col}
                scope="col"
                className={
                  huntloColumnIndex === index ? "landing-compare-col-huntlo" : undefined
                }
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.label}-${index}`}
                  className={
                    huntloColumnIndex === index ? "landing-compare-col-huntlo" : undefined
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WorkflowTimeline({ steps, label, variant }: { steps: string[]; label: string; variant: "huntlo" | "competitor" }) {
  return (
    <div className={`landing-compare-timeline landing-compare-timeline--${variant}`}>
      <p className="landing-compare-timeline-label">{label}</p>
      <ol className="landing-compare-timeline-steps">
        {steps.map((step, index) => (
          <li key={step}>
            <span className="landing-compare-timeline-num">{String(index + 1).padStart(2, "0")}</span>
            <span className="landing-compare-timeline-step">{step}</span>
            {index < steps.length - 1 ? (
              <MaterialIcon name="south" className="landing-compare-timeline-arrow" />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function UseCaseTable({ useCases }: { useCases: { useCase: string; recommended: string }[] }) {
  return (
    <CompareDataTable
      columns={["Use case", "Recommended"]}
      rows={useCases.map((row) => ({
        label: row.useCase,
        cells: [
          <span
            key="r"
            className={
              row.recommended === "Huntlo"
                ? "landing-compare-recommended landing-compare-recommended--huntlo"
                : row.recommended === "Both"
                  ? "landing-compare-recommended landing-compare-recommended--both"
                  : "landing-compare-recommended"
            }
          >
            {row.recommended === "Huntlo" ? <MaterialIcon name="star" className="text-sm" /> : null}
            {row.recommended}
          </span>,
        ],
      }))}
    />
  );
}

function ChooseGrid({ page }: { page: DetailedComparisonPage }) {
  return (
    <div className="landing-compare-choose-grid">
      <div className="landing-compare-choose-card landing-compare-choose-card--huntlo">
        <div className="landing-compare-choose-head">
          <MaterialIcon name="verified" />
          <h2>Choose Huntlo if</h2>
        </div>
        <ul>
          {page.chooseHuntlo.map((item) => (
            <li key={item}>
              <MaterialIcon name="check_circle" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="landing-compare-choose-card">
        <div className="landing-compare-choose-head">
          <MaterialIcon name="search" />
          <h2>Choose {page.name} if</h2>
        </div>
        <ul>
          {page.chooseCompetitor.map((item) => (
            <li key={item}>
              <MaterialIcon name="check_circle" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const CATEGORY_PHRASE = "Agentic AI Hiring Infrastructure";

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

function ComparisonHero({
  page,
  currentSlug,
  children,
}: {
  page: DetailedComparisonPage;
  currentSlug: string;
  children?: ReactNode;
}) {
  const breadcrumbLabel = page.breadcrumbLabel ?? `Huntlo vs ${page.name}`;
  return (
    <div className="landing-compare-hero">
      <div className="landing-compare-hero-glow" aria-hidden />

      <nav className="landing-compare-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <MaterialIcon name="chevron_right" className="landing-compare-breadcrumb-sep" />
        <Link href="/compare">Compare</Link>
        <MaterialIcon name="chevron_right" className="landing-compare-breadcrumb-sep" />
        <span>{breadcrumbLabel}</span>
      </nav>

      <div className="landing-compare-matchup" aria-label={`Huntlo vs ${page.name}`}>
        <div className="landing-compare-matchup-card landing-compare-matchup-card--huntlo">
          <div className="landing-compare-matchup-mark landing-compare-matchup-mark--huntlo">
            <MaterialIcon name="rocket_launch" />
          </div>
          <div className="landing-compare-matchup-copy">
            <p className="landing-compare-matchup-name">Huntlo</p>
            <p className="landing-compare-matchup-role">{page.bestFor.huntlo}</p>
          </div>
        </div>

        <div className="landing-compare-matchup-vs" aria-hidden>
          <span>vs</span>
        </div>

        <div className="landing-compare-matchup-card landing-compare-matchup-card--competitor">
          <div className="landing-compare-matchup-mark landing-compare-matchup-mark--competitor">
            <span>{page.name.charAt(0)}</span>
          </div>
          <div className="landing-compare-matchup-copy">
            <p className="landing-compare-matchup-name">{page.name}</p>
            <p className="landing-compare-matchup-role">{page.bestFor.competitor}</p>
          </div>
        </div>
      </div>

      <h1 className="landing-compare-hero-title">{page.headline}</h1>

      <div className="landing-compare-hero-intro">
        {page.intro.map((paragraph) => (
          <p key={paragraph}>{emphasizeCategoryPhrase(paragraph)}</p>
        ))}
      </div>

      {children}

      <nav className="landing-compare-switcher" aria-label="Other comparisons">
        <span className="landing-compare-switcher-label">Also compare:</span>
        <div className="landing-compare-switcher-pills">
          {COMPARISON_HUB_ENTRIES.map((entry) => (
            <Link
              key={entry.slug}
              href={entry.href}
              className={`landing-blog-category-pill ${
                entry.slug === currentSlug ? "landing-blog-category-pill--active" : ""
              }`}
              aria-current={entry.slug === currentSlug ? "page" : undefined}
            >
              vs {entry.shortName}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="faq-section landing-compare-section" id="faq">
      <div className="landing-compare-section-head">
        <span className="landing-compare-section-icon" aria-hidden>
          <MaterialIcon name="help" />
        </span>
        <h2 className="landing-compare-section-title">Frequently Asked Questions</h2>
      </div>
      <div className="landing-compare-section-body space-y-8">
        {items.map((item) => (
          <div key={item.question}>
            <h3 className="text-lg font-semibold text-[#141b2b]">{item.question}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#434654] md:text-base">
              {emphasizeCategoryPhrase(item.answer)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedComparisons({ currentSlug }: { currentSlug: string }) {
  const otherComparisons = COMPARISON_HUB_ENTRIES.filter((entry) => entry.slug !== currentSlug);
  if (otherComparisons.length === 0) return null;
  return (
    <section className="landing-compare-related">
      <h2 className="landing-compare-related-title">Explore more comparisons</h2>
      <div className="landing-compare-related-grid">
        {otherComparisons.map((entry) => (
          <Link key={entry.slug} href={entry.href} className="landing-compare-related-card group">
            <p className="landing-compare-nav-vs">Huntlo vs</p>
            <p className="landing-compare-related-name">{entry.name}</p>
            <p className="landing-compare-related-summary">{entry.summary}</p>
            <span className="landing-compare-related-cta">
              Read comparison
              <MaterialIcon name="arrow_forward" className="text-sm" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ComparisonCta() {
  return (
    <section className="landing-compare-cta">
      <div className="landing-compare-cta-glow" aria-hidden />
      <h2>Compare Huntlo on your own workflow</h2>
      <p>
        Book a demo and we will run one of your live roles through Huntlo, from sourcing and
        outreach to screening and scheduling, with recruiters in control.
      </p>
      <div className="landing-compare-cta-actions">
        <BookDemoLink className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#0050cb] px-[1.15rem] py-[0.55rem] text-sm font-semibold text-white transition-colors hover:bg-[#003fa4]">
          {CTA.demo}
        </BookDemoLink>
        <Link href={CTA.product.href} className="landing-compare-cta-secondary text-sm">
          {CTA.product.label}
        </Link>
      </div>
    </section>
  );
}

function SourceMarker({ id, sources }: { id?: string; sources: ComparisonSource[] }) {
  if (!id) return null;
  const index = sources.findIndex((source) => source.id === id);
  if (index === -1) return null;
  const source = sources[index];
  return (
    <a
      href={`#source-${index + 1}`}
      className="ml-1 inline-block align-super text-[0.7rem] font-semibold text-[#0050cb] no-underline hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
      aria-label={`Source ${index + 1}: ${source.publisher}, ${source.title}`}
    >
      [{index + 1}]
    </a>
  );
}

function VerifiedComparisonView({ page, currentSlug }: { page: VerifiedComparisonPage; currentSlug: string }) {
  const reviewed = formatLearnDate(page.lastReviewed);
  const competitorSourceCount = page.sources.filter((source) => !source.url.startsWith("/")).length;

  return (
    <div className="landing-compare-page">
      <ComparisonHero page={page} currentSlug={currentSlug}>
        <div className="mt-6 max-w-3xl rounded-2xl border border-[#0050cb]/20 bg-white/80 p-5 md:p-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#0050cb]">Short answer</p>
          <p className="mt-2 text-sm leading-relaxed text-[#141b2b] md:text-base">{page.verdict}</p>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs text-[#434654]" aria-label="Review details">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-[#c3c6d6]/60 bg-white px-3 py-1.5">
            <MaterialIcon name="event_available" className="text-[14px]! text-[#0050cb]" />
            Last competitor review: <time dateTime={page.lastReviewed}>{reviewed}</time>
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-[#c3c6d6]/60 bg-white px-3 py-1.5">
            <MaterialIcon name="menu_book" className="text-[14px]! text-[#0050cb]" />
            {page.sources.length} cited sources
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-[#c3c6d6]/60 bg-white px-3 py-1.5">
            <MaterialIcon name="fact_check" className="text-[14px]! text-[#0050cb]" />
            {page.name} details from {competitorSourceCount === 1 ? "its own public page" : "its own public pages"}
          </li>
        </ul>
      </ComparisonHero>

      <div className="landing-compare-sections">
        <SectionCard id="comparison" icon="table_chart" title={`Huntlo vs ${page.name}: sourced comparison`}>
          <p className="mb-6 text-sm leading-relaxed text-[#434654] md:text-base">
            Each claim links to its source in the list below. {page.name} rows reflect {page.name}&apos;s own
            public materials as of {reviewed}; Huntlo rows reflect Huntlo&apos;s product pages on the same date.
          </p>
          <CompareDataTable
            columns={["Capability", "Huntlo", page.name]}
            huntloColumnIndex={1}
            rows={page.featureComparison.map((row) => ({
              label: row.capability,
              cells: [
                <span key="h" className="landing-compare-text-value landing-compare-text-value--strong">
                  {row.huntlo}
                  <SourceMarker id={row.huntloSource} sources={page.sources} />
                </span>,
                <span key="c" className="landing-compare-text-value">
                  {row.competitor}
                  <SourceMarker id={row.competitorSource} sources={page.sources} />
                </span>,
              ],
            }))}
          />
        </SectionCard>

        <SectionCard icon="account_tree" title="How the workflows differ">
          <div className="landing-compare-workflow-grid">
            <WorkflowTimeline steps={page.workflowHuntlo} label="Huntlo" variant="huntlo" />
            <WorkflowTimeline steps={page.workflowCompetitor} label={page.name} variant="competitor" />
          </div>
          <p className="landing-compare-workflow-note">{page.workflowNote}</p>
        </SectionCard>

        <ChooseGrid page={page} />

        <SectionCard icon="recommend" title="Best fit by use case">
          <UseCaseTable useCases={page.useCases} />
        </SectionCard>

        <SectionCard id="comparison-sources" icon="menu_book" title="Evidence and sources">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-[#c3c6d6]/40 bg-[#faf9ff] p-5">
              <dt className="text-xs font-medium text-[#434654]/80">Last competitor review</dt>
              <dd className="mt-1.5 font-semibold text-[#141b2b]">
                <time dateTime={page.lastReviewed}>{reviewed}</time>
              </dd>
            </div>
            <div className="rounded-2xl border border-[#c3c6d6]/40 bg-[#faf9ff] p-5">
              <dt className="text-xs font-medium text-[#434654]/80">Review policy</dt>
              <dd className="mt-1.5 font-semibold text-[#141b2b]">
                Re-checked at least every {COMPARISON_REVIEW_INTERVAL_DAYS} days against first-party sources
              </dd>
            </div>
          </dl>
          <ol className="mt-8 space-y-3 text-sm leading-relaxed text-[#434654] md:text-[0.9375rem]">
            {page.sources.map((source, index) => {
              const internal = source.url.startsWith("/");
              const linkClass =
                "font-medium text-[#0050cb] underline decoration-[#0050cb]/30 underline-offset-2 hover:decoration-[#0050cb]";
              return (
                <li key={source.id} id={`source-${index + 1}`} className="flex scroll-mt-28 gap-3">
                  <span className="w-7 shrink-0 font-semibold tabular-nums text-[#141b2b]">[{index + 1}]</span>
                  <span>
                    {internal ? (
                      <Link href={source.url} className={linkClass}>
                        {source.title}
                      </Link>
                    ) : (
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                        {source.title}
                      </a>
                    )}{" "}
                    — {source.publisher}, accessed <time dateTime={source.accessed}>{formatLearnDate(source.accessed)}</time>.
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#434654]">
            Competitor products change quickly. Where a capability was not described in the materials we
            reviewed, the table says so rather than assuming it is missing. Confirm current details with{" "}
            {page.name} before making a purchasing decision, and{" "}
            <Link href="/contact" className="font-medium text-[#0050cb] underline underline-offset-2">
              tell us
            </Link>{" "}
            if anything here is out of date.
          </p>
        </SectionCard>

        <FaqSection items={page.faq} />

        <RelatedComparisons currentSlug={currentSlug} />

        <ComparisonCta />
      </div>
    </div>
  );
}

function LegacyComparisonView({ page, currentSlug }: { page: LegacyComparisonPage; currentSlug: string }) {
  const featureTableTitle = page.comparisonTableTitle ?? "Feature comparison";

  return (
    <div className="landing-compare-page">
      <ComparisonHero page={page} currentSlug={currentSlug} />

      <div className="landing-compare-sections">
        <SectionCard icon="table_chart" title="Quick comparison">
          <CompareDataTable
            columns={["Feature", "Huntlo", page.name]}
            huntloColumnIndex={1}
            rows={[
              ...page.quickComparisonRows.map((row) => ({
                label: row.feature,
                cells: [
                  <FeatureBadge key="h" value={row.huntlo} />,
                  <FeatureBadge key="c" value={row.competitor} />,
                ],
              })),
              {
                label: "Best for",
                cells: [
                  <span key="h" className="landing-compare-text-value landing-compare-text-value--strong">
                    {page.bestFor.huntlo}
                  </span>,
                  <span key="c" className="landing-compare-text-value">
                    {page.bestFor.competitor}
                  </span>,
                ],
              },
            ]}
          />
        </SectionCard>

        <ChooseGrid page={page} />

        <div className="landing-compare-platform-grid">
          <SectionCard icon="rocket_launch" title="What is Huntlo?" className="landing-compare-platform-card">
            <p>{emphasizeCategoryPhrase(page.whatIsHuntlo.lead)}</p>
            <p className="landing-compare-platform-subhead">The platform combines</p>
            <ul className="landing-compare-platform-list">
              {page.whatIsHuntlo.bullets.map((item) => (
                <li key={item}>
                  <MaterialIcon name="arrow_forward" />
                  {item}
                </li>
              ))}
            </ul>
            <blockquote className="landing-compare-philosophy">
              <span className="landing-compare-philosophy-label">Core philosophy</span>
              {page.whatIsHuntlo.philosophy}
            </blockquote>
            <p className="landing-compare-platform-closing">{page.whatIsHuntlo.closing}</p>
          </SectionCard>

          <SectionCard icon="travel_explore" title={`What is ${page.name}?`} className="landing-compare-platform-card">
            <p>{page.whatIsCompetitor.lead}</p>
            <p className="landing-compare-platform-subhead">The platform emphasizes</p>
            <ul className="landing-compare-platform-list">
              {page.whatIsCompetitor.bullets.map((item) => (
                <li key={item}>
                  <MaterialIcon name="arrow_forward" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="landing-compare-platform-closing">{page.whatIsCompetitor.closing}</p>
          </SectionCard>
        </div>

        <section className="comparison-table-section landing-compare-section">
          <div className="landing-compare-section-head">
            <span className="landing-compare-section-icon" aria-hidden>
              <MaterialIcon name="compare_arrows" />
            </span>
            <h2 className="landing-compare-section-title">{featureTableTitle}</h2>
          </div>
          <div className="landing-compare-section-body">
            {page.comparisonTableIntro ? (
              <p className="mb-6 text-sm leading-relaxed text-[#434654] md:text-base">
                {emphasizeCategoryPhrase(page.comparisonTableIntro)}
              </p>
            ) : null}
            <CompareDataTable
              columns={[
                "Capability",
                page.comparisonTableTitle ? "Huntlo AI" : "Huntlo",
                page.name,
              ]}
              huntloColumnIndex={1}
              rows={page.featureComparison.map((row) => ({
                label: row.capability,
                cells: [
                  <span key="h" className="landing-compare-text-value landing-compare-text-value--strong">
                    {row.huntlo}
                  </span>,
                  <span key="c" className="landing-compare-text-value">
                    {row.competitor}
                  </span>,
                ],
              }))}
            />
            {page.comparisonDisclaimer ? (
              <p className="comparison-disclaimer mt-4 text-xs leading-relaxed text-[#434654]/80 md:text-sm">
                {page.comparisonDisclaimer}
              </p>
            ) : null}
          </div>
        </section>

        <div className="landing-compare-highlight">
          <MaterialIcon name="lightbulb" />
          <div>
            <p className="landing-compare-highlight-label">Biggest difference</p>
            <p className="landing-compare-highlight-text">
              {emphasizeCategoryPhrase(page.biggestDifference)}
            </p>
          </div>
        </div>

        <SectionCard icon="account_tree" title="Workflow comparison">
          <div className="landing-compare-workflow-grid">
            <WorkflowTimeline steps={page.workflowHuntlo} label="Huntlo" variant="huntlo" />
            <WorkflowTimeline steps={page.workflowCompetitor} label={page.name} variant="competitor" />
          </div>
          <p className="landing-compare-workflow-note">
            {emphasizeCategoryPhrase(page.workflowNote)}
          </p>
        </SectionCard>

        <SectionCard icon="recommend" title="Best platform by use case">
          <UseCaseTable useCases={page.useCases} />
        </SectionCard>

        <SectionCard icon="balance" title="Pros & considerations">
          <div className="landing-compare-pros-grid">
            <div className="landing-compare-pros-card landing-compare-pros-card--huntlo">
              <h3>Huntlo</h3>
              <p className="landing-compare-pros-label">Pros</p>
              <ul>
                {page.prosHuntlo.map((item) => (
                  <li key={item}>
                    <MaterialIcon name="check" />
                    {emphasizeCategoryPhrase(item)}
                  </li>
                ))}
              </ul>
              <p className="landing-compare-pros-label landing-compare-pros-label--muted">Consideration</p>
              <p className="landing-compare-pros-note">{page.considerationHuntlo}</p>
            </div>
            <div className="landing-compare-pros-card">
              <h3>{page.name}</h3>
              <p className="landing-compare-pros-label">Pros</p>
              <ul>
                {page.prosCompetitor.map((item) => (
                  <li key={item}>
                    <MaterialIcon name="check" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="landing-compare-pros-label landing-compare-pros-label--muted">Consideration</p>
              <p className="landing-compare-pros-note">{page.considerationCompetitor}</p>
            </div>
          </div>
        </SectionCard>

        <FaqSection items={page.faq} />

        <section className="landing-compare-verdict-card">
          <div className="landing-compare-verdict-head">
            <MaterialIcon name="gavel" />
            <h2>Final verdict</h2>
          </div>
          {page.finalVerdict.map((paragraph) => (
            <p key={paragraph}>{emphasizeCategoryPhrase(paragraph)}</p>
          ))}
        </section>

        <RelatedComparisons currentSlug={currentSlug} />

        <ComparisonCta />
      </div>
    </div>
  );
}

type Props = {
  page: DetailedComparisonPage;
  currentSlug: string;
};

export function ComparisonDetailedPage({ page, currentSlug }: Props) {
  return page.layout === "verified" ? (
    <VerifiedComparisonView page={page} currentSlug={currentSlug} />
  ) : (
    <LegacyComparisonView page={page} currentSlug={currentSlug} />
  );
}

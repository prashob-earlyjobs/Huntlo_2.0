"use client";

import { useMemo, useState } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  calculateCostPerHire,
  currencySymbol,
  formatMoney,
  formatNumber,
  toNumber,
  type CurrencyCode,
} from "@/lib/recruitmentCalculators";

import { CalculatorToolbar, CopyResultButton, CurrencySelect, FieldGroup, NumberField, ShareBar } from "./CalculatorFields";

type LineDef = { id: string; label: string; hint?: string; example: number };

const EXTERNAL_LINES: LineDef[] = [
  { id: "advertising", label: "Advertising and job boards", hint: "Job ads, job boards, social and employer-brand campaigns.", example: 6000 },
  { id: "agency", label: "Agency, search and RPO fees", hint: "Contingent, retained and RPO fees paid in the period.", example: 24000 },
  { id: "sourcing", label: "Sourcing databases and licences", example: 3000 },
  { id: "technology", label: "Recruiting technology", hint: "ATS, CRM, automation and reporting tools, for this period only.", example: 9000 },
  { id: "screening", label: "Background checks and assessments", example: 2500 },
  { id: "events", label: "Job fairs, campus and recruiting events", example: 2000 },
  { id: "travel", label: "Travel, relocation and sign-on bonuses", example: 4000 },
  { id: "referrals", label: "Employee referral awards", example: 5000 },
];

const INTERNAL_LINES: LineDef[] = [
  { id: "staff", label: "Recruiters and sourcers", hint: "Fully loaded pay for time spent on recruiting.", example: 90000 },
  { id: "managers", label: "Hiring manager and interviewer time", hint: "Interview hours × an internal hourly rate.", example: 15000 },
  { id: "office", label: "Office and overhead share", hint: "A proportion of office costs based on recruiting headcount.", example: 4000 },
  { id: "development", label: "Recruiter training and compliance", example: 1500 },
];

const EXAMPLE_HIRES = "40";

const ALL_LINES = [...EXTERNAL_LINES, ...INTERNAL_LINES];
const emptyValues = () => Object.fromEntries(ALL_LINES.map((line) => [line.id, ""])) as Record<string, string>;

export function CostPerHireCalculator() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [values, setValues] = useState<Record<string, string>>(emptyValues);
  const [hires, setHires] = useState("");
  const [exampleActive, setExampleActive] = useState(false);

  const symbol = currencySymbol(currency);
  const money = (value: number) => formatMoney(value, currency);

  const result = useMemo(() => {
    const toLines = (defs: LineDef[]) =>
      defs.map((line) => ({ id: line.id, label: line.label, amount: toNumber(values[line.id] ?? "") }));
    return calculateCostPerHire(toLines(EXTERNAL_LINES), toLines(INTERNAL_LINES), Math.floor(toNumber(hires)));
  }, [values, hires]);

  const setValue = (id: string, value: string) => {
    setValues((current) => ({ ...current, [id]: value }));
    setExampleActive(false);
  };

  const loadExample = () => {
    setValues(Object.fromEntries(ALL_LINES.map((line) => [line.id, String(line.example)])));
    setHires(EXAMPLE_HIRES);
    setExampleActive(true);
  };

  const clearAll = () => {
    setValues(emptyValues());
    setHires("");
    setExampleActive(false);
  };

  const topLines = [...result.lines].filter((line) => line.amount > 0).sort((a, b) => b.amount - a.amount);
  const externalShare = result.total > 0 ? result.external / result.total : 0;
  const summary =
    result.costPerHire !== null
      ? `Estimated cost per hire: ${money(result.costPerHire)}, from ${money(result.total)} in total recruiting costs across ${formatNumber(result.hires, 0)} ${result.hires === 1 ? "hire" : "hires"}. External costs are ${formatNumber(externalShare * 100, 0)}% of the total and internal costs ${formatNumber((1 - externalShare) * 100, 0)}%.`
      : result.total > 0
        ? "Enter the number of hires in the same period to calculate cost per hire."
        : "Enter your recruiting costs and number of hires to see your cost per hire.";

  const copyText = [
    "Cost per hire estimate (Huntlo calculator)",
    summary,
    "Formula: (total external costs + total internal costs) ÷ number of hires in the same period.",
    "Largest cost lines:",
    ...topLines.slice(0, 5).map((line) => `- ${line.label}: ${money(line.amount)} (${formatNumber(line.share * 100, 0)}% of total)`),
    "Costs and hires cover the same period. Post-hire costs such as salary and training are excluded.",
  ].join("\n");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()} aria-label="Cost per hire inputs">
        <CalculatorToolbar onExample={loadExample} onClear={clearAll} exampleActive={exampleActive} />

        <FieldGroup legend="Period and hires" description="Use one period, such as a quarter or financial year, for every figure.">
          <NumberField
            id="cph-hires"
            label="Number of hires in the period"
            value={hires}
            onChange={(value) => {
              setHires(value);
              setExampleActive(false);
            }}
            step="1"
          />
          <CurrencySelect id="cph-currency" value={currency} onChange={setCurrency} />
        </FieldGroup>

        <FieldGroup legend="External costs" description="Money paid to outside parties for recruiting in the period.">
          {EXTERNAL_LINES.map((line) => (
            <NumberField
              key={line.id}
              id={`cph-${line.id}`}
              label={line.label}
              hint={line.hint}
              prefix={symbol}
              value={values[line.id] ?? ""}
              onChange={(value) => setValue(line.id, value)}
            />
          ))}
        </FieldGroup>

        <FieldGroup legend="Internal costs" description="Your own people and resources used for recruiting in the period.">
          {INTERNAL_LINES.map((line) => (
            <NumberField
              key={line.id}
              id={`cph-${line.id}`}
              label={line.label}
              hint={line.hint}
              prefix={symbol}
              value={values[line.id] ?? ""}
              onChange={(value) => setValue(line.id, value)}
            />
          ))}
        </FieldGroup>
      </form>

      <section
        aria-labelledby="cph-results-title"
        className="rounded-2xl border border-[#0050cb]/20 bg-[#070d1a] p-6 text-white shadow-[0_24px_80px_rgba(0,80,203,0.18)] md:p-8 lg:sticky lg:top-24"
      >
        <h3 id="cph-results-title" className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
          Your estimate
        </h3>
        <p className="mt-4 text-sm text-white/60">Cost per hire</p>
        <p className="mt-1 text-[2.25rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.75rem]">
          {result.costPerHire !== null ? money(result.costPerHire) : "—"}
        </p>
        <p aria-live="polite" className="mt-4 text-sm leading-relaxed text-white/75">
          {summary}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm">
          <div>
            <dt className="text-white/55">External costs</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.external)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Internal costs</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.internal)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Total recruiting cost</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.total)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Hires</dt>
            <dd className="mt-1 font-semibold tabular-nums">{formatNumber(result.hires, 0)}</dd>
          </div>
        </dl>

        {result.total > 0 ? (
          <div className="mt-6">
            <p className="text-xs font-medium text-white/55">External vs internal</p>
            <span aria-hidden className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
              <span
                className="h-full bg-[#0050cb] motion-safe:transition-[width] motion-safe:duration-300"
                style={{ width: `${externalShare * 100}%` }}
              />
              <span className="h-full flex-1 bg-[#7fa3f0]" />
            </span>
            <p className="mt-2 flex justify-between text-xs text-white/70">
              <span>External {formatNumber(externalShare * 100, 0)}%</span>
              <span>Internal {formatNumber((1 - externalShare) * 100, 0)}%</span>
            </p>
          </div>
        ) : null}

        <p className="mt-6 flex items-start gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/55">
          <MaterialIcon name="info" className="mt-0.5 shrink-0 text-[16px]! text-[#8eb0ff]" />
          An estimate based on your inputs, not an accounting figure. The calculation runs in your browser.
        </p>
        {result.costPerHire !== null ? <CopyResultButton text={copyText} /> : null}
      </section>

      {topLines.length > 0 ? (
        <div className="lg:col-span-2">
          <div
            role="region"
            aria-label="Cost breakdown by line"
            tabIndex={0}
            className="overflow-x-auto rounded-2xl border border-[#c3c6d6]/40 bg-white shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
          >
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="px-5 pt-5 text-left text-base font-bold text-[#141b2b] md:px-6">
                Cost breakdown, largest first
              </caption>
              <thead className="text-[#434654]">
                <tr className="border-b border-[#c3c6d6]/30">
                  <th scope="col" className="px-5 py-3 font-semibold md:px-6">Cost line</th>
                  <th scope="col" className="px-5 py-3 font-semibold md:px-6">Type</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold md:px-6">Amount</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold md:px-6">Per hire</th>
                  <th scope="col" className="w-[28%] px-5 py-3 font-semibold md:px-6">Share of total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c3c6d6]/25">
                {topLines.map((line) => (
                  <tr key={line.id}>
                    <th scope="row" className="px-5 py-3.5 font-medium text-[#141b2b] md:px-6">{line.label}</th>
                    <td className="px-5 py-3.5 capitalize text-[#434654] md:px-6">{line.group}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#141b2b] md:px-6">{money(line.amount)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-[#141b2b] md:px-6">
                      {line.perHire !== null ? money(line.perHire) : "—"}
                    </td>
                    <td className="px-5 py-3.5 md:px-6">
                      <span className="flex items-center gap-3">
                        <ShareBar share={line.share} tone={line.group === "external" ? "primary" : "secondary"} />
                        <span className="w-10 shrink-0 text-right tabular-nums text-[#434654]">
                          {formatNumber(line.share * 100, 0)}%
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

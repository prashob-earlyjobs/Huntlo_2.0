"use client";

import { useMemo, useState } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import {
  calculateAutomationRoi,
  currencySymbol,
  formatMoney,
  formatNumber,
  toNumber,
  type CurrencyCode,
} from "@/lib/recruitmentCalculators";

import { CalculatorToolbar, CopyResultButton, CurrencySelect, FieldGroup, NumberField, ShareBar } from "./CalculatorFields";

const TASKS = [
  { id: "sourcing", label: "Sourcing and candidate search" },
  { id: "outreach", label: "Outreach and follow-ups" },
  { id: "screening", label: "Preliminary screening calls" },
  { id: "scheduling", label: "Interview scheduling" },
] as const;

type TaskId = (typeof TASKS)[number]["id"];

type FormState = {
  recruiters: string;
  annualCost: string;
  hoursPerWeek: string;
  weeksPerYear: string;
  platformCost: string;
  implementationCost: string;
  taskHours: Record<TaskId, string>;
  taskReduction: Record<TaskId, string>;
  adoption: string;
  implementationMonths: string;
};

const EMPTY: FormState = {
  recruiters: "",
  annualCost: "",
  hoursPerWeek: "",
  weeksPerYear: "",
  platformCost: "",
  implementationCost: "",
  taskHours: { sourcing: "", outreach: "", screening: "", scheduling: "" },
  taskReduction: { sourcing: "", outreach: "", screening: "", scheduling: "" },
  adoption: "",
  implementationMonths: "",
};

/** Round, uniform values so the example reads as a placeholder rather than a claimed result. */
const EXAMPLE: FormState = {
  recruiters: "5",
  annualCost: "60000",
  hoursPerWeek: "40",
  weeksPerYear: "46",
  platformCost: "12000",
  implementationCost: "0",
  taskHours: { sourcing: "10", outreach: "6", screening: "5", scheduling: "3" },
  taskReduction: { sourcing: "25", outreach: "25", screening: "25", scheduling: "25" },
  adoption: "100",
  implementationMonths: "0",
};

export function RoiCalculator() {
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [exampleActive, setExampleActive] = useState(false);

  const symbol = currencySymbol(currency);
  const money = (value: number) => formatMoney(value, currency);

  const adoptionPercent = form.adoption.trim() === "" ? 100 : toNumber(form.adoption, 100);
  const implementationMonths = toNumber(form.implementationMonths, 12);

  const result = useMemo(
    () =>
      calculateAutomationRoi({
        recruiters: toNumber(form.recruiters),
        annualCostPerRecruiter: toNumber(form.annualCost),
        hoursPerWeek: toNumber(form.hoursPerWeek, 168),
        weeksPerYear: toNumber(form.weeksPerYear, 52),
        annualPlatformCost: toNumber(form.platformCost),
        implementationCost: toNumber(form.implementationCost),
        adoptionPercent,
        implementationMonths,
        tasks: TASKS.map((task) => ({
          id: task.id,
          label: task.label,
          hoursPerWeek: toNumber(form.taskHours[task.id], 168),
          reductionPercent: toNumber(form.taskReduction[task.id], 100),
        })),
      }),
    [form, adoptionPercent, implementationMonths],
  );

  const update = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
    setExampleActive(false);
  };
  const updateTask = (key: "taskHours" | "taskReduction", id: TaskId, value: string) => {
    setForm((current) => ({ ...current, [key]: { ...current[key], [id]: value } }));
    setExampleActive(false);
  };

  const maxTaskHours = Math.max(...result.tasks.map((task) => task.teamHoursSavedPerWeek), 0);
  const summary = result.ready
    ? `Estimated ${formatNumber(result.hoursSavedPerWeek)} recruiter hours freed per week (${formatNumber(result.hoursSavedPerYear, 0)} per year), worth ${money(result.valueOfTimeSaved)} a year at your team's hourly cost, equal to ${formatNumber(result.fteFreed, 2)} full-time recruiters.${
        result.roiPercent !== null
          ? ` Against a first-year cost of ${money(result.firstYearCost)}, the net first-year benefit is ${money(result.netBenefit)} (first-year ROI ${formatNumber(result.roiPercent, 0)}%).`
          : " Add platform cost to see ROI and payback."
      }`
    : "Enter team size, cost, working hours and at least one task with an expected time reduction to see your estimate.";

  const assumptions = result.ready
    ? [
        `${formatNumber(result.averageReductionPercent, 0)}% of the selected recruiter hours (${formatNumber(result.selectedHoursPerWeek)} hours per recruiter per week) can be avoided or redeployed.`,
        `${formatNumber(adoptionPercent, 0)}% of the team adopts the automation.`,
        implementationMonths > 0
          ? `Savings start after a ${formatNumber(implementationMonths, 1)}-month implementation period.`
          : "Savings start immediately, with no implementation period.",
        `Recruiter time is valued at ${money(result.hourlyCost)} an hour: annual cost per recruiter divided by working hours per year.`,
        "Time freed is capacity, not cash. It becomes a saving only if it is redeployed or avoids extra hiring.",
      ]
    : [];

  const copyText = [
    "Recruitment Automation ROI estimate (Huntlo calculator)",
    summary,
    ...(result.ongoingRoiPercent !== null
      ? [`Ongoing annual ROI, excluding one-time costs: ${formatNumber(result.ongoingRoiPercent, 0)}%.`]
      : []),
    "This estimate assumes:",
    ...assumptions.map((item) => `- ${item}`),
  ].join("\n");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
      <form className="space-y-6" onSubmit={(event) => event.preventDefault()} aria-label="Recruitment automation ROI inputs">
        <CalculatorToolbar
          onExample={() => {
            setForm(EXAMPLE);
            setExampleActive(true);
          }}
          onClear={() => {
            setForm(EMPTY);
            setExampleActive(false);
          }}
          exampleActive={exampleActive}
        />

        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
          <MaterialIcon name="straighten" className="text-[16px]!" />
          Step 1 · Measured inputs
        </p>

        <FieldGroup legend="Your recruiting team" description="Facts about your team today, used to work out the fully loaded hourly cost of recruiter time.">
          <NumberField
            id="roi-recruiters"
            label="Number of recruiters"
            value={form.recruiters}
            onChange={(value) => update({ recruiters: value })}
            step="1"
          />
          <NumberField
            id="roi-annual-cost"
            label="Annual cost per recruiter"
            hint="Fully loaded: salary, benefits, taxes and overheads."
            prefix={symbol}
            value={form.annualCost}
            onChange={(value) => update({ annualCost: value })}
          />
          <NumberField
            id="roi-hours"
            label="Working hours per week"
            suffix="hrs"
            max={168}
            value={form.hoursPerWeek}
            onChange={(value) => update({ hoursPerWeek: value })}
          />
          <NumberField
            id="roi-weeks"
            label="Working weeks per year"
            hint="Exclude holidays and leave."
            suffix="wks"
            max={52}
            value={form.weeksPerYear}
            onChange={(value) => update({ weeksPerYear: value })}
          />
        </FieldGroup>

        <FieldGroup
          legend="Time spent on each task today"
          description="Hours per recruiter per week. Measure these, for example with a two-week time log, rather than estimating from memory."
        >
          {TASKS.map((task) => (
            <NumberField
              key={task.id}
              id={`roi-${task.id}-hours`}
              label={task.label}
              suffix="hrs"
              max={168}
              value={form.taskHours[task.id]}
              onChange={(value) => updateTask("taskHours", task.id, value)}
            />
          ))}
        </FieldGroup>

        <FieldGroup legend="Automation cost" description="What you would pay in the first year.">
          <NumberField
            id="roi-platform"
            label="Annual platform cost"
            hint="All seats and usage you would need."
            prefix={symbol}
            value={form.platformCost}
            onChange={(value) => update({ platformCost: value })}
          />
          <NumberField
            id="roi-implementation"
            label="One-time implementation cost"
            hint="Set-up, integration and training. Optional."
            prefix={symbol}
            value={form.implementationCost}
            onChange={(value) => update({ implementationCost: value })}
          />
          <CurrencySelect id="roi-currency" value={currency} onChange={setCurrency} />
        </FieldGroup>

        <p className="flex items-center gap-2 pt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0050cb]">
          <MaterialIcon name="tune" className="text-[16px]!" />
          Step 2 · Your assumptions
        </p>

        <FieldGroup
          legend="Expected time reduction"
          description="Your own assumption for each task, ideally measured in a pilot. There are no defaults, because Huntlo has not published verified benchmark data for them."
        >
          {TASKS.map((task) => (
            <NumberField
              key={task.id}
              id={`roi-${task.id}-reduction`}
              label={task.label}
              suffix="%"
              max={100}
              value={form.taskReduction[task.id]}
              onChange={(value) => updateTask("taskReduction", task.id, value)}
            />
          ))}
        </FieldGroup>

        <FieldGroup legend="Rollout" description="Optional. Leave blank to assume full adoption from day one.">
          <NumberField
            id="roi-adoption"
            label="Adoption level"
            hint="Share of the team expected to use the automation. Blank means 100%."
            suffix="%"
            max={100}
            placeholder="100"
            value={form.adoption}
            onChange={(value) => update({ adoption: value })}
          />
          <NumberField
            id="roi-implementation-months"
            label="Implementation period"
            hint="Months before savings start. Reduces first-year value only."
            suffix="mths"
            max={12}
            value={form.implementationMonths}
            onChange={(value) => update({ implementationMonths: value })}
          />
        </FieldGroup>
      </form>

      <section
        aria-labelledby="roi-results-title"
        className="rounded-2xl border border-[#0050cb]/20 bg-[#070d1a] p-6 text-white shadow-[0_24px_80px_rgba(0,80,203,0.18)] md:p-8 lg:sticky lg:top-24"
      >
        <h3 id="roi-results-title" className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
          Your estimate
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-5">
          <div>
            <p className="text-sm text-white/60">Hours freed per week</p>
            <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.25rem]">
              {result.ready ? formatNumber(result.hoursSavedPerWeek) : "—"}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60">First-year ROI</p>
            <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight tabular-nums md:text-[2.25rem]">
              {result.ready && result.roiPercent !== null ? `${formatNumber(result.roiPercent, 0)}%` : "—"}
            </p>
          </div>
        </div>

        <p aria-live="polite" className="mt-5 text-sm leading-relaxed text-white/75">
          {summary}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-sm">
          <div>
            <dt className="text-white/55">Hourly cost</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.hourlyCost)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Hours freed per year</dt>
            <dd className="mt-1 font-semibold tabular-nums">{formatNumber(result.hoursSavedPerYear, 0)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Value of time freed per year</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.valueOfTimeSaved)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Capacity freed</dt>
            <dd className="mt-1 font-semibold tabular-nums">{formatNumber(result.fteFreed, 2)} FTE</dd>
          </div>
          <div>
            <dt className="text-white/55">First-year cost</dt>
            <dd className="mt-1 font-semibold tabular-nums">{money(result.firstYearCost)}</dd>
          </div>
          <div>
            <dt className="text-white/55">Net first-year benefit</dt>
            <dd className={`mt-1 font-semibold tabular-nums ${result.netBenefit < 0 ? "text-[#ffb4ab]" : ""}`}>
              {money(result.netBenefit)}
              {result.netBenefit < 0 ? <span className="sr-only"> (negative)</span> : null}
            </dd>
          </div>
          <div>
            <dt className="text-white/55">Ongoing annual ROI</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {result.ready && result.ongoingRoiPercent !== null ? `${formatNumber(result.ongoingRoiPercent, 0)}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-white/55">Payback period</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {result.ready && result.paybackMonths !== null
                ? `${formatNumber(result.paybackMonths)} months`
                : "—"}
            </dd>
          </div>
        </dl>

        {result.ready ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs font-medium text-white/55">Team hours freed per week, by task</p>
            <ul className="mt-3 space-y-3">
              {result.tasks.map((task) => (
                <li key={task.id} className="text-xs text-white/75">
                  <span className="flex justify-between gap-3">
                    <span>{task.label}</span>
                    <span className="tabular-nums text-white">{formatNumber(task.teamHoursSavedPerWeek)} hrs</span>
                  </span>
                  <span className="mt-1.5 block [&>span]:bg-white/10">
                    <ShareBar share={maxTaskHours > 0 ? task.teamHoursSavedPerWeek / maxTaskHours : 0} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {result.ready ? (
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs font-semibold text-white">This estimate assumes</p>
            <ul className="mt-3 space-y-2.5">
              {assumptions.map((item) => (
                <li key={item} className="flex gap-2 text-xs leading-relaxed text-white/75">
                  <MaterialIcon name="arrow_right" className="shrink-0 text-[16px]! text-[#8eb0ff]" />
                  {item}
                </li>
              ))}
            </ul>
            <CopyResultButton text={copyText} />
          </div>
        ) : (
          <p className="mt-6 flex items-start gap-2 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/55">
            <MaterialIcon name="info" className="mt-0.5 shrink-0 text-[16px]! text-[#8eb0ff]" />
            An estimate based on your assumptions, not a guaranteed saving. The calculation runs in your browser.
          </p>
        )}
      </section>
    </div>
  );
}

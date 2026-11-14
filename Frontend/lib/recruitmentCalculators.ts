export type CurrencyCode = "USD" | "INR" | "GBP" | "EUR";

export const CURRENCIES: { code: CurrencyCode; label: string; locale: string }[] = [
  { code: "USD", label: "US dollar (USD)", locale: "en-US" },
  { code: "INR", label: "Indian rupee (INR)", locale: "en-IN" },
  { code: "GBP", label: "Pound sterling (GBP)", locale: "en-GB" },
  { code: "EUR", label: "Euro (EUR)", locale: "en-IE" },
];

export function currencySymbol(code: CurrencyCode) {
  const locale = CURRENCIES.find((c) => c.code === code)?.locale ?? "en-US";
  return (
    new Intl.NumberFormat(locale, { style: "currency", currency: code, maximumFractionDigits: 0 })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? code
  );
}

export function formatMoney(value: number, code: CurrencyCode) {
  const locale = CURRENCIES.find((c) => c.code === code)?.locale ?? "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    maximumFractionDigits: Math.abs(value) < 100 ? 2 : 0,
  }).format(value);
}

export function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

/** Parses a free-text numeric field; blank, negative or invalid input counts as 0. */
export function toNumber(raw: string, max = Number.POSITIVE_INFINITY) {
  const value = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, max);
}

export type CostLine = { id: string; label: string; amount: number };

export type CostPerHireResult = {
  external: number;
  internal: number;
  total: number;
  hires: number;
  /** `null` until there is at least one hire and some cost. */
  costPerHire: number | null;
  lines: (CostLine & { group: "external" | "internal"; share: number; perHire: number | null })[];
};

/** ANSI/SHRM structure: (external costs + internal costs) ÷ total hires in the same period. */
export function calculateCostPerHire(
  externalLines: CostLine[],
  internalLines: CostLine[],
  hires: number,
): CostPerHireResult {
  const sum = (lines: CostLine[]) => lines.reduce((total, line) => total + line.amount, 0);
  const external = sum(externalLines);
  const internal = sum(internalLines);
  const total = external + internal;
  const hasResult = hires > 0 && total > 0;
  const tag = (group: "external" | "internal") => (line: CostLine) => ({
    ...line,
    group,
    share: total > 0 ? line.amount / total : 0,
    perHire: hires > 0 ? line.amount / hires : null,
  });
  return {
    external,
    internal,
    total,
    hires,
    costPerHire: hasResult ? total / hires : null,
    lines: [...externalLines.map(tag("external")), ...internalLines.map(tag("internal"))],
  };
}

export type AutomationTask = {
  id: string;
  label: string;
  /** Hours per recruiter per week spent on the task today. */
  hoursPerWeek: number;
  /** Expected reduction in that time, 0–100. */
  reductionPercent: number;
};

export type RoiInput = {
  recruiters: number;
  annualCostPerRecruiter: number;
  hoursPerWeek: number;
  weeksPerYear: number;
  tasks: AutomationTask[];
  annualPlatformCost: number;
  implementationCost: number;
  /** Share of the team expected to use the automation, 0–100. */
  adoptionPercent: number;
  /** Months before savings start, 0–12. */
  implementationMonths: number;
};

export type RoiResult = {
  hourlyCost: number;
  tasks: (AutomationTask & { teamHoursSavedPerWeek: number })[];
  /** Hours of selected task time the reductions apply to, before adoption. */
  selectedHoursPerWeek: number;
  /** Hours-weighted average reduction across the selected tasks, 0–100. */
  averageReductionPercent: number;
  /** Steady-state values, after adoption and once implementation is complete. */
  hoursSavedPerWeek: number;
  hoursSavedPerYear: number;
  valueOfTimeSaved: number;
  fteFreed: number;
  /** Value of time saved in the first year, after the implementation period. */
  firstYearValue: number;
  firstYearCost: number;
  netBenefit: number;
  /** First-year ROI; `null` when there is no cost to compare against. */
  roiPercent: number | null;
  /** Ongoing annual ROI excluding one-time costs; `null` without a platform cost. */
  ongoingRoiPercent: number | null;
  /** `null` when the time saved has no value. */
  paybackMonths: number | null;
  /** True once team size, cost, hours and at least one task saving have been entered. */
  ready: boolean;
};

export function calculateAutomationRoi(input: RoiInput): RoiResult {
  const annualHours = input.hoursPerWeek * input.weeksPerYear;
  const hourlyCost = annualHours > 0 ? input.annualCostPerRecruiter / annualHours : 0;
  const adoption = Math.min(Math.max(input.adoptionPercent, 0), 100) / 100;
  const rampMonths = Math.min(Math.max(input.implementationMonths, 0), 12);
  const tasks = input.tasks.map((task) => ({
    ...task,
    teamHoursSavedPerWeek: input.recruiters * task.hoursPerWeek * (task.reductionPercent / 100) * adoption,
  }));
  const selectedTasks = input.tasks.filter((task) => task.reductionPercent > 0);
  const selectedHoursPerWeek = selectedTasks.reduce((total, task) => total + task.hoursPerWeek, 0);
  const averageReductionPercent =
    selectedHoursPerWeek > 0
      ? selectedTasks.reduce((total, task) => total + task.hoursPerWeek * task.reductionPercent, 0) /
        selectedHoursPerWeek
      : 0;
  const hoursSavedPerWeek = tasks.reduce((total, task) => total + task.teamHoursSavedPerWeek, 0);
  const hoursSavedPerYear = hoursSavedPerWeek * input.weeksPerYear;
  const valueOfTimeSaved = hoursSavedPerYear * hourlyCost;
  const firstYearValue = valueOfTimeSaved * ((12 - rampMonths) / 12);
  const firstYearCost = input.annualPlatformCost + input.implementationCost;
  const netBenefit = firstYearValue - firstYearCost;
  return {
    hourlyCost,
    tasks,
    selectedHoursPerWeek,
    averageReductionPercent,
    hoursSavedPerWeek,
    hoursSavedPerYear,
    valueOfTimeSaved,
    fteFreed: annualHours > 0 ? hoursSavedPerYear / annualHours : 0,
    firstYearValue,
    firstYearCost,
    netBenefit,
    roiPercent: firstYearCost > 0 ? (netBenefit / firstYearCost) * 100 : null,
    ongoingRoiPercent:
      input.annualPlatformCost > 0
        ? ((valueOfTimeSaved - input.annualPlatformCost) / input.annualPlatformCost) * 100
        : null,
    paybackMonths:
      valueOfTimeSaved > 0 && firstYearCost > 0 ? rampMonths + firstYearCost / (valueOfTimeSaved / 12) : null,
    ready: input.recruiters > 0 && hourlyCost > 0 && hoursSavedPerWeek > 0,
  };
}

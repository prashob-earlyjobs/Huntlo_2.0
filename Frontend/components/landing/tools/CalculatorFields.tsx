"use client";

import { useState, type ReactNode } from "react";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { CURRENCIES, type CurrencyCode } from "@/lib/recruitmentCalculators";

const inputClass =
  "h-11 w-full min-w-0 rounded-xl border border-[#c3c6d6]/70 bg-white text-[0.9375rem] tabular-nums text-[#141b2b] placeholder:text-[#434654]/45 transition-colors duration-150 hover:border-[#0050cb]/40 focus:border-[#0050cb] focus:outline-none focus:ring-2 focus:ring-[#0050cb]/25";

const invalidInputClass = "border-[#ba1a1a]! focus:ring-[#ba1a1a]/25!";

/** Returns a plain-English error for a raw field value, or `null` when it is blank or valid. */
function fieldError(raw: string, max: number | undefined, step: string) {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return "Enter a number.";
  if (value < 0) return "Enter zero or a positive number. Negative values are counted as 0.";
  if (max !== undefined && value > max) return `Enter ${max} or less. Higher values are counted as ${max}.`;
  if (step === "1" && !Number.isInteger(value)) return "Enter a whole number.";
  return null;
}

type NumberFieldProps = {
  id: string;
  label: string;
  /** Extra context for screen readers when several fields share a visible label. */
  srContext?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  prefix?: string;
  suffix?: string;
  max?: number;
  placeholder?: string;
  step?: string;
};

export function NumberField({
  id,
  label,
  srContext,
  value,
  onChange,
  hint,
  prefix,
  suffix,
  max,
  placeholder = "0",
  step = "any",
}: NumberFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const error = fieldError(value, max, step);
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium leading-snug text-[#141b2b]">
        {label}
        {srContext ? <span className="sr-only">, {srContext}</span> : null}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-xs leading-relaxed text-[#434654]/85">
          {hint}
        </p>
      ) : null}
      <div className="relative mt-2">
        {prefix ? (
          <span
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-[#434654]"
            aria-hidden
          >
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step={step}
          value={value}
          placeholder={placeholder}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} ${prefix ? (prefix.length > 1 ? "pl-12" : "pl-8") : "pl-3.5"} ${
            suffix ? "pr-14" : "pr-3.5"
          } ${error ? invalidInputClass : ""}`}
        />
        {suffix ? (
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-sm text-[#434654]"
            aria-hidden
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-[#ba1a1a]">
          <MaterialIcon name="error" className="mt-px shrink-0 text-[14px]!" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Copies a plain-text result; render only once a result is shown. */
export function CopyResultButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  };
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eb0ff]/60"
      >
        <MaterialIcon name={state === "copied" ? "check" : "content_copy"} className="text-[18px]!" />
        {state === "copied" ? "Copied" : "Copy result and assumptions"}
      </button>
      <span role="status" className="text-xs text-white/60">
        {state === "failed" ? "Copying isn't available in this browser. Select the text above instead." : null}
      </span>
    </div>
  );
}

export function CurrencySelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-[#141b2b]">
        Currency
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value as CurrencyCode)}
          className={`${inputClass} appearance-none pl-3.5 pr-10`}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.label}
            </option>
          ))}
        </select>
        <MaterialIcon
          name="expand_more"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px]! text-[#434654]"
        />
      </div>
    </div>
  );
}

export function FieldGroup({
  legend,
  description,
  children,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-[#c3c6d6]/40 bg-[#faf9ff] p-5 md:p-6">
      <legend className="float-left w-full text-sm font-bold text-[#141b2b] md:text-base">{legend}</legend>
      {description ? (
        <p className="clear-left pt-1 text-sm leading-relaxed text-[#434654]">{description}</p>
      ) : null}
      <div className="clear-left grid gap-5 pt-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function CalculatorToolbar({
  onExample,
  onClear,
  exampleActive,
}: {
  onExample: () => void;
  onClear: () => void;
  exampleActive: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExample}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#0050cb]/30 bg-[#e9edff] px-4 py-2 text-sm font-medium text-[#0050cb] transition-colors duration-150 hover:bg-[#dfe6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
        >
          <MaterialIcon name="lightbulb" className="text-[18px]!" />
          Fill with example numbers
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#c3c6d6]/70 bg-white px-4 py-2 text-sm font-medium text-[#434654] transition-colors duration-150 hover:border-[#0050cb]/40 hover:text-[#141b2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0050cb]/40"
        >
          <MaterialIcon name="restart_alt" className="text-[18px]!" />
          Clear all
        </button>
      </div>
      {exampleActive ? (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-[#0050cb]/20 bg-[#f1f3ff] px-4 py-3 text-sm leading-relaxed text-[#141b2b]"
        >
          <MaterialIcon name="info" className="mt-0.5 shrink-0 text-[18px]! text-[#0050cb]" />
          Example numbers are illustrative inputs to show how the calculator works. They are not benchmarks or Huntlo
          data; replace them with your own.
        </p>
      ) : null}
    </div>
  );
}

/** Horizontal share bar; the figure it represents must also be given in text nearby. */
export function ShareBar({ share, tone = "primary" }: { share: number; tone?: "primary" | "secondary" }) {
  const width = `${Math.max(0, Math.min(1, share)) * 100}%`;
  return (
    <span aria-hidden className="block h-2 w-full overflow-hidden rounded-full bg-[#e9edff]">
      <span
        className={`block h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300 ${
          tone === "primary" ? "bg-[#0050cb]" : "bg-[#7fa3f0]"
        }`}
        style={{ width }}
      />
    </span>
  );
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { startAiVoiceDemo } from "@/lib/api/ai-voice-demo";
import { getApiErrorMessage } from "@/lib/api/errors";
import { DEMO_CALL_LIMIT, DEMO_JOBS } from "@/lib/aiVoiceRecruiter";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  PHONE_COUNTRIES,
  composeE164Mobile,
  getPhoneCountry,
  nationalNumberPlaceholder,
} from "@/lib/phone-countries";

type DemoCallsContextValue = {
  remaining: number;
  limit: number;
  applyRemaining: (remaining: number) => void;
};

const DemoCallsContext = createContext<DemoCallsContextValue | null>(null);

const DEMO_CALLS_STORAGE_KEY = "huntlo-ai-voice-demo-calls";

type StoredDemoCalls = {
  day: string;
  used: number;
};

function istDay(now = new Date()): string {
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

function readStoredRemaining(): number {
  if (typeof window === "undefined") return DEMO_CALL_LIMIT;
  try {
    const raw = window.localStorage.getItem(DEMO_CALLS_STORAGE_KEY);
    if (!raw) return DEMO_CALL_LIMIT;
    const parsed = JSON.parse(raw) as StoredDemoCalls;
    if (parsed.day !== istDay()) return DEMO_CALL_LIMIT;
    const used = Number(parsed.used);
    if (!Number.isFinite(used)) return DEMO_CALL_LIMIT;
    return Math.max(0, DEMO_CALL_LIMIT - Math.min(DEMO_CALL_LIMIT, used));
  } catch {
    return DEMO_CALL_LIMIT;
  }
}

function writeStoredRemaining(remaining: number) {
  if (typeof window === "undefined") return;
  const used = Math.max(0, DEMO_CALL_LIMIT - remaining);
  const payload: StoredDemoCalls = { day: istDay(), used };
  window.localStorage.setItem(DEMO_CALLS_STORAGE_KEY, JSON.stringify(payload));
}

export function DemoCallsProvider({ children }: { children: ReactNode }) {
  const [remaining, setRemaining] = useState(DEMO_CALL_LIMIT);

  useEffect(() => {
    setRemaining(readStoredRemaining());
  }, []);

  const value = useMemo<DemoCallsContextValue>(
    () => ({
      remaining,
      limit: DEMO_CALL_LIMIT,
      applyRemaining: (next: number) => {
        setRemaining((current) => {
          const value = Math.max(0, Math.min(DEMO_CALL_LIMIT, current, next));
          writeStoredRemaining(value);
          return value;
        });
      },
    }),
    [remaining]
  );

  return <DemoCallsContext.Provider value={value}>{children}</DemoCallsContext.Provider>;
}

export function useDemoCalls() {
  const value = useContext(DemoCallsContext);
  if (!value) {
    throw new Error("useDemoCalls must be used within DemoCallsProvider");
  }
  return value;
}

export type DemoFormValues = {
  company: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  volume: string;
};

const emptyValues: DemoFormValues = {
  company: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  volume: "",
};

type DemoCallFormProps = {
  variant: "hero" | "page";
  id?: string;
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 text-sm text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#5b4dff] focus:ring-2 focus:ring-[#5b4dff]/20";

const labelClass = "block text-xs font-semibold tracking-wide text-[#344054]";

export function DemoCallForm({ variant, id }: DemoCallFormProps) {
  const { remaining, limit, applyRemaining } = useDemoCalls();
  const [values, setValues] = useState<DemoFormValues>(emptyValues);
  const [countryIso, setCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [calledNumber, setCalledNumber] = useState<string | null>(null);

  function update(key: keyof DemoFormValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const browserRemaining = Math.min(remaining, readStoredRemaining());
    if (browserRemaining <= 0) {
      applyRemaining(0);
      setError("You've used both complimentary demo calls from this browser today.");
      return;
    }
    if (!values.company.trim() || !values.email.trim() || !values.phone.trim() || !values.role.trim()) {
      setError("Company, work email, mobile number, and role are required.");
      return;
    }
    if (!values.email.includes("@")) {
      setError("Enter a work email.");
      return;
    }
    const country = getPhoneCountry(countryIso);
    const phone = composeE164Mobile(country.dialCode, values.phone);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8) {
      setError("Enter a mobile number the AI Recruiter can call.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await startAiVoiceDemo({
        company: values.company.trim(),
        email: values.email.trim(),
        phone,
        job: values.role.trim(),
      });
      applyRemaining(Math.min(browserRemaining - 1, result.remaining));
      setCalledNumber(result.phone);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to start the demo call."));
    } finally {
      setSubmitting(false);
    }
  }

  if (calledNumber) {
    return (
      <div
        id={id}
        className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-[0_24px_80px_rgba(91,77,255,0.16)] backdrop-blur-xl"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b4dff]">
          Demo call queued
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#101828]">
          Your AI Recruiter is calling you.
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#475467]">
          Expect a call at <span className="font-semibold text-[#101828]">{calledNumber}</span> within
          30 seconds. The same recruiter agent will screen you the way it screens candidates for{" "}
          {values.role.trim() || "this role"}.
        </p>
        <p className="mt-4 text-xs text-[#667085]">
          {remaining} of {limit} complimentary calls remaining today.
        </p>
      </div>
    );
  }

  const isHero = variant === "hero";

  return (
    <form
      id={id}
      onSubmit={onSubmit}
      className={`rounded-3xl border border-white/50 bg-white/75 shadow-[0_24px_80px_rgba(16,24,40,0.08)] backdrop-blur-xl ${isHero ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b4dff]">
            {isHero ? "Live demo" : "Experience it"}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-[#101828]">
            {isHero ? "Try Huntlo AI Voice" : "Start a live demo call"}
          </h3>
        </div>
        <Waveform />
      </div>

      <div className={isHero ? "mt-4 grid gap-3 sm:grid-cols-2" : "mt-5 space-y-3"}>
        <label className={labelClass}>
          Company Name
          <input
            className={fieldClass}
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            autoComplete="organization"
          />
        </label>
        {variant === "page" ? (
          <label className={labelClass}>
            Name
            <input
              className={fieldClass}
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              autoComplete="name"
            />
          </label>
        ) : null}
        <label className={labelClass}>
          Work Email
          <input
            className={fieldClass}
            type="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
          />
        </label>
        <label className={`${labelClass} ${isHero ? "sm:col-span-2" : ""}`}>
          Mobile Number
          <div className="mt-1.5 flex gap-2">
            <select
              aria-label="Country code"
              className="w-[7.25rem] shrink-0 rounded-xl border border-black/10 bg-white/80 px-2.5 py-2.5 text-sm text-[#101828] outline-none transition focus:border-[#5b4dff] focus:ring-2 focus:ring-[#5b4dff]/20"
              value={countryIso}
              onChange={(event) => setCountryIso(event.target.value)}
            >
              {PHONE_COUNTRIES.map((country) => (
                <option key={country.iso} value={country.iso}>
                  {country.iso} +{country.dialCode}
                </option>
              ))}
            </select>
            <input
              id={isHero ? "ai-voice-phone" : undefined}
              className="min-w-0 flex-1 rounded-xl border border-black/10 bg-white/80 px-3.5 py-2.5 text-sm text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#5b4dff] focus:ring-2 focus:ring-[#5b4dff]/20"
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
              autoComplete="tel-national"
              autoFocus={isHero}
              placeholder={nationalNumberPlaceholder(countryIso)}
            />
          </div>
        </label>
        <label className={`${labelClass} ${isHero ? "sm:col-span-2" : ""}`}>
          Job
          <select
            className={fieldClass}
            value={values.role}
            onChange={(event) => update("role", event.target.value)}
          >
            <option value="">Select a job</option>
            {DEMO_JOBS.map((job) => (
              <option key={job} value={job}>
                {job}
              </option>
            ))}
          </select>
        </label>
        {isHero ? null : (
          <label className={labelClass}>
            Hiring Volume
            <input
              className={fieldClass}
              value={values.volume}
              onChange={(event) => update("volume", event.target.value)}
              placeholder="e.g. 40 hires / quarter"
            />
          </label>
        )}
      </div>

      <div className={`flex items-center justify-between gap-3 border-t border-black/5 ${isHero ? "mt-4 pt-3" : "mt-5 pt-4"}`}>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[#667085]">
            Calls remaining today
          </p>
          <p className="text-sm font-semibold tabular-nums text-[#101828]">
            {remaining} / {limit}
          </p>
        </div>
        <button
          type="submit"
          disabled={remaining <= 0 || submitting}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#5b4dff] px-5 text-sm font-semibold text-white shadow-lg shadow-[#5b4dff]/25 transition hover:bg-[#4a3de6] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Starting call…" : isHero ? "Start AI Demo Call" : "Start AI Demo"}
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#667085]">
        No sales call. Experience the AI recruiter yourself.
        {variant === "page" ? " Each company receives 2 complimentary AI demo calls." : null}
      </p>
      {error ? <p className="mt-2 text-xs font-medium text-[#b42318]">{error}</p> : null}
    </form>
  );
}

function Waveform() {
  return (
    <div className="flex h-8 items-end gap-0.5" aria-hidden>
      {[0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.75].map((scale, index) => (
        <span
          key={index}
          className="w-1 origin-bottom rounded-full bg-[#5b4dff]"
          style={{
            height: `${Math.round(scale * 28)}px`,
            animation: `ai-voice-bar 1.1s ease-in-out ${index * 0.12}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes ai-voice-bar {
          0%, 100% { transform: scaleY(0.45); opacity: 0.55; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

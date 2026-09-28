"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import {
  CAPABILITIES,
  CONVERSATION,
  HUNTLO_STEPS,
  SCORE_ROWS,
  SECURITY,
  TEAMS,
  TODAY_STEPS,
  TRUST_METRICS,
  WHY_CARDS,
  WORKFLOW,
} from "@/lib/aiVoiceRecruiter";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4dff]">{children}</p>
  );
}

function FlowColumn({
  title,
  summary,
  steps,
  tone,
}: {
  title: string;
  summary: string;
  steps: readonly string[];
  tone: "muted" | "accent";
}) {
  const accent = tone === "accent";

  return (
    <div
      className={
        accent
          ? "flex h-full flex-col rounded-3xl border border-[#5b4dff]/20 bg-white p-6 shadow-[0_18px_50px_rgba(91,77,255,0.1)] md:p-8"
          : "flex h-full flex-col rounded-3xl border border-[#eaecf0] bg-[#f8f9fb] p-6 md:p-8"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            className={
              accent
                ? "text-xs font-semibold uppercase tracking-[0.16em] text-[#5b4dff]"
                : "text-xs font-semibold uppercase tracking-[0.16em] text-[#667085]"
            }
          >
            {title}
          </h3>
          <p className="mt-2 text-xl font-semibold tracking-tight text-[#101828]">{summary}</p>
        </div>
        <span
          className={
            accent
              ? "shrink-0 rounded-full bg-[#efeefe] px-3 py-1 text-xs font-semibold text-[#5b4dff]"
              : "shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#667085]"
          }
        >
          {steps.length} steps
        </span>
      </div>
      <ol className="mt-8">
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step} className="relative flex gap-4 pb-5 last:pb-0">
              {last ? null : (
                <span
                  aria-hidden
                  className={
                    accent
                      ? "absolute bottom-0 left-4 top-8 w-px bg-[#5b4dff]/25"
                      : "absolute bottom-0 left-4 top-8 border-l border-dashed border-[#d0d5dd]"
                  }
                />
              )}
              <span
                className={
                  accent && last
                    ? "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#027a48] text-xs font-semibold text-white"
                    : accent
                      ? "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5b4dff] text-xs font-semibold text-white"
                      : "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#eaecf0] bg-white text-xs font-semibold text-[#667085]"
                }
              >
                {accent && last ? <Check aria-hidden className="size-4" /> : index + 1}
              </span>
              <span
                className={
                  accent && last
                    ? "pt-1 text-sm font-semibold text-[#027a48]"
                    : "pt-1.5 text-sm font-medium text-[#101828]"
                }
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function AiVoiceRecruiterSections({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <section className="border-y border-black/5 bg-[#f8f9fb] px-4 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[80rem]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#667085]">
            Trusted by Modern Recruiting Teams
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_METRICS.map((metric) => (
              <div key={metric.label} className="text-center">
                <p className="text-3xl font-semibold tracking-tight text-[#101828] md:text-4xl">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-[#667085]">{metric.label}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-[#475467]">
            Built for Staffing Agencies, Recruiters, Talent Acquisition Teams, and Enterprise Hiring.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="comparison">
        <div className="mx-auto max-w-[80rem]">
          <SectionLabel>Traditional recruiting vs Huntlo</SectionLabel>
          <h2 className="mt-4 max-w-[20ch] text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
            Stop spending recruiter hours on repetitive screening.
          </h2>
          <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
            <FlowColumn
              title="Recruiter today"
              summary="Seven steps. Then do them again."
              steps={TODAY_STEPS}
              tone="muted"
            />
            <FlowColumn
              title="Huntlo"
              summary="AI screens. You review the shortlist."
              steps={HUNTLO_STEPS}
              tone="accent"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="recruiter">
        <div className="mx-auto grid max-w-[80rem] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionLabel>Meet your AI Recruiter</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
              A recruiter that never skips the first call.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#667085]">
              The AI Recruiter that screens every candidate before your recruiters spend a single
              minute on the phone.
            </p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(91,77,255,0.1)] backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5b4dff]">
                  Live agent
                </p>
                <p className="mt-1 text-lg font-semibold text-[#101828]">Huntlo Recruiter</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#ecfdf3] px-3 py-1 text-xs font-semibold text-[#027a48]">
                <span className="size-1.5 rounded-full bg-[#12b76a]" />
                On a call
              </span>
            </div>
            <div className="mt-6 h-16 overflow-hidden rounded-2xl bg-gradient-to-r from-[#efeefe] via-white to-[#eef4ff]">
              <div className="flex h-full items-center justify-center gap-1">
                {Array.from({ length: 28 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-[#5b4dff]/80"
                    style={{
                      height: `${12 + ((index * 17) % 36)}px`,
                      animation: reduceMotion
                        ? undefined
                        : `ai-voice-bar 1.2s ease-in-out ${(index % 7) * 0.08}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {CAPABILITIES.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[#344054]">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[#5b4dff]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="conversation">
        <div className="mx-auto grid max-w-[80rem] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <SectionLabel>Conversation demo</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
              Hear the screen. Then read the score.
            </h2>
            <div className="mt-8 space-y-3">
              {CONVERSATION.map((turn, index) => (
                <motion.div
                  key={`${turn.speaker}-${index}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                  className={
                    turn.speaker === "AI"
                      ? "max-w-[34rem] rounded-2xl rounded-bl-md bg-[#101828] px-4 py-3 text-sm leading-relaxed text-white"
                      : "ml-auto max-w-[28rem] rounded-2xl rounded-br-md border border-black/5 bg-[#f8f9fb] px-4 py-3 text-sm leading-relaxed text-[#101828]"
                  }
                >
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
                    {turn.speaker}
                  </p>
                  {turn.text}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#12b76a]/20 bg-white p-6 shadow-[0_18px_60px_rgba(16,24,40,0.06)] lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#027a48]">
              After the conversation
            </p>
            <p className="mt-3 text-sm text-[#667085]">Candidate score</p>
            <p className="text-5xl font-semibold tracking-tight text-[#101828]">94%</p>
            <div className="mt-6 space-y-3">
              {SCORE_ROWS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#344054]">{row.label}</span>
                  <span className="tracking-widest text-[#5b4dff]" aria-label={`${row.stars} of 5`}>
                    {"★".repeat(row.stars)}
                    <span className="text-[#d0d5dd]">{"★".repeat(5 - row.stars)}</span>
                  </span>
                </div>
              ))}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-[#f8f9fb] p-3">
                <dt className="text-xs text-[#667085]">Notice period</dt>
                <dd className="mt-1 font-semibold text-[#101828]">30 Days</dd>
              </div>
              <div className="rounded-2xl bg-[#f8f9fb] p-3">
                <dt className="text-xs text-[#667085]">Salary</dt>
                <dd className="mt-1 font-semibold text-[#101828]">₹18 LPA</dd>
              </div>
              <div className="rounded-2xl bg-[#ecfdf3] p-3">
                <dt className="text-xs text-[#027a48]">Interested</dt>
                <dd className="mt-1 font-semibold text-[#027a48]">YES</dd>
              </div>
              <div className="rounded-2xl bg-[#ecfdf3] p-3">
                <dt className="text-xs text-[#027a48]">Recommended</dt>
                <dd className="mt-1 font-semibold text-[#027a48]">Interview</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] px-4 py-20 md:px-8 md:py-28 lg:px-12" id="workflow">
        <div className="mx-auto max-w-[80rem]">
          <SectionLabel>Interactive workflow</SectionLabel>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
            From hiring need to hire.
          </h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {WORKFLOW.map((step, index) => (
              <motion.li
                key={step}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : index * 0.05 }}
                className="rounded-2xl border border-black/5 bg-white p-4"
              >
                <p className="text-xs font-semibold tabular-nums text-[#5b4dff]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#101828]">{step}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12" id="time">
        <div className="mx-auto max-w-[80rem]">
          <SectionLabel>Recruiters save time</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
            300 calls become 28 interviews.
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-black/5 bg-[#f8f9fb] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#667085]">
                Without Huntlo
              </h3>
              <ul className="mt-6 space-y-3 text-sm font-medium text-[#344054]">
                {["300 Candidates", "300 Calls", "300 Notes", "300 Follow-ups", "Recruiter Burnout"].map(
                  (item) => (
                    <li key={item} className="rounded-xl bg-white px-4 py-3">
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="rounded-3xl border border-[#12b76a]/20 bg-white p-6 shadow-[0_16px_50px_rgba(18,183,106,0.08)]">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#027a48]">
                With Huntlo
              </h3>
              <ul className="mt-6 space-y-3 text-sm font-medium text-[#101828]">
                {["300 Candidates", "AI Voice", "28 Qualified", "Recruiter Interviews", "Hire"].map(
                  (item, index) => (
                    <li
                      key={item}
                      className={
                        index >= 2
                          ? "rounded-xl bg-[#ecfdf3] px-4 py-3 text-[#027a48]"
                          : "rounded-xl bg-[#f8f9fb] px-4 py-3"
                      }
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8f9fb] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[80rem]">
          <SectionLabel>Why recruiters love Huntlo Voice</SectionLabel>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight text-[#101828] md:text-5xl">
            Screening that feels like a conversation.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {WHY_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-3xl border border-white bg-white/80 p-6 shadow-sm backdrop-blur"
              >
                <h3 className="text-base font-semibold text-[#101828]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#667085]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[80rem]">
          <SectionLabel>Built for every hiring team</SectionLabel>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEAMS.map((team) => (
              <article key={team.title} className="rounded-3xl border border-black/5 bg-[#f8f9fb] p-6">
                <h3 className="text-base font-semibold text-[#101828]">{team.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#667085]">{team.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#101828] px-4 py-10 text-white md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[80rem] flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm font-semibold tracking-wide">Enterprise security</p>
          <ul className="flex flex-wrap gap-2">
            {SECURITY.map((item) => (
              <li
                key={item}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

"use client";

import { AI_VOICE_RECRUITER_FAQS } from "@/lib/aiVoiceRecruiter";

import { useDemoCalls } from "./DemoCallForm";

export function AiVoiceRecruiterClosing() {
  return (
    <>
      <section className="bg-white px-4 py-20 md:px-8 md:py-24 lg:px-12" id="faqs">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4dff]">FAQ</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#101828] md:text-4xl">
            Questions before the first call.
          </h2>
          <div className="mt-8 space-y-3">
            {AI_VOICE_RECRUITER_FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-black/5 bg-[#f8f9fb] p-5 open:bg-white open:shadow-md"
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-[#101828] marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#475467]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#101828] px-4 py-24 text-white md:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,77,255,0.35),_transparent_58%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            Stop screening.
            <span className="mt-2 block">Start hiring.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            Experience the AI Recruiter built for modern hiring teams.
          </p>
          <a
            href="#hero-demo"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#101828] transition hover:bg-[#efeefe]"
          >
            Start Free AI Demo
          </a>
        </div>
      </section>
    </>
  );
}

export function AiVoiceStickyCta() {
  const { remaining, limit } = useDemoCalls();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <a
        href="#hero-demo"
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#101828]/95 px-4 py-2 text-sm text-white shadow-xl backdrop-blur"
      >
        <span className="font-semibold">Start AI Demo</span>
        <span className="text-white/60">{remaining} / {limit} free calls remaining</span>
      </a>
    </div>
  );
}

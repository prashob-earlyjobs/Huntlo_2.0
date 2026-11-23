"use client";

export function AiRecruitingAutomationMultiLocationVoiceExperience() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Why Agentic Workflows Matter
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Traditional automation often follows a fixed sequence. Distributed
            recruitment introduces situations that require more context. A
            candidate&apos;s preferred location changes. A hiring manager requests a
            different interview process. A vacancy closes while candidate
            conversations remain active. An agentic workflow can be designed
            to recognize such events and determine which approved action should
            happen next.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            Automation should not independently make employment decisions or
            override local hiring policies. The system should surface
            exceptions and maintain human accountability.
          </p>
        </div>

        <div className="mt-12">
          <div className="rounded-2xl border border-[#d7e3f4] bg-white p-4 md:p-6 shadow-sm text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0050cb]">
                <span className="sr-only">SYSTEM</span>
              </span>
              <span className="text-xs font-bold text-[#141b2b] uppercase tracking-[0.1em]">
                SYSTEM
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#434654] mb-4">
              Hello, this is an automated call about the role you applied
              for. Are you available to speak for a few minutes?
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8eef7]">
                <span className="sr-only">CANDIDATE</span>
              </span>
              <span className="text-xs font-bold text-[#141b2b] uppercase tracking-[0.1em]">
                CANDIDATE
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#434654] mb-4">
              Yes. I&apos;m interested. Can you tell me the shift timings
              and work location?
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0050cb]">
                <span className="sr-only">SYSTEM</span>
              </span>
              <span className="text-xs font-bold text-[#141b2b] uppercase tracking-[0.1em]">
                SYSTEM
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#434654] mb-4">
              The role is at our north location, with shifts from 9 AM to 5
              PM. Does that work for you?
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8eef7]">
                <span className="sr-only">CANDIDATE</span>
              </span>
              <span className="text-xs font-bold text-[#141b2b] uppercase tracking-[0.1em]">
                CANDIDATE
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#434654]">
              Yes, I can work those hours. I&apos;m interested in moving
              forward.
            </p>
            <p className="mt-6 text-xs text-[#8a93a8] italic">
              Illustrative call transcript. Actual system behavior must be
              verified.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

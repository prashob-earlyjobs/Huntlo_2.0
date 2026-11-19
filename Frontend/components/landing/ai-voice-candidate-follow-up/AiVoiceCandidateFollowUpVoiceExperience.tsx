"use client";

export function AiVoiceCandidateFollowUpVoiceExperience() {
  return (
    <section className="bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
          <h2 className="text-[1.75rem] font-bold tracking-tight text-[#141b2b] sm:text-[2.25rem]">
            Follow-Up Should Be Contextual
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            A generic reminder can be useful in some situations. But not every
            candidate needs the same message. A candidate waiting for interview
            details needs information. A candidate who has requested a callback
            needs coordination. A candidate who has already declined the
            opportunity should not receive another promotional call.
          </p>
          <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-[#434654] md:text-lg">
            A useful follow-up process begins by understanding the current
            stage of the candidate&apos;s journey. The communication should
            reflect that stage. This is where workflow design matters more than
            simply increasing call volume.
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
              Hello, this is an automated follow-up about the role you
              applied for. Are you still interested in moving forward?
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
              Yes. I&apos;d like to confirm my interview time.
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
              Your interview is scheduled for Thursday at 10 AM. Does that
              still work?
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
              Yes, Thursday at 10 AM works for me.
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

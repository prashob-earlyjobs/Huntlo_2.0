"use client";

import Link from "next/link";
import { motion } from "motion/react";

type MultilingualRecruitmentStoryProps = {
  reduceMotion: boolean;
};

export function MultilingualRecruitmentStory({
  reduceMotion,
}: MultilingualRecruitmentStoryProps) {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Mobile-first India
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Reach candidates wherever they are.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Huntlo is built for India&apos;s mobile-first talent pool. Our platform lets you run
              high-volume outreach in Hindi, English, or any local language across voice and
              messaging.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Launch AI-driven WhatsApp campaigns and automated IVR calls at scale, so candidates
              hear about your jobs on the channels they use most - and respond even without sending
              a résumé.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-[#434654]">
              Pair outreach with{" "}
              <Link
                href="/ai-voice-recruiter"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                AI Voice Recruiter
              </Link>{" "}
              and{" "}
              <Link
                href="/candidate-sourcing"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Candidate Sourcing
              </Link>
              , or{" "}
              <Link
                href="/contact"
                className="font-semibold text-[#0050cb] underline-offset-4 hover:underline"
              >
                Contact Sales
              </Link>{" "}
              to map your hiring markets.
            </p>
          </div>
        </div>
      </section>

      <section
        id="whatsapp-voice-outreach"
        className="scroll-mt-24 bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              WhatsApp &amp; Voice Outreach
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              Target leads. Start conversations. Keep momentum.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              With Huntlo, a recruiter can target thousands of leads from any source - job centers,
              referrals, online forms - and the AI reaches out via WhatsApp or voice. Broadcast a
              WhatsApp message (text, audio, or video), then follow up individually. Or initiate a
              phone call, explain the role, and let candidates respond by voice or keypad. Each reply
              is interpreted by the AI, and interested candidates are tagged for next steps.
            </p>
          </div>

          <motion.div
            className="mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6"
            initial={reduceMotion ? false : { y: 12 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8eb0ff]">
              Illustrative recruiter flow
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
              <li>1. Select an approved leads list for a local hiring drive.</li>
              <li>2. Launch WhatsApp job alerts and AI voice screens in preferred languages.</li>
              <li>3. Capture interest, availability, and basic fit signals automatically.</li>
              <li>4. Route responsive candidates to recruiters for the next human step.</li>
            </ul>
          </motion.div>
        </div>
      </section>
    </>
  );
}

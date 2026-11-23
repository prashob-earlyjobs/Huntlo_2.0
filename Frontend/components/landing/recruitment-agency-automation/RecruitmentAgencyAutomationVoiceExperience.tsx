"use client";

import { motion } from "motion/react";

import { AGENCY_AUTOMATION_BOUNDARIES } from "@/lib/recruitmentAgencyAutomation";

export function RecruitmentAgencyAutomationVoiceExperience() {
  return (
    <section
      id="automation-boundaries"
      className="bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <h2 className="text-[1.75rem] font-bold leading-[1.2] tracking-tight text-[#141b2b] md:text-[2.25rem] lg:text-[2.5rem]">
            Where Automation Helps and Where It Does Not
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
            An agency&apos;s reputation depends on the judgment behind each
            submission. Automation is most useful when it removes coordination
            work without taking over that judgment.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {AGENCY_AUTOMATION_BOUNDARIES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={`rounded-2xl border p-6 ${
                index === 0
                  ? "border-[#cde5d2] bg-[#f4faf5]"
                  : index === 3
                    ? "border-[#f0dcc1] bg-[#fdf8f1]"
                    : "border-[#d7e3f4] bg-[#fbfcfe]"
              }`}
            >
              <h3 className="text-sm font-semibold text-[#141b2b]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5b6478]">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 max-w-3xl rounded-2xl border border-[#d7e3f4] bg-white p-6"
        >
          <p className="text-base leading-relaxed text-[#434654] md:text-lg">
            Agencies should also confirm candidate permission before each
            outreach, keep client confidentiality intact, and define who may
            revise a submission before it reaches the client.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

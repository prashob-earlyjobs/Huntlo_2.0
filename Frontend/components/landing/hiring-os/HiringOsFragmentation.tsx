import { ADDED_SOFTWARE, TOOL_SWITCHING } from "@/lib/hiringOs";

export function HiringOsFragmentation() {
  return (
    <>
      <section className="border-b border-[#c3c6d6]/30 bg-white px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Fragmented operations
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Recruiting teams were never designed to work across twenty tools.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Today&apos;s recruiter switches between platforms all day. The problem isn&apos;t the
              individual tools. The problem is the workflow between them.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2" role="list">
            {TOOL_SWITCHING.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-center gap-2" role="listitem">
                <span className="rounded-full border border-[#c3c6d6]/40 bg-[#f7f8fc] px-3.5 py-2 text-sm text-[#141b2b]">
                  {item}
                </span>
                {index < TOOL_SWITCHING.length - 1 ? (
                  <span className="hidden text-[#0050cb]/40 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 rounded-3xl border border-[#c3c6d6]/30 bg-[#f7f8fc] p-6 md:grid-cols-2 md:p-8">
            <p className="text-lg font-semibold text-[#141b2b] md:text-xl">
              Hiring isn&apos;t slowing down because recruiters aren&apos;t productive.
            </p>
            <p className="text-base leading-relaxed text-[#434654] md:text-lg">
              It&apos;s slowing down because recruiting operations have become fragmented.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              Tool sprawl
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              More software doesn&apos;t create better hiring.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/65 md:text-lg">
              Recruiting teams have added more products than ever — yet recruiters still spend
              significant time coordinating workflows instead of hiring talent.
            </p>
            <p className="mt-6 text-lg font-semibold text-white">
              More tools rarely solve disconnected processes.
              <span className="mt-2 block text-[#8eb0ff]">
                Modern recruiting requires connected infrastructure.
              </span>
            </p>
          </div>

          <ul className="grid gap-2 sm:grid-cols-2">
            {ADDED_SOFTWARE.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white/80"
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

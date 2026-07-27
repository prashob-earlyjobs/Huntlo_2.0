import { COMPLEXITY_CHAIN, RECRUITING_STACK } from "@/lib/aiHiringInfrastructure";

export function AiHiringProblem() {
  return (
    <>
      <section className="bg-[#070d1a] px-4 py-20 text-white md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8eb0ff]">
              The hidden bottleneck
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight md:text-[2.5rem]">
              The problem nobody talks about
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
              Hiring isn&apos;t slowed down because recruiters don&apos;t work hard enough. It&apos;s
              slowed down because recruiting has become operationally complex.
            </p>
            <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
              One hiring requirement often means a chain of disconnected systems and handoffs.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2 md:gap-2.5" role="list">
            {COMPLEXITY_CHAIN.map((item, index) => (
              <div key={item} className="flex items-center gap-2" role="listitem">
                <span className="rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white/85 backdrop-blur-sm">
                  {item}
                </span>
                {index < COMPLEXITY_CHAIN.length - 1 ? (
                  <span className="hidden text-white/30 sm:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 border-t border-white/10 pt-10 md:grid-cols-2">
            <p className="text-2xl font-bold tracking-tight md:text-3xl">
              More software.
              <span className="mt-1 block text-white/55">Less recruiting.</span>
            </p>
            <p className="text-base leading-relaxed text-white/70 md:text-lg">
              Modern recruiters aren&apos;t short on effort. They&apos;re short on time.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[#c3c6d6]/30 bg-[#f7f8fc] px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0050cb]">
              Point solutions
            </p>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#141b2b] md:text-[2.5rem]">
              Existing recruiting software solves individual problems
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#434654] md:text-lg">
              Today&apos;s recruiting stack looks like a list of tools — each useful, few connected.
            </p>
            <p className="mt-4 text-base leading-relaxed text-[#434654] md:text-lg">
              Every product solves an individual problem. Few solve the hiring problem itself.
            </p>
            <p className="mt-6 text-lg font-semibold text-[#141b2b]">
              Hiring doesn&apos;t happen in silos.
              <span className="mt-1 block text-[#0050cb]">Neither should recruiting technology.</span>
            </p>
          </div>

          <ol className="space-y-0 rounded-2xl border border-[#c3c6d6]/35 bg-white p-2">
            {RECRUITING_STACK.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-4 border-b border-[#c3c6d6]/25 px-4 py-3.5 last:border-b-0"
              >
                <span className="w-7 shrink-0 text-xs font-semibold tabular-nums text-[#0050cb]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-[#141b2b] md:text-base">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

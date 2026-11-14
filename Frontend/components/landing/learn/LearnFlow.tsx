import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { formatLearnDate, type LearnFlow, type LearnSource } from "@/lib/learnPages";

/** Compact first-viewport diagram for the dark article hero. Stacks linearly on mobile. */
export function LearnFlowDiagram({ flow }: { flow: LearnFlow }) {
  if (flow.kind === "sources") {
    return (
      <figure className="mt-6">
        <figcaption className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
          {flow.label}
        </figcaption>
        <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <ul className="flex flex-wrap gap-2" aria-label="Inputs">
            {flow.steps.map((step) => (
              <li
                key={step.label}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"
              >
                {step.label}
              </li>
            ))}
          </ul>
          <MaterialIcon name="arrow_forward" className="hidden shrink-0 text-[18px]! text-[#8eb0ff] sm:inline-block" />
          <MaterialIcon name="arrow_downward" className="text-[18px]! text-[#8eb0ff] sm:hidden" />
          {flow.result ? (
            <p className="shrink-0 rounded-full bg-[#0050cb] px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-[#0050cb]/25">
              <span className="sr-only">Combined into: </span>
              {flow.result}
            </p>
          ) : null}
        </div>
      </figure>
    );
  }

  return (
    <figure className="mt-6">
      <figcaption className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/55">
        {flow.label}
      </figcaption>
      <ol className="mt-3 grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
        {flow.steps.map((step, index) => (
          <li key={step.label} className="rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-3">
            <span className="block text-[0.65rem] font-semibold tabular-nums text-[#8eb0ff]">
              <span className="sr-only">Step </span>
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-1 block text-sm font-semibold leading-snug text-white">{step.label}</span>
            {step.detail ? (
              <span className="mt-1 block text-xs leading-snug text-white/60">{step.detail}</span>
            ) : null}
          </li>
        ))}
      </ol>
      {flow.result ? <p className="mt-3 text-xs leading-relaxed text-white/60">{flow.result}</p> : null}
    </figure>
  );
}

export function SourceDate({ source }: { source: LearnSource }) {
  if (source.date) {
    return <time dateTime={source.date}>{formatLearnDate(source.date)}</time>;
  }
  if (source.accessed) {
    return (
      <>
        accessed <time dateTime={source.accessed}>{formatLearnDate(source.accessed)}</time>
      </>
    );
  }
  return null;
}

import type { ProductSurface as ProductSurfaceData, SurfaceActor, SurfaceBlock } from "@/lib/productSurfaceTypes";

const ACTOR_LABEL: Record<SurfaceActor, string> = {
  ai: "AI agent",
  recruiter: "Recruiter",
  candidate: "Candidate",
  system: "System",
};

const ACTOR_CLASS: Record<SurfaceActor, string> = {
  ai: "bg-[#e9edff] text-[#0050cb]",
  recruiter: "bg-[#141b2b] text-white",
  candidate: "bg-[#f1f3f9] text-[#434654]",
  system: "bg-[#f1f3f9] text-[#5b6075]",
};

function ActorBadge({ actor }: { actor: SurfaceActor }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTOR_CLASS[actor]}`}
    >
      {ACTOR_LABEL[actor]}
    </span>
  );
}

function BlockLabel({ children }: { children: string }) {
  return (
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5b6075]">{children}</p>
  );
}

function ScoreMeter({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-[#e4e7f2]">
        <span className="absolute inset-y-0 left-0 rounded-full bg-[#0050cb]" style={{ width: `${value}%` }} />
      </span>
      <span className="text-[11px] font-semibold tabular-nums text-[#141b2b]">{value}</span>
    </span>
  );
}

const CELL_CLASS = {
  open: "border-[#0050cb]/25 bg-[#f1f4ff] text-[#0050cb]",
  booked: "border-[#0050cb] bg-[#0050cb] text-white",
  busy: "border-[#e4e7f2] bg-[repeating-linear-gradient(135deg,#f1f3f9,#f1f3f9_4px,#e8ebf3_4px,#e8ebf3_8px)] text-[#8a8fa3]",
  none: "border-transparent bg-transparent text-transparent",
} as const;

const CELL_TEXT = { open: "Open", booked: "Booked", busy: "Busy", none: "" } as const;

function Block({ block }: { block: SurfaceBlock }) {
  switch (block.type) {
    case "prompt":
      return (
        <div className="rounded-xl border border-[#0050cb]/25 bg-[#f7f9ff] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0050cb]">{block.label}</p>
          <p className="mt-1.5 text-[13px] leading-snug text-[#141b2b]">{block.text}</p>
        </div>
      );

    case "chips":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="flex flex-wrap gap-1.5">
            {block.items.map((chip) => (
              <li
                key={chip.text}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  chip.accent
                    ? "border-[#0050cb]/30 bg-[#e9edff] text-[#0050cb]"
                    : "border-[#e4e7f2] bg-white text-[#434654]"
                }`}
              >
                {chip.text}
              </li>
            ))}
          </ul>
        </div>
      );

    case "rows":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="divide-y divide-[#eef0f6] overflow-hidden rounded-xl border border-[#e4e7f2]">
            {block.items.map((row) => (
              <li
                key={`${row.title}-${row.subtitle ?? ""}`}
                className={`flex items-center gap-3 px-3 py-2.5 ${row.accent ? "bg-[#f7f9ff]" : "bg-white"}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    row.accent ? "bg-[#0050cb] text-white" : "bg-[#eef0f6] text-[#434654]"
                  }`}
                >
                  {row.title
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12.5px] font-semibold text-[#141b2b]">{row.title}</span>
                  {row.subtitle ? (
                    <span className="block truncate text-[11px] text-[#5b6075]">{row.subtitle}</span>
                  ) : null}
                </span>
                {row.meta ? (
                  <span className="hidden shrink-0 text-[11px] text-[#5b6075] sm:inline">{row.meta}</span>
                ) : null}
                {typeof row.score === "number" ? <ScoreMeter value={row.score} /> : null}
                {row.badge ? (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      row.accent ? "bg-[#0050cb] text-white" : "bg-[#eef0f6] text-[#434654]"
                    }`}
                  >
                    {row.badge}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      );

    case "timeline":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ol className="relative space-y-2 pl-4 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-[#dfe3ee]">
            {block.items.map((item) => (
              <li key={`${item.time}-${item.text}`} className="relative flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span
                  className={`absolute -left-4 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                    item.actor === "recruiter" ? "bg-[#141b2b]" : item.actor === "ai" ? "bg-[#0050cb]" : "bg-[#a9afc2]"
                  }`}
                />
                <span className="w-10 shrink-0 text-[11px] font-semibold tabular-nums text-[#5b6075]">{item.time}</span>
                <span className="min-w-0 flex-1 text-[12.5px] text-[#141b2b]">{item.text}</span>
                <ActorBadge actor={item.actor} />
              </li>
            ))}
          </ol>
        </div>
      );

    case "rules":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <dl className="overflow-hidden rounded-xl border border-[#e4e7f2] font-mono text-[12px]">
            {block.items.map((rule) => (
              <div key={rule.key} className="flex border-b border-[#eef0f6] last:border-b-0">
                <dt className="w-20 shrink-0 bg-[#f7f8fc] px-3 py-2 font-semibold text-[#0050cb]">{rule.key}</dt>
                <dd className="min-w-0 flex-1 px-3 py-2 text-[#141b2b]">{rule.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case "bars":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="space-y-2">
            {block.items.map((bar) => (
              <li key={bar.label}>
                <div className="flex items-center justify-between gap-3 text-[11.5px]">
                  <span className="font-medium text-[#141b2b]">{bar.label}</span>
                  <span className="tabular-nums text-[#5b6075]">{bar.display ?? `${bar.value}%`}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eef0f6]">
                  <div className="h-full rounded-full bg-[#0050cb]" style={{ width: `${bar.value}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      );

    case "messages":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="space-y-2">
            {block.items.map((message) => {
              const outbound = message.from !== "candidate";
              return (
                <li key={`${message.time ?? ""}-${message.text}`} className={`flex ${outbound ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      outbound
                        ? "rounded-tl-sm border border-[#e4e7f2] bg-white"
                        : "rounded-tr-sm bg-[#0050cb] text-white"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-semibold ${outbound ? "text-[#5b6075]" : "text-white/75"}`}
                    >
                      {message.from === "huntlo" ? "Huntlo" : message.from === "recruiter" ? "Recruiter" : "Candidate"}
                      {message.channel ? ` · ${message.channel}` : ""}
                      {message.time ? ` · ${message.time}` : ""}
                    </p>
                    <p className={`mt-0.5 text-[12.5px] leading-snug ${outbound ? "text-[#141b2b]" : "text-white"}`}>
                      {message.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );

    case "calendar":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <div
            className="grid gap-1 text-[10.5px]"
            style={{ gridTemplateColumns: `3rem repeat(${block.days.length}, minmax(0, 1fr))` }}
          >
            <span />
            {block.days.map((day) => (
              <span key={day} className="pb-1 text-center font-semibold text-[#5b6075]">
                {day}
              </span>
            ))}
            {block.times.map((time, timeIndex) => (
              <div key={time} className="contents">
                <span className="flex items-center font-medium tabular-nums text-[#5b6075]">{time}</span>
                {block.days.map((day, dayIndex) => {
                  const state = block.cells[timeIndex]?.[dayIndex] ?? "none";
                  return (
                    <span
                      key={`${time}-${day}`}
                      className={`flex h-7 items-center justify-center rounded-md border font-semibold ${CELL_CLASS[state]}`}
                    >
                      {CELL_TEXT[state]}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );

    case "stats":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <dl
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${Math.min(block.items.length, 4)}, minmax(0, 1fr))` }}
          >
            {block.items.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#e4e7f2] bg-[#fbfcff] px-3 py-2.5">
                <dt className="text-[10px] font-medium text-[#5b6075]">{stat.label}</dt>
                <dd className="mt-0.5 text-[17px] font-bold tabular-nums leading-tight text-[#141b2b]">{stat.value}</dd>
                {stat.note ? <dd className="text-[10px] text-[#0050cb]">{stat.note}</dd> : null}
              </div>
            ))}
          </dl>
        </div>
      );

    case "split":
      return (
        <div className="overflow-hidden rounded-xl border border-[#e4e7f2]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center bg-[#f7f8fc] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em]">
            <span className="text-[#0050cb]">{block.leftLabel}</span>
            <span />
            <span className="text-[#141b2b]">{block.rightLabel}</span>
          </div>
          <ul className="divide-y divide-[#eef0f6]">
            {block.items.map((item) => (
              <li key={item.left} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 text-[12.5px]">
                <span className="text-[#141b2b]">{item.left}</span>
                <span className="text-[#0050cb]/60" aria-hidden>
                  →
                </span>
                <span className="font-semibold text-[#141b2b]">{item.right}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "panels":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="grid gap-2 sm:grid-cols-3">
            {block.items.map((panel) => (
              <li key={panel.title} className="rounded-xl border border-[#e4e7f2] bg-[#fbfcff] p-3">
                <p className="text-[12.5px] font-semibold leading-snug text-[#141b2b]">{panel.title}</p>
                {panel.subtitle ? (
                  <p className="mt-0.5 text-[10.5px] leading-snug text-[#5b6075]">{panel.subtitle}</p>
                ) : null}
                {panel.badge ? (
                  <span className="mt-1.5 inline-block rounded-full bg-[#e9edff] px-1.5 py-0.5 text-[9.5px] font-semibold text-[#0050cb]">
                    {panel.badge}
                  </span>
                ) : null}
                <dl className="mt-2.5 space-y-1">
                  {panel.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between text-[11px]">
                      <dt className="text-[#5b6075]">{stat.label}</dt>
                      <dd className="font-semibold tabular-nums text-[#141b2b]">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </div>
      );

    case "table":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <div className="overflow-hidden rounded-xl border border-[#e4e7f2]">
            <table className="w-full border-collapse text-left text-[11.5px]">
              <thead className="bg-[#f7f8fc]">
                <tr>
                  {block.columns.map((column) => (
                    <th key={column} scope="col" className="px-3 py-2 font-semibold text-[#5b6075]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.join("|")} className="border-t border-[#eef0f6]">
                    {row.map((cell, index) => (
                      <td
                        key={`${index}-${cell}`}
                        className={`px-3 py-2 ${index === 0 ? "font-semibold text-[#141b2b]" : "tabular-nums text-[#434654]"}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "layers":
      return (
        <div>
          {block.label ? <BlockLabel>{block.label}</BlockLabel> : null}
          <ul className="space-y-1.5">
            {block.items.map((layer) => (
              <li
                key={layer.label}
                className={`rounded-xl border px-3 py-2.5 ${
                  layer.accent ? "border-[#0050cb]/35 bg-[#f1f4ff]" : "border-[#e4e7f2] bg-white"
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    layer.accent ? "text-[#0050cb]" : "text-[#5b6075]"
                  }`}
                >
                  {layer.label}
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {layer.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-[#e4e7f2] bg-white px-2 py-0.5 text-[11px] font-medium text-[#141b2b]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      );

    case "stages":
      return (
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {block.items.map((stage) => (
            <li
              key={stage.step}
              className={`flex flex-col rounded-xl border p-3 ${
                stage.actor === "recruiter" ? "border-[#141b2b]/20 bg-[#f7f8fc]" : "border-[#e4e7f2] bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold tabular-nums text-[#5b6075]">{stage.step}</span>
                <ActorBadge actor={stage.actor} />
              </div>
              <p className="mt-2 text-[12.5px] font-semibold leading-snug text-[#141b2b]">{stage.title}</p>
              <ul className="mt-1.5 space-y-1">
                {stage.lines.map((line) => (
                  <li key={line} className="text-[11px] leading-snug text-[#5b6075]">
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      );

    case "note":
      return (
        <p
          className={`flex items-start gap-2 rounded-xl px-3 py-2 text-[11.5px] leading-snug ${
            block.tone === "review"
              ? "border border-[#141b2b]/15 bg-[#141b2b] text-white"
              : "border border-[#e4e7f2] bg-[#f7f8fc] text-[#434654]"
          }`}
        >
          <span
            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${block.tone === "review" ? "bg-[#8eb0ff]" : "bg-[#0050cb]"}`}
          />
          {block.text}
        </p>
      );

    case "actions":
      return (
        <div className="flex flex-wrap gap-2">
          {block.items.map((action) => (
            <span
              key={action.label}
              className={`rounded-lg px-3 py-1.5 text-[11.5px] font-semibold ${
                action.primary
                  ? "bg-[#0050cb] text-white"
                  : "border border-[#e4e7f2] bg-white text-[#141b2b]"
              }`}
            >
              {action.label}
            </span>
          ))}
        </div>
      );
  }
}

type ProductSurfaceProps = {
  surface: ProductSurfaceData;
  /** Background the figure sits on; controls caption colour. */
  tone?: "dark" | "light";
  caption?: string;
  disclaimer?: string;
  className?: string;
};

const DEFAULT_DISCLAIMER =
  "Illustrative example of the Huntlo workspace; names and figures are not customer data.";

/** Renders an illustrative Huntlo working surface as product UI, always captioned as illustrative. */
export function ProductSurface({
  surface,
  tone = "dark",
  caption,
  disclaimer = DEFAULT_DISCLAIMER,
  className = "",
}: ProductSurfaceProps) {
  const captionClass = tone === "dark" ? "text-white/55" : "text-[#5b6075]";

  return (
    <figure className={`w-full ${className}`}>
      <div
        role="img"
        aria-label={surface.alt}
        className="overflow-hidden rounded-2xl border border-[#c3c6d6]/50 bg-white text-left text-[#141b2b] shadow-[0_30px_90px_-34px_rgba(0,80,203,0.55)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#e4e7f2] bg-[#f7f8fc] px-4 py-2.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#0050cb] text-[10px] font-bold text-white">
              H
            </span>
            <span className="truncate text-[11.5px] font-semibold text-[#141b2b]">{surface.workspace}</span>
            <span className="hidden text-[11.5px] text-[#a9afc2] sm:inline">/</span>
            <span className="hidden truncate text-[11.5px] text-[#5b6075] sm:inline">{surface.view}</span>
          </span>
          {surface.status ? (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8f6ee] px-2 py-0.5 text-[10px] font-semibold text-[#17794a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#17794a] motion-safe:animate-pulse" />
              {surface.status}
            </span>
          ) : null}
        </div>
        <div className="space-y-3 p-4 sm:p-5">
          {surface.blocks.map((block, index) => (
            <Block key={`${block.type}-${index}`} block={block} />
          ))}
        </div>
        {surface.flow?.length ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[#e4e7f2] bg-[#fbfcff] px-4 py-2.5 text-[11px] text-[#5b6075]">
            <span className="font-semibold text-[#141b2b]">Feeds into</span>
            {surface.flow.map((step, index) => (
              <span key={step} className="flex items-center gap-x-2">
                {index > 0 ? <span className="text-[#0050cb]/50">→</span> : null}
                {step}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <figcaption className={`mt-3 text-[11.5px] leading-relaxed ${captionClass}`}>
        {caption ? <span className="font-medium">{caption} </span> : null}
        {disclaimer}
      </figcaption>
    </figure>
  );
}

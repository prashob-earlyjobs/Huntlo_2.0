import Link from "next/link";

import { MaterialIcon } from "@/components/landing/MaterialIcon";

const PILLARS = [
  {
    icon: "verified_user",
    title: "Human oversight",
    body: "Recruiters set the criteria, review AI output before shortlists and submissions, and make every hiring decision.",
    link: { label: "Human + AI Hiring", href: "/human-ai-hiring" },
  },
  {
    icon: "admin_panel_settings",
    title: "Governance",
    body: "Approved templates, role-based permissions and audit trails for AI actions keep automated work reviewable.",
    link: { label: "Security practices", href: "/security" },
  },
  {
    icon: "lock",
    title: "Data & privacy",
    body: "Candidate data is processed under Huntlo's published privacy policy, terms and cookie policy.",
    link: { label: "Privacy policy", href: "/privacy" },
  },
] as const;

const INTEGRATIONS = [
  { name: "Gmail", live: true },
  { name: "WhatsApp", live: true },
  { name: "Calendly", live: true },
  { name: "LinkedIn", live: false },
] as const;

type TrustLayerProps = {
  tone?: "dark" | "light";
  /** Single-row variant for detail pages. */
  compact?: boolean;
  title?: string;
};

/** Human oversight, governance and integration proof surfaced inside the buying journey. */
export function TrustLayer({ tone = "light", compact = false, title }: TrustLayerProps) {
  const dark = tone === "dark";
  const card = dark ? "border-white/10 bg-white/[0.04]" : "border-[#c3c6d6]/35 bg-white";
  const heading = dark ? "text-white" : "text-[#141b2b]";
  const body = dark ? "text-white/65" : "text-[#434654]";
  const link = dark ? "text-[#8eb0ff]" : "text-[#0050cb]";

  const integrations = (
    <div className={`rounded-2xl border p-5 ${card}`}>
      <p className={`flex items-center gap-2 text-sm font-bold ${heading}`}>
        <MaterialIcon name="extension" className={`text-[18px]! ${link}`} />
        Integrations
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {INTEGRATIONS.map((item) => (
          <li
            key={item.name}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              dark ? "border-white/15 text-white/85" : "border-[#c3c6d6]/50 text-[#141b2b]"
            }`}
          >
            {item.name}
            {item.live ? null : (
              <span className={`text-[10px] font-medium ${dark ? "text-white/50" : "text-[#5b6075]"}`}>
                · Coming soon
              </span>
            )}
          </li>
        ))}
      </ul>
      <Link
        href="/integrations"
        className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline ${link}`}
      >
        View integrations
        <MaterialIcon name="arrow_forward" className="text-[14px]!" />
      </Link>
    </div>
  );

  if (compact) {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1.1fr]">
        {PILLARS.slice(0, 2).map((pillar) => (
          <div key={pillar.title} className={`rounded-2xl border p-5 ${card}`}>
            <p className={`flex items-center gap-2 text-sm font-bold ${heading}`}>
              <MaterialIcon name={pillar.icon} className={`text-[18px]! ${link}`} />
              {pillar.title}
            </p>
            <p className={`mt-2 text-sm leading-relaxed ${body}`}>{pillar.body}</p>
          </div>
        ))}
        {integrations}
      </div>
    );
  }

  return (
    <div>
      {title ? <h3 className={`text-lg font-bold md:text-xl ${heading}`}>{title}</h3> : null}
      <div className={`grid gap-3 md:grid-cols-2 lg:grid-cols-4 ${title ? "mt-5" : ""}`}>
        {PILLARS.map((pillar) => (
          <div key={pillar.title} className={`flex flex-col rounded-2xl border p-5 ${card}`}>
            <p className={`flex items-center gap-2 text-sm font-bold ${heading}`}>
              <MaterialIcon name={pillar.icon} className={`text-[18px]! ${link}`} />
              {pillar.title}
            </p>
            <p className={`mt-2 flex-1 text-sm leading-relaxed ${body}`}>{pillar.body}</p>
            <Link
              href={pillar.link.href}
              className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline ${link}`}
            >
              {pillar.link.label}
              <MaterialIcon name="arrow_forward" className="text-[14px]!" />
            </Link>
          </div>
        ))}
        {integrations}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { BookDemoLink } from "@/components/landing/BookDemoLink";
import { LandingLogo } from "@/components/landing/LandingLogo";
import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { AGENTS_NAV_LINKS, PILLAR_AGENTS } from "@/lib/agents/pillarAgents";

import { agentsPrimaryCtaClass } from "./agentsTokens";

export function AgentsNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [agentsOpen, setAgentsOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="sticky top-0 z-[100] border-b border-[#e8eef7] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center" aria-label="Huntlo home">
          <LandingLogo priority className="h-8 w-auto sm:h-9" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {AGENTS_NAV_LINKS.map((link) =>
            "mega" in link && link.mega ? (
              <div key={link.label} className="group relative">
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center gap-0.5 rounded-md px-3 text-sm font-medium text-[#141b2b] transition-colors hover:text-[#0050cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
                  aria-haspopup="true"
                >
                  {link.label}
                  <MaterialIcon
                    name="expand_more"
                    className="text-[1.125rem] transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </Link>
                <div
                  className="pointer-events-none invisible absolute left-1/2 top-full z-[120] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100"
                  role="menu"
                  aria-label="AI Agents"
                >
                  <div className="rounded-xl border border-[#e8eef7] bg-white p-3 shadow-lg shadow-slate-900/5">
                    <ul className="grid gap-1 sm:grid-cols-2">
                      {PILLAR_AGENTS.map((agent) => (
                        <li key={agent.id}>
                          <Link
                            href={agent.href}
                            role="menuitem"
                            className="block rounded-lg p-3 transition-colors hover:bg-[#f8fafc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
                          >
                            <span className="block text-sm font-semibold text-[#141b2b]">
                              {agent.name}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-[#5b6478]">
                              {agent.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#141b2b] transition-colors hover:text-[#0050cb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden shrink-0 lg:block">
          <BookDemoLink className={agentsPrimaryCtaClass}>Book a Demo</BookDemoLink>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-[#141b2b] lg:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
          aria-expanded={mobileOpen}
          aria-controls={menuId}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <MaterialIcon name={mobileOpen ? "close" : "menu"} />
        </button>
      </div>

      {mobileOpen ? (
        <div
          id={menuId}
          className="border-t border-[#e8eef7] bg-white px-4 py-4 lg:hidden"
        >
          <div className="mx-auto flex max-w-[1280px] flex-col gap-2">
            {AGENTS_NAV_LINKS.map((link) =>
              "mega" in link && link.mega ? (
                <div key={link.label}>
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between rounded-md px-2 text-sm font-medium text-[#141b2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
                    aria-expanded={agentsOpen}
                    onClick={() => setAgentsOpen((o) => !o)}
                  >
                    {link.label}
                    <MaterialIcon
                      name="expand_more"
                      className={`text-lg transition-transform ${agentsOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {agentsOpen ? (
                    <ul className="mt-2 space-y-1 rounded-xl border border-[#e8eef7] bg-[#f8fafc] p-2">
                      {PILLAR_AGENTS.map((agent) => (
                        <li key={agent.id}>
                          <Link
                            href={agent.href}
                            className="block rounded-lg p-3 text-sm font-semibold text-[#141b2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
                            onClick={() => setMobileOpen(false)}
                          >
                            {agent.name}
                            <span className="mt-0.5 block text-xs font-normal text-[#5b6478]">
                              {agent.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-[#141b2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0050cb]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <BookDemoLink
              className={`${agentsPrimaryCtaClass} mt-2 w-full`}
              onClick={() => setMobileOpen(false)}
            >
              Book a Demo
            </BookDemoLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}

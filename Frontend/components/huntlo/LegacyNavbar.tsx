"use client";

import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BarChart3,
  ChevronDown,
  Menu,
  MessagesSquare,
  Search,
  X,
} from "lucide-react";
import { HuntloMark } from "@/components/landing/LandingLogo";
import { Button } from "@/components/huntlo/ui/button";
import { SolutionsMegaMenu } from "@/components/huntlo/SolutionsMegaMenu";
import { cn } from "@/lib/utils";
import {
  V2_BOOK_DEMO_PATH,
  V2_PLATFORM_ITEMS,
  V2_PRIMARY_LINKS,
  V2_SOLUTIONS_HUB_PATH,
} from "@/lib/v2Nav";

const platformIcons = [AudioLines, Search, MessagesSquare, BarChart3] as const;
const MENU_CLOSE_MS = 180;

const platformItems = V2_PLATFORM_ITEMS.map((item, i) => ({
  ...item,
  icon: platformIcons[i] ?? AudioLines,
}));

const links = V2_PRIMARY_LINKS;

export function LegacyLogo({ className }: { className?: string }) {
  return <HuntloMark className={className} />;
}

/** Homepage chrome — Platform + Solutions menus use live V2 destinations. */
export function LegacyNavbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = (name: string) => {
    clearCloseTimer();
    setOpen(name);
  };

  const scheduleCloseMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(null), MENU_CLOSE_MS);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearCloseTimer();
        setOpen(null);
        setDrawer(false);
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        clearCloseTimer();
        setOpen(null);
      }
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      clearCloseTimer();
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[110] overflow-visible border-b transition-colors",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background",
      )}
    >
      <nav
        ref={navRef}
        className="container-x relative flex h-16 items-center justify-between gap-4 overflow-visible"
        aria-label="Main"
      >
        <a href="#top" className="shrink-0" aria-label="Huntlo home">
          <LegacyLogo />
        </a>

        <ul className="hidden items-center gap-1 overflow-visible lg:flex">
          <li
            className="relative overflow-visible"
            onMouseEnter={() => openMenu("Platform")}
            onMouseLeave={scheduleCloseMenu}
          >
            <button
              type="button"
              className="flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              aria-expanded={open === "Platform"}
              aria-haspopup="true"
              onClick={() =>
                open === "Platform" ? scheduleCloseMenu() : openMenu("Platform")
              }
            >
              Platform
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", open === "Platform" && "rotate-180")}
              />
            </button>
            {open === "Platform" && (
              <div className="absolute left-0 top-full z-[120] w-[22rem] pt-2">
                <div className="animate-rise rounded-2xl border border-border bg-popover p-2 shadow-lift">
                  {platformItems.map((it) => (
                    <a
                      key={it.label}
                      href={it.href}
                      className="flex min-h-11 gap-3 rounded-xl p-3 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-accent text-primary">
                        <it.icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-foreground">{it.label}</span>
                        <span className="block text-xs text-muted-foreground">{it.desc}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </li>

          <li
            className="relative overflow-visible"
            onMouseEnter={() => openMenu("Solutions")}
            onMouseLeave={scheduleCloseMenu}
          >
            <button
              type="button"
              className="flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              aria-expanded={open === "Solutions"}
              aria-haspopup="true"
              onClick={() =>
                open === "Solutions" ? scheduleCloseMenu() : openMenu("Solutions")
              }
              onFocus={() => openMenu("Solutions")}
            >
              Solutions
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", open === "Solutions" && "rotate-180")}
              />
            </button>
            {open === "Solutions" && (
              <div className="absolute left-1/2 top-full z-[120] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 pt-2">
                <div className="animate-rise">
                  {/* Don't unmount on click — closing before navigation cancels the <a> default. */}
                  <SolutionsMegaMenu />
                </div>
              </div>
            )}
          </li>

          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="ghost" asChild>
            <a href="/login">Sign In</a>
          </Button>
          <Button variant="brand" asChild>
            <a href={V2_BOOK_DEMO_PATH} target="_blank" rel="noopener noreferrer">
              Book a Demo
            </a>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden"
          aria-label={drawer ? "Close menu" : "Open menu"}
          aria-expanded={drawer}
          onClick={() => setDrawer(!drawer)}
        >
          {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {drawer && (
        <div className="animate-rise max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <div className="container-x space-y-6 py-6">
            <div>
              <p className="eyebrow mb-2 text-muted-foreground">Platform</p>
              {platformItems.map((it) => (
                <a
                  key={it.label}
                  href={it.href}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted"
                >
                  <it.icon className="h-4 w-4 text-primary" />
                  <span className="text-[0.95rem] font-medium">{it.label}</span>
                </a>
              ))}
            </div>
            <div>
              <a
                href={V2_SOLUTIONS_HUB_PATH}
                className="eyebrow mb-3 inline-flex text-muted-foreground hover:text-foreground"
              >
                Solutions
              </a>
              <SolutionsMegaMenu
                stacked
                className="border-0 bg-transparent p-0 shadow-none"
              />
            </div>
            <div className="border-t border-border pt-4">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="flex min-h-11 items-center px-2 font-medium"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" asChild>
                <a href="/login">Sign In</a>
              </Button>
              <Button variant="brand" size="lg" asChild>
                <a
                  href={V2_BOOK_DEMO_PATH}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setDrawer(false)}
                >
                  Book a Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

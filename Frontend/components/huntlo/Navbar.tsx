"use client";

import { useEffect, useId, useRef, useState, type ComponentType } from "react";
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
  V2_HOME_PATH,
  V2_PLATFORM_ITEMS,
  V2_PRIMARY_LINKS,
  V2_SIGN_IN_PATH,
  type V2NavItem,
} from "@/lib/v2Nav";

const platformIcons = [AudioLines, Search, MessagesSquare, BarChart3] as const;
const MENU_CLOSE_MS = 180;

function withIcons(items: V2NavItem[], icons: readonly ComponentType<{ className?: string }>[]) {
  return items.map((item, i) => ({ ...item, icon: icons[i] ?? AudioLines }));
}

const platformMenu = withIcons(V2_PLATFORM_ITEMS, platformIcons);

const dropdownNames = ["Platform", "Solutions"] as const;

export function Logo({ className }: { className?: string }) {
  return <HuntloMark className={className} />;
}

export function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

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
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
      clearCloseTimer();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  return (
    <header
      className={cn(
        "sticky top-0 z-[110] overflow-visible border-b transition-[background-color,border-color,backdrop-filter]",
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
        <a href={V2_HOME_PATH} className="shrink-0" aria-label="Huntlo home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 overflow-visible lg:flex">
          {dropdownNames.map((name) => {
            const panelId = `${menuId}-${name}`;
            const isSolutions = name === "Solutions";
            const isOpen = open === name;
            return (
              <li
                key={name}
                className="relative overflow-visible"
                onMouseEnter={() => openMenu(name)}
                onMouseLeave={scheduleCloseMenu}
              >
                <button
                  type="button"
                  className="flex min-h-11 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-haspopup="true"
                  onClick={() => (isOpen ? scheduleCloseMenu() : openMenu(name))}
                  onFocus={() => openMenu(name)}
                >
                  {name}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div
                    id={panelId}
                    className={cn(
                      "absolute top-full z-[120] pt-2",
                      isSolutions
                        ? "left-1/2 w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2"
                        : "left-0 w-[22rem]",
                    )}
                  >
                    {isSolutions ? (
                      <div className="animate-rise">
                        {/* Don't unmount on click — closing before navigation cancels the <a> default. */}
                        <SolutionsMegaMenu />
                      </div>
                    ) : (
                      <div className="animate-rise rounded-2xl border border-border bg-popover p-2 shadow-lift">
                        {platformMenu.map((it) => (
                          <a
                            key={it.href}
                            href={it.href}
                            className="flex min-h-11 gap-3 rounded-xl p-3 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-accent text-primary">
                              <it.icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-medium text-foreground">
                                {it.label}
                              </span>
                              {it.desc ? (
                                <span className="block text-xs text-muted-foreground">{it.desc}</span>
                              ) : null}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {V2_PRIMARY_LINKS.map((l) => (
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
            <a href={V2_SIGN_IN_PATH} className="min-h-11">
              Sign In
            </a>
          </Button>
          <Button variant="brand" asChild>
            <a
              href={V2_BOOK_DEMO_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11"
            >
              Book a Demo
            </a>
          </Button>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-lg border border-border lg:hidden"
          aria-label={drawer ? "Close menu" : "Open menu"}
          aria-expanded={drawer}
          onClick={() => setDrawer(!drawer)}
        >
          {drawer ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {drawer && (
        <div className="animate-rise max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <div className="container-x space-y-2 py-4">
            {dropdownNames.map((name) => {
              const isOpen = accordion === name;
              const isSolutions = name === "Solutions";
              return (
                <div key={name} className="border-b border-border pb-2">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-1 px-2 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setAccordion(isOpen ? null : name)}
                  >
                    <span className="text-sm font-semibold">{name}</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
                      aria-hidden
                    />
                  </button>
                  {isOpen &&
                    (isSolutions ? (
                      <div className="pb-2">
                        <SolutionsMegaMenu
                          stacked
                          className="border-0 bg-transparent p-0 shadow-none"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 pb-2">
                        {platformMenu.map((it) => (
                          <a
                            key={it.href}
                            href={it.href}
                            className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted"
                          >
                            <it.icon className="h-4 w-4 text-primary" />
                            <span className="text-[0.95rem] font-medium">{it.label}</span>
                          </a>
                        ))}
                      </div>
                    ))}
                </div>
              );
            })}
            <div className="pt-2">
              {V2_PRIMARY_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="flex min-h-11 items-center px-2 font-medium"
                >
                  {l.label}
                </a>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="outline" size="lg" asChild>
                <a href={V2_SIGN_IN_PATH}>Sign In</a>
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

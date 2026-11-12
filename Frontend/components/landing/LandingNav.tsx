"use client";

import Link from "next/link";
import { useState } from "react";
import { BookDemoLink } from "./BookDemoLink";
import { HomeSectionLink } from "./HomeSectionLink";
import { LandingLogo } from "./LandingLogo";
import { MaterialIcon } from "./MaterialIcon";
import { HOME_NAV_LINKS } from "@/lib/landingNavSections";
import { PLATFORM_NAV_COLUMNS, PLATFORM_NAV_ITEMS, PLATFORM_NAV_PATH } from "@/lib/platformNav";
import { SOLUTIONS_NAV_COLUMNS, SOLUTIONS_NAV_ITEMS } from "@/lib/solutionsNav";

const NAV_BOOK_DEMO_CLASS =
  "rounded-full bg-[#0050cb] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0050cb]/20 transition-all hover:bg-[#003fa4]";

const NAV_BOOK_DEMO_MOBILE_CLASS =
  "rounded-full bg-[#0050cb] px-6 py-2.5 text-center text-sm font-medium text-white";

const NAV_LINK_CLASS =
  "text-sm font-medium text-[#434654] transition-colors hover:text-[#0050cb]";

type NavDropdownItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

type NavDropdownProps = {
  label: string;
  href: string;
  columns: NavDropdownItem[][];
};

function NavDropdown({ label, href, columns }: NavDropdownProps) {
  // After a click the pointer may still rest on the menu; keep it closed until the pointer leaves.
  const [suppressed, setSuppressed] = useState(false);
  const close = (event: React.MouseEvent<HTMLElement>) => {
    setSuppressed(true);
    event.currentTarget.blur();
  };

  return (
    <div className="group relative" onMouseLeave={() => setSuppressed(false)}>
      <Link
        href={href}
        className={`${NAV_LINK_CLASS} inline-flex items-center gap-0.5 py-2`}
        aria-haspopup="true"
        onClick={close}
      >
        {label}
        <MaterialIcon
          name="expand_more"
          className={`text-[1.125rem] transition-transform ${suppressed ? "" : "group-hover:rotate-180"}`}
        />
      </Link>

      <div
        className={`landing-nav-solutions-dropdown pointer-events-none invisible absolute left-1/2 top-full z-[120] -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-150 ${
          suppressed
            ? ""
            : "group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100"
        }`}
        role="menu"
        aria-label={label}
      >
        <div className="landing-nav-solutions-panel">
          <div className="landing-nav-solutions-grid">
            {columns.map((column, columnIndex) => (
              <div key={columnIndex} className="landing-nav-solutions-column">
                {column.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="landing-nav-solutions-item"
                    role="menuitem"
                    onClick={close}
                  >
                    <span className="landing-nav-solutions-item-title">{item.title}</span>
                    <span className="landing-nav-solutions-item-desc">{item.description}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type MobileNavGroupProps = {
  label: string;
  open: boolean;
  onToggle: () => void;
  items: NavDropdownItem[];
  overview?: { title: string; href: string };
  onNavigate: () => void;
};

function MobileNavGroup({ label, open, onToggle, items, overview, onNavigate }: MobileNavGroupProps) {
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between text-sm font-medium text-[#434654]"
        onClick={onToggle}
        aria-expanded={open}
      >
        {label}
        <MaterialIcon
          name="expand_more"
          className={`text-lg transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="mt-3 space-y-3 rounded-xl border border-[#c3c6d6]/30 bg-[#faf9ff] p-3">
          {overview ? (
            <Link
              href={overview.href}
              className="block rounded-lg p-2 text-sm font-semibold text-[#0050cb] transition-colors hover:bg-white"
              onClick={onNavigate}
            >
              {overview.title}
            </Link>
          ) : null}
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-lg p-2 transition-colors hover:bg-white"
              onClick={onNavigate}
            >
              <span className="block text-sm font-semibold text-[#141b2b]">{item.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-[#434654]">
                {item.description}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function LandingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobilePlatformOpen, setMobilePlatformOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="landing-nav sticky top-0 z-[100] border-b border-[#c3c6d6]/25 bg-white/90 backdrop-blur-md">
      <div className="landing-nav-inner">
        <Link href="/" className="flex min-w-0 shrink items-center">
          <LandingLogo priority className="h-9 w-auto sm:h-10 md:h-11" />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-8 md:flex">
          <NavDropdown label="Platform" href={PLATFORM_NAV_PATH} columns={PLATFORM_NAV_COLUMNS} />
          <NavDropdown label="Solutions" href="/solutions" columns={SOLUTIONS_NAV_COLUMNS} />
          {HOME_NAV_LINKS.map((link) => (
            <HomeSectionLink
              key={link.sectionId}
              sectionId={link.sectionId}
              className={NAV_LINK_CLASS}
            >
              {link.label}
            </HomeSectionLink>
          ))}
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#141b2b] transition-colors hover:text-[#0050cb]"
          >
            Login
          </Link>
          <BookDemoLink className={NAV_BOOK_DEMO_CLASS}>Book a Demo</BookDemoLink>
        </div>

        <button
          type="button"
          className="landing-nav-menu-btn p-2 text-[#141b2b] md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <MaterialIcon name={mobileOpen ? "close" : "menu"} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[#c3c6d6]/25 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <MobileNavGroup
              label="Platform"
              open={mobilePlatformOpen}
              onToggle={() => setMobilePlatformOpen((o) => !o)}
              items={PLATFORM_NAV_ITEMS}
              overview={{ title: "Huntlo Platform overview", href: PLATFORM_NAV_PATH }}
              onNavigate={closeMobile}
            />

            <MobileNavGroup
              label="Solutions"
              open={mobileSolutionsOpen}
              onToggle={() => setMobileSolutionsOpen((o) => !o)}
              items={SOLUTIONS_NAV_ITEMS}
              onNavigate={closeMobile}
            />

            {HOME_NAV_LINKS.map((link) => (
              <HomeSectionLink
                key={link.sectionId}
                sectionId={link.sectionId}
                className="text-sm font-medium text-[#434654]"
                onNavigate={closeMobile}
              >
                {link.label}
              </HomeSectionLink>
            ))}

            <Link href="/login" className="text-sm font-medium text-[#141b2b]">
              Login
            </Link>
            <BookDemoLink className={NAV_BOOK_DEMO_MOBILE_CLASS} onClick={closeMobile}>
              Book a Demo
            </BookDemoLink>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

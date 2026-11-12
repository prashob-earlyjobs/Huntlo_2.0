"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

const SECTION_GAP_PX = 16;

function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const siteNav = document.querySelector<HTMLElement>(".landing-nav");
  const offset = (siteNav?.offsetHeight ?? 0) + SECTION_GAP_PX;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? "auto" : "smooth" });
  window.history.replaceState(window.history.state, "", `#${id}`);
  target.focus({ preventScroll: true });
}

type SectionLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  sectionId: string;
};

/** In-page anchor that smooth-scrolls below the sticky site header. */
export function SectionLink({ sectionId, onClick, children, ...rest }: SectionLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <a href={`#${sectionId}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}

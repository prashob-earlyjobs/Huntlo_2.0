import Image from "next/image";

import { cn } from "@/lib/utils";

/** Same lockup as LandingNav — keep footer / chrome on this asset. */
export const LANDING_LOGO_SRC = "/huntlologo.png";
export const LANDING_LOGO_NAV_CLASS = "h-9 w-auto sm:h-10 md:h-11";
/** Homepage header mark (`LegacyLogo`) — use on home chrome / AI-ask band. */
export const HUNTLO_MARK_CLASS = "h-8 w-auto";

type Props = {
  className?: string;
  priority?: boolean;
};

/** Landing / marketing nav + link-column footer — Next Image. */
export function LandingLogo({ className = LANDING_LOGO_NAV_CLASS, priority = false }: Props) {
  return (
    <Image
      src={LANDING_LOGO_SRC}
      alt="Huntlo"
      width={340}
      height={97}
      className={className}
      priority={priority}
    />
  );
}

/** Homepage header lockup — plain img, same asset. */
export function HuntloMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- matches homepage header mark
    <img
      src={LANDING_LOGO_SRC}
      alt="Huntlo"
      width={747}
      height={175}
      className={cn(HUNTLO_MARK_CLASS, className)}
    />
  );
}

import Link from "next/link";

import { MaterialIcon } from "@/components/landing/MaterialIcon";
import { PLATFORM_PATH } from "@/lib/platformCategoryPages";

/**
 * Visible "Home > Platform > {current}" trail for dark platform-page heroes.
 * Omit `current` on the `/platform` hub itself.
 */
export function PlatformBreadcrumb({ current }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1 text-[0.8125rem] text-white/60">
        <li>
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
        </li>
        <li aria-hidden className="flex items-center text-white/30">
          <MaterialIcon name="chevron_right" className="text-[16px]!" />
        </li>
        {current ? (
          <>
            <li>
              <Link href={PLATFORM_PATH} className="transition-colors hover:text-white">
                Platform
              </Link>
            </li>
            <li aria-hidden className="flex items-center text-white/30">
              <MaterialIcon name="chevron_right" className="text-[16px]!" />
            </li>
            <li aria-current="page" className="font-medium text-white">
              {current}
            </li>
          </>
        ) : (
          <li aria-current="page" className="font-medium text-white">
            Platform
          </li>
        )}
      </ol>
    </nav>
  );
}

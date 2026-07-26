import Link from "next/link";

import { SiteLogo } from "@/components/site/SiteLogo";
import { ThemeToggleButton } from "@/components/site/ThemeToggleButton";
import { AccountMenuControl } from "@/features/auth/components/AccountMenuControl";
import { FavoritesNavigationLink } from "@/features/favorites/components/FavoritesNavigationLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-60 border-b-2 border-primary/20 bg-card/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-4 sm:px-6">
        <Link
          href="/"
          aria-label="前往首頁"
          className="inline-flex items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          <SiteLogo />
        </Link>
        <div className="flex items-center gap-1.5 md:gap-2">
          <FavoritesNavigationLink />
          <ThemeToggleButton />
          <AccountMenuControl />
        </div>
      </div>
    </header>
  );
}

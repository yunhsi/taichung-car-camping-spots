import Link from "next/link";

import { Logo } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { FavoritesLink } from "@/features/favorites/components/FavoritesLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary/20 bg-surface/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="前往首頁"
          className="inline-flex items-center rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-focus-ring/30"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <FavoritesLink />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

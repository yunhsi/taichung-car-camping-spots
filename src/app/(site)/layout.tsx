import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="page-glow flex flex-1 flex-col bg-background font-sans transition-colors">
      <SiteHeader />
      {children}
    </div>
  );
}

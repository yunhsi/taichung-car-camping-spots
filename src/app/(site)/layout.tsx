import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { readUser } from "@/features/auth/lib/authenticatedUser";
import { ReviewSummaryLoader } from "@/features/reviews/components/ReviewSummaryLoader";
import { UserDataProvider } from "@/features/user/components/UserDataProvider";

interface SiteLayoutProps {
  children: ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const user = await readUser();

  return (
    <UserDataProvider initialUser={user}>
      <ReviewSummaryLoader>
        <div className="page-glow flex flex-1 flex-col bg-background font-sans transition-colors">
          <SiteHeader />
          {children}
        </div>
      </ReviewSummaryLoader>
    </UserDataProvider>
  );
}

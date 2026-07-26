import type { Metadata } from "next";

import { AccountResultScreen } from "@/features/auth/components/AccountResultScreen";
import { getAccountResultStatus } from "@/features/auth/lib/accountResult";

interface AccountResultPageProps {
  searchParams: Promise<{
    status?: string | string[];
    error?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: "帳號操作結果｜台中車泊景點",
  robots: { index: false, follow: false },
};

export default async function AccountResultPage({
  searchParams,
}: AccountResultPageProps) {
  const { status, error } = await searchParams;

  return <AccountResultScreen status={getAccountResultStatus(status, error)} />;
}

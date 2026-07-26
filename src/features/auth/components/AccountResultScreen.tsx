"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/Toast";
import {
  getAccountResultToast,
  type AccountResultStatus,
} from "@/features/auth/lib/accountResult";

interface AccountResultScreenProps {
  status: AccountResultStatus | null;
}

export function AccountResultScreen({ status }: AccountResultScreenProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const hasHandledResult = useRef(false);

  useEffect(() => {
    if (hasHandledResult.current) {
      return;
    }

    hasHandledResult.current = true;

    if (status) {
      showToast(getAccountResultToast(status));
    }

    router.replace("/");
  }, [router, showToast, status]);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        正在返回首頁…
      </p>
    </main>
  );
}

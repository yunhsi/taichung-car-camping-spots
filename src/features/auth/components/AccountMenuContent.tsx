"use client";

import Image from "next/image";

import { LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { SignInDialog } from "@/features/auth/components/SignInDialog";

interface AccountUser {
  email?: string | null;
  image?: string | null;
  name?: string | null;
}

interface AccountMenuActions {
  signInAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
}

type AccountMenuContentProps = AccountMenuActions &
  (
    | { status: "unauthenticated"; user?: never }
    | { status: "authenticated"; user: AccountUser }
  );

interface UserAvatarProps {
  accountName: string;
  image: string | null | undefined;
}

function UserAvatar({ accountName, image }: UserAvatarProps) {
  return image ? (
    <Image
      src={image}
      alt={`${accountName} 的頭像`}
      width={32}
      height={32}
      className="size-8 shrink-0 rounded-full border border-primary/30 bg-card object-cover"
    />
  ) : (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-secondary">
      <UserRound aria-hidden="true" className="size-4 text-primary" />
    </span>
  );
}

export function AccountMenuContent({
  signInAction,
  signOutAction,
  status,
  user,
}: AccountMenuContentProps) {
  if (status === "unauthenticated") {
    return <SignInDialog signInAction={signInAction} />;
  }

  const accountName = user.name ?? user.email ?? "已登入使用者";

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  aria-label={`開啟帳號選單：${accountName}`}
                />
              }
            />
          }
        >
          <UserAvatar accountName={accountName} image={user.image} />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="hidden md:block">
          帳號選單
        </TooltipContent>
      </Tooltip>
      <PopoverContent aria-label="帳號選單">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar accountName={accountName} image={user.image} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {accountName}
            </p>
            {user.email && user.email !== accountName && (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
          <form action={signOutAction} className="shrink-0">
            <div className="group/logout relative">
              <Button
                type="submit"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-destructive hover:bg-destructive/10"
                aria-label="登出"
                aria-describedby="logout-tooltip"
              >
                <LogOut aria-hidden="true" />
              </Button>
              <span
                id="logout-tooltip"
                role="tooltip"
                className="pointer-events-none absolute top-[calc(100%+0.375rem)] right-0 z-90 hidden w-max rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md md:group-hover/logout:block"
              >
                登出
              </span>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}

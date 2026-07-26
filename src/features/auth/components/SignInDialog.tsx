"use client";

import { Bookmark, Cloud, MessageSquareText, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface SignInDialogProps {
  signInAction: () => Promise<void>;
}

const MEMBER_FEATURES = [
  {
    description: "保存想造訪的景點，之後可從收藏頁快速找到。",
    icon: Bookmark,
    title: "收藏景點",
  },
  {
    description: "留下造訪心得，並隨時修改或刪除自己的評論。",
    icon: MessageSquareText,
    title: "撰寫評論",
  },
  {
    description: "收藏與評論會跟著帳號，在不同裝置保持同步。",
    icon: Cloud,
    title: "跨裝置同步",
  },
] as const;

export function SignInDialog({ signInAction }: SignInDialogProps) {
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger
          render={
            <DialogTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  aria-label="使用 Google 登入"
                />
              }
            />
          }
        >
          <UserRound
            aria-hidden="true"
            strokeWidth="1.8"
            className="size-5 text-primary"
          />
        </TooltipTrigger>
        <TooltipContent side="bottom" className="hidden md:block">
          Google 登入
        </TooltipContent>
      </Tooltip>

      <DialogContent className="overflow-hidden p-0">
        <header className="border-b border-border bg-linear-to-r from-secondary to-card px-6 py-5">
          <DialogTitle className="text-xl">登入以解鎖會員功能</DialogTitle>
          <DialogDescription className="mt-2 leading-6">
            使用 Google 帳號登入，即可保存個人收藏與分享造訪心得。
          </DialogDescription>
        </header>

        <ul className="space-y-3 px-6 py-5" aria-label="登入後可使用的功能">
          {MEMBER_FEATURES.map(({ description, icon: Icon, title }) => (
            <li
              key={title}
              className="flex gap-3 rounded-xl border border-border bg-muted p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-highlight-soft text-highlight-strong">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <footer className="flex justify-end gap-3 border-t border-border bg-muted px-6 py-4">
          <DialogClose render={<Button variant="outline" />}>
            先不用
          </DialogClose>
          <form action={signInAction}>
            <Button type="submit">使用 Google 登入</Button>
          </form>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

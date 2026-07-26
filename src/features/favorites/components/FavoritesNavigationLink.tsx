"use client";

import { Bookmark } from "lucide-react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useUserData } from "@/features/user/components/UserDataProvider";

export function FavoritesNavigationLink() {
  const { user } = useUserData();

  if (!user) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <ButtonLink
            href="/favorites"
            aria-label="前往收藏頁"
            variant="outline"
            size="icon"
            className="rounded-full border-highlight/30 bg-highlight-soft hover:border-highlight/50 hover:bg-highlight-soft/70"
          />
        }
      >
        <Bookmark
          aria-hidden="true"
          strokeWidth="1.8"
          className="size-5 text-destructive"
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="hidden md:block">
        我的收藏
      </TooltipContent>
    </Tooltip>
  );
}

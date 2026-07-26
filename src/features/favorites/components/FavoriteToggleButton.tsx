"use client";

import { useRef, useState } from "react";

import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useFavorite } from "@/features/favorites/useFavorites";
import { useUserData } from "@/features/user/components/UserDataProvider";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

interface FavoriteToggleButtonProps {
  attractionId: string;
  attractionName: string;
  className?: string;
}

export function FavoriteToggleButton({
  attractionId,
  attractionName,
  className,
}: FavoriteToggleButtonProps) {
  const { isFavorite, isLoaded, toggleFavorite } = useFavorite(attractionId);
  const { canEditUserData } = useUserData();
  const { showToast } = useToast();
  const isPendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const label = isFavorite
    ? `取消收藏「${attractionName}」`
    : `收藏「${attractionName}」`;

  if (!canEditUserData) {
    return null;
  }

  async function handleToggleFavorite() {
    if (isPendingRef.current) {
      return;
    }

    const nextIsFavorite = !isFavorite;
    isPendingRef.current = true;
    setIsPending(true);

    try {
      await toggleFavorite();
      showToast({
        title: nextIsFavorite ? "已加入收藏" : "已取消收藏",
        description: nextIsFavorite
          ? `已將「${attractionName}」加入收藏。`
          : `已將「${attractionName}」移出收藏。`,
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: "收藏更新失敗",
        description: getErrorMessage(error, "請稍後再試。"),
        variant: "error",
      });
    } finally {
      isPendingRef.current = false;
      setIsPending(false);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute top-3 right-4 size-10 rounded-full border-border bg-card/90 text-muted-foreground shadow-sm hover:border-destructive/40 hover:bg-card hover:text-destructive",
              isFavorite && "border-destructive/30 text-destructive",
              className,
            )}
            aria-label={label}
            aria-pressed={isFavorite}
            aria-busy={isPending || !isLoaded}
            disabled={isPending || !isLoaded}
            onClick={handleToggleFavorite}
          />
        }
      >
        <Bookmark
          aria-hidden="true"
          strokeWidth="1.8"
          className={isFavorite ? "size-5 fill-current" : "size-5"}
        />
      </TooltipTrigger>
      <TooltipContent side="top" align="end">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

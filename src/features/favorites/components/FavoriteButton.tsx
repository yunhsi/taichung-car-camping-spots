"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useFavorite } from "@/features/favorites/useFavorites";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  attractionId: string;
  attractionName: string;
  className?: string;
}

export function FavoriteButton({
  attractionId,
  attractionName,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorite(attractionId);
  const label = isFavorite
    ? `取消收藏「${attractionName}」`
    : `收藏「${attractionName}」`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute top-3 right-4 size-10 rounded-full border-danger/30 bg-surface/90 text-danger shadow-sm hover:border-danger/50 hover:bg-surface",
            className,
          )}
          aria-label={label}
          aria-pressed={isFavorite}
          onClick={() => toggleFavorite(attractionId)}
        >
          <Heart
            aria-hidden="true"
            strokeWidth="1.8"
            className={isFavorite ? "size-5 fill-current" : "size-5"}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" align="end">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

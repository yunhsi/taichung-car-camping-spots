import Link from "next/link";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

export function FavoritesLink() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-11 rounded-full border-accent/30 bg-accent-soft text-danger hover:border-accent/50 hover:bg-accent-soft/70"
        >
          <Link href="/favorites" aria-label="前往收藏頁">
            <Heart
              aria-hidden="true"
              strokeWidth="1.8"
              className="size-5"
            />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">前往收藏頁</TooltipContent>
    </Tooltip>
  );
}

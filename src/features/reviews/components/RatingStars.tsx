import { Star } from "lucide-react";

import { REVIEW_RATING_VALUES } from "@/features/reviews/lib/reviewValidation";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  label: string;
  rating: number;
  size?: "sm" | "md";
}

export function RatingStars({ label, rating, size = "md" }: RatingStarsProps) {
  return (
    <span className="flex gap-0.5 text-input" aria-label={label}>
      {REVIEW_RATING_VALUES.map((starValue) => (
        <Star
          key={starValue}
          aria-hidden="true"
          className={cn(
            size === "sm" ? "size-3.5" : "size-4",
            starValue <= Math.round(rating) && "fill-current text-highlight",
          )}
        />
      ))}
    </span>
  );
}

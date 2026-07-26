import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAttractions } from "@/features/attractions/data/attractions";
import townships from "@/features/attractions/data/taichung-townships.json";
import { sortAttractionsByTownshipOrder } from "@/features/attractions/lib/attractionFilters";
import { FavoriteAttractionList } from "@/features/favorites/components/FavoriteAttractionList";

export const metadata: Metadata = {
  title: "我的收藏｜台中車泊景點",
  description: "查看已收藏的台中車泊景點。",
};

export default function FavoritesPage() {
  const attractions = getAttractions();
  const sortedAttractions = sortAttractionsByTownshipOrder(
    attractions,
    townships,
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-wider text-primary">
          FAVORITES
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
          我的收藏
        </h1>
        <p className="mt-2 text-muted">集中查看想造訪的車泊景點。</p>
      </div>

      <section aria-label="收藏景點列表">
        <FavoriteAttractionList
          attractions={sortedAttractions}
          emptyState={
            <EmptyState
              title="尚未收藏景點"
              description="回到首頁，點擊卡片右上角的愛心即可加入收藏。"
              action={
                <Button asChild>
                  <Link href="/">回首頁探索景點</Link>
                </Button>
              }
            />
          }
        />
      </section>
    </main>
  );
}

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttractionFilters } from "@/features/attractions/components/AttractionFilters";
import { AttractionList } from "@/features/attractions/components/AttractionList";
import { getAttractions } from "@/features/attractions/data/attractions";
import themeCategories from "@/features/attractions/data/taichung-theme-categories.json";
import townships from "@/features/attractions/data/taichung-townships.json";
import {
  filterAttractions,
  getValidFilters,
  sortAttractionsByTownshipOrder,
} from "@/features/attractions/lib/attractionFilters";

interface HomeProps {
  searchParams: Promise<{
    township?: string | string[];
    category?: string | string[];
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const attractions = getAttractions();
  const selectedTownships = getValidFilters(params.township, townships);
  const selectedCategories = getValidFilters(params.category, themeCategories);
  const filteredAttractions = sortAttractionsByTownshipOrder(
    filterAttractions(attractions, {
      townships: selectedTownships,
      categories: selectedCategories,
    }),
    townships,
  );
  const filterKey = [...selectedTownships, "|", ...selectedCategories].join(",");

  return (
    <main id="top" className="w-full flex-1">
      <AttractionFilters
        key={filterKey}
        initialTownships={selectedTownships}
        initialCategories={selectedCategories}
      />

      <section
        id="results"
        aria-label="景點列表"
        className="mx-auto w-full max-w-7xl scroll-mt-6 px-6 pb-14"
      >
        {filteredAttractions.length > 0 ? (
          <AttractionList attractions={filteredAttractions} />
        ) : (
          <EmptyState
            title="找不到符合條件的景點"
            description="請調整地區或主題條件後再試一次。"
            action={
              <Button asChild>
                <Link href="/">清除所有篩選</Link>
              </Button>
            }
          />
        )}
      </section>
    </main>
  );
}

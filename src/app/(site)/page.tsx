import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { AttractionFilterPanel } from "@/features/attractions/components/AttractionFilterPanel/AttractionFilterPanel";
import { AttractionList } from "@/features/attractions/components/AttractionList/AttractionList";
import { readAttractions } from "@/features/attractions/data/attractions";
import themeCategories from "@/features/attractions/data/taichung-theme-categories.json";
import townships from "@/features/attractions/data/taichung-townships.json";
import { sortAttractionsByTownshipOrder } from "@/features/attractions/lib/attractionFilters";
import {
  type AttractionSearchParams,
  getAttractionSearchParamsState,
} from "@/features/attractions/lib/attractionSearchParams";

interface HomeProps {
  searchParams: Promise<AttractionSearchParams>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const attractions = readAttractions();
  const attractionSearchParamsState = getAttractionSearchParamsState(params, {
    attractions,
    themeCategories,
    townships,
  });

  if (attractionSearchParamsState.shouldRedirect) {
    const canonicalUrl = attractionSearchParamsState.canonicalQuery
      ? `/?${attractionSearchParamsState.canonicalQuery}`
      : "/";

    redirect(canonicalUrl);
  }

  const selectedTownships = attractionSearchParamsState.townships;
  const selectedCategories = attractionSearchParamsState.categories;
  const filteredAttractions = sortAttractionsByTownshipOrder(
    attractionSearchParamsState.filteredAttractions,
    townships,
  );
  const filterKey = [...selectedTownships, "|", ...selectedCategories].join(",");

  return (
    <main id="top" className="w-full flex-1">
      <AttractionFilterPanel
        key={filterKey}
        initialTownships={selectedTownships}
        initialCategories={selectedCategories}
        themeCategories={themeCategories}
        townships={townships}
      />

      <section
        id="results"
        aria-label="景點列表"
        className="mx-auto w-full max-w-7xl scroll-mt-6 px-6 pb-14"
      >
        {filteredAttractions.length > 0 ? (
          <AttractionList
            attractions={filteredAttractions}
            initialAttractionId={attractionSearchParamsState.attractionId}
          />
        ) : (
          <EmptyState
            title="找不到符合條件的景點"
            description="請調整地區或主題條件後再試一次。"
            action={
              <ButtonLink href="/">清除所有篩選</ButtonLink>
            }
          />
        )}
      </section>
    </main>
  );
}

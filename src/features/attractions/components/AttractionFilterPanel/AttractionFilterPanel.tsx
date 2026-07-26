"use client";

import { usePathname, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { createAttractionSearchParams } from "@/features/attractions/lib/attractionSearchParams";

import { AttractionMultiSelect } from "./AttractionMultiSelect";

interface AttractionFilterPanelProps {
  initialCategories: string[];
  initialTownships: string[];
  themeCategories: readonly string[];
  townships: readonly string[];
}

export function AttractionFilterPanel({
  initialTownships,
  initialCategories,
  themeCategories,
  townships,
}: AttractionFilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTownships, setSelectedTownships] =
    useState<string[]>(initialTownships);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [isExpanded, setIsExpanded] = useState(true);
  const selectedFilterCount =
    selectedTownships.length + selectedCategories.length;
  const hasSelection =
    selectedTownships.length > 0 || selectedCategories.length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchParams = createAttractionSearchParams({
      townships: selectedTownships,
      categories: selectedCategories,
    });
    const query = searchParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}#results`, {
      scroll: false,
    });

    requestAnimationFrame(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearFilters() {
    setSelectedTownships([]);
    setSelectedCategories([]);
    router.push(pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section
      aria-label="搜尋車泊地點"
      className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-14"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-primary/20 bg-linear-to-br from-secondary/70 via-card to-highlight-soft/40 p-5 shadow-sm sm:p-6"
      >
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="group/filter flex w-full items-center justify-between gap-4 text-left outline-none focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/30">
            <span className="font-semibold text-foreground">篩選條件</span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              {selectedFilterCount > 0 && (
                <span className="rounded-full bg-highlight-soft px-2.5 py-1 font-medium text-highlight-strong">
                  已選 {selectedFilterCount} 項
                </span>
              )}
              <ChevronDown
                aria-hidden="true"
                className="size-5 transition-transform duration-300 group-data-panel-open/filter:rotate-180"
              />
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent
            id="filter-fields"
            className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-300 ease-in-out [&[hidden]:not([hidden='until-found'])]:hidden data-ending-style:h-0 data-starting-style:h-0"
          >
            <div className="mt-5 grid gap-5 border-t border-primary/15 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <div>
                <AttractionMultiSelect
                  id="township-filter"
                  label="地區"
                  options={townships}
                  emptyOptionLabel="全部地區"
                  value={selectedTownships}
                  onValueChange={setSelectedTownships}
                />
              </div>
              <div>
                <AttractionMultiSelect
                  id="category-filter"
                  label="主題"
                  options={themeCategories}
                  emptyOptionLabel="全部主題"
                  value={selectedCategories}
                  onValueChange={setSelectedCategories}
                />
              </div>
              <div className="flex items-center gap-2">
                {hasSelection && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="size-11 rounded-lg text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                          onClick={clearFilters}
                          aria-label="清除所有篩選"
                        />
                      }
                    >
                      <X
                        aria-hidden="true"
                        className="size-5"
                      />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      清除
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="submit"
                        size="icon"
                        className="h-11 flex-1 rounded-lg sm:size-11 sm:flex-none"
                        aria-label="套用篩選"
                      />
                    }
                  >
                    <Search
                      aria-hidden="true"
                      className="size-5"
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">搜尋</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </form>
    </section>
  );
}

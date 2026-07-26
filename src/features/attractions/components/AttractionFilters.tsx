"use client";

import { usePathname, useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";

import { ChevronDown, Search, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { MultiSelect } from "@/components/ui/MultiSelect";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import themeCategories from "@/features/attractions/data/taichung-theme-categories.json";
import townships from "@/features/attractions/data/taichung-townships.json";
import { cn } from "@/lib/utils";

interface AttractionFiltersProps {
  initialTownships: string[];
  initialCategories: string[];
}

export function AttractionFilters({
  initialTownships,
  initialCategories,
}: AttractionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedTownships, setSelectedTownships] =
    useState<string[]>(initialTownships);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(initialCategories);
  const [isExpanded, setIsExpanded] = useState(true);
  const [allowsOverflow, setAllowsOverflow] = useState(true);
  const selectedFilterCount =
    selectedTownships.length + selectedCategories.length;
  const hasSelection =
    selectedTownships.length > 0 || selectedCategories.length > 0;

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const searchParams = new URLSearchParams();

    selectedTownships.forEach((township) => {
      searchParams.append("township", township);
    });
    selectedCategories.forEach((category) => {
      searchParams.append("category", category);
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
    window.scrollTo({ top: 0 });
  }

  function toggleExpanded() {
    if (isExpanded) {
      setAllowsOverflow(false);
    }

    setIsExpanded((currentValue) => !currentValue);
  }

  return (
    <section
      aria-label="搜尋車泊地點"
      className="mx-auto w-full max-w-7xl px-6 py-10 sm:py-14"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary-soft via-surface to-accent-soft p-5 shadow-sm sm:p-6"
      >
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="filter-fields"
          className="flex w-full items-center justify-between gap-4 text-left"
          onClick={toggleExpanded}
        >
          <span className="font-semibold text-foreground">篩選條件</span>
          <span className="flex items-center gap-2 text-sm text-muted">
            {selectedFilterCount > 0 && (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent-strong">
                已選 {selectedFilterCount} 項
              </span>
            )}
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-5 transition-transform duration-300",
                isExpanded && "rotate-180",
              )}
            />
          </span>
        </button>

        <div
          id="filter-fields"
          aria-hidden={!isExpanded}
          inert={!isExpanded}
          onTransitionEnd={(event) => {
            if (event.currentTarget === event.target && isExpanded) {
              setAllowsOverflow(true);
            }
          }}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div
            className={cn(
              "min-h-0",
              allowsOverflow ? "overflow-visible" : "overflow-hidden",
            )}
          >
            <div className="mt-5 grid gap-5 border-t border-primary/15 pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
              <div>
                <MultiSelect
                  id="township-filter"
                  label="地區"
                  options={townships}
                  emptyOptionLabel="全部地區"
                  value={selectedTownships}
                  onValueChange={setSelectedTownships}
                />
              </div>
              <div>
                <MultiSelect
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
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-11 rounded-lg text-muted hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
                        onClick={clearFilters}
                        aria-label="清除所有篩選"
                      >
                        <X
                          aria-hidden="true"
                          className="size-5"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      清除
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      size="icon"
                      className="h-11 flex-1 rounded-lg bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:bg-accent-hover sm:size-11 sm:flex-none"
                      aria-label="套用篩選"
                    >
                      <Search
                        aria-hidden="true"
                        className="size-5"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">搜尋</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

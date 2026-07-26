import type { AttractionListItem } from "@/features/attractions/types";

import { filterAttractions, getValidFilters } from "./attractionFilters";

const ATTRACTION_SEARCH_PARAM = "attraction";
const TOWNSHIP_SEARCH_PARAM = "township";
const CATEGORY_SEARCH_PARAM = "category";
const SUPPORTED_SEARCH_PARAMS = new Set([
  ATTRACTION_SEARCH_PARAM,
  TOWNSHIP_SEARCH_PARAM,
  CATEGORY_SEARCH_PARAM,
]);

export interface AttractionSearchParams {
  [key: string]: string | string[] | undefined;
  attraction?: string | string[];
  category?: string | string[];
  township?: string | string[];
}

interface AttractionSearchParamsState {
  attractionId: string | null;
  categories: string[];
  canonicalQuery: string;
  filteredAttractions: AttractionListItem[];
  shouldRedirect: boolean;
  townships: string[];
}

interface CreateAttractionSearchParamsOptions {
  attractionId?: string | null;
  categories?: readonly string[];
  townships?: readonly string[];
}

interface GetAttractionSearchParamsStateOptions {
  attractions: readonly AttractionListItem[];
  themeCategories: readonly string[];
  townships: readonly string[];
}

function getSearchParamValues(
  value: string | string[] | undefined,
): string[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function createAttractionSearchParams({
  attractionId = null,
  categories = [],
  townships = [],
}: CreateAttractionSearchParamsOptions): URLSearchParams {
  const searchParams = new URLSearchParams();

  townships.forEach((township) => {
    searchParams.append(TOWNSHIP_SEARCH_PARAM, township);
  });
  categories.forEach((category) => {
    searchParams.append(CATEGORY_SEARCH_PARAM, category);
  });

  if (attractionId) {
    searchParams.set(ATTRACTION_SEARCH_PARAM, attractionId);
  }

  return searchParams;
}

export function getAttractionSearchParamsState(
  searchParams: AttractionSearchParams,
  {
    attractions,
    themeCategories,
    townships,
  }: GetAttractionSearchParamsStateOptions,
): AttractionSearchParamsState {
  const selectedTownships = getValidFilters(
    searchParams.township,
    townships,
  );
  const selectedCategories = getValidFilters(
    searchParams.category,
    themeCategories,
  );
  const filteredAttractions = filterAttractions(attractions, {
    townships: selectedTownships,
    categories: selectedCategories,
  });
  const requestedAttractionIds = getSearchParamValues(searchParams.attraction);
  const attractionId =
    requestedAttractionIds.length === 1 &&
    filteredAttractions.some(({ id }) => id === requestedAttractionIds[0])
      ? requestedAttractionIds[0]
      : null;
  const canonicalSearchParams = createAttractionSearchParams({
    attractionId,
    categories: selectedCategories,
    townships: selectedTownships,
  });
  const currentSearchParams = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    getSearchParamValues(value).forEach((item) => {
      currentSearchParams.append(key, item);
    });
  });

  const hasUnsupportedSearchParams = Object.keys(searchParams).some(
    (key) => !SUPPORTED_SEARCH_PARAMS.has(key),
  );
  const canonicalQuery = canonicalSearchParams.toString();

  return {
    attractionId,
    categories: selectedCategories,
    canonicalQuery,
    filteredAttractions,
    shouldRedirect:
      hasUnsupportedSearchParams ||
      currentSearchParams.toString() !== canonicalQuery,
    townships: selectedTownships,
  };
}

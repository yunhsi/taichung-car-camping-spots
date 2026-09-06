interface FilterableAttraction {
  address: string;
  categories: readonly string[];
}

interface AttractionFilterValues {
  townships: readonly string[];
  categories: readonly string[];
}

export function getValidFilters(
  value: string | string[] | undefined,
  validOptions: readonly string[],
): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return [...new Set(values)].filter((item) => validOptions.includes(item));
}

export function filterAttractions<T extends FilterableAttraction>(
  attractions: readonly T[],
  filters: AttractionFilterValues,
): T[] {
  return attractions.filter((attraction) => {
    const matchesTownship =
      filters.townships.length === 0 ||
      filters.townships.some((township) =>
        attraction.address.startsWith(`臺中市${township}`),
      );
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.some((category) =>
        attraction.categories.includes(category),
      );

    return matchesTownship && matchesCategory;
  });
}

export function sortAttractionsByTownshipOrder<T extends FilterableAttraction>(
  attractions: readonly T[],
  townshipOrder: readonly string[],
): T[] {
  const townshipIndexes = new Map(
    townshipOrder.map((township, index) => [township, index]),
  );

  const getTownshipIndex = (address: string) => {
    const township = townshipOrder.find((item) =>
      address.startsWith(`臺中市${item}`),
    );

    return township === undefined
      ? townshipOrder.length
      : (townshipIndexes.get(township) ?? townshipOrder.length);
  };

  return attractions
    .map((attraction, originalIndex) => ({ attraction, originalIndex }))
    .sort(
      (first, second) =>
        getTownshipIndex(first.attraction.address) -
          getTownshipIndex(second.attraction.address) ||
        first.originalIndex - second.originalIndex,
    )
    .map(({ attraction }) => attraction);
}

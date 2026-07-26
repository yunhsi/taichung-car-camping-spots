export const AUTHOR_REVIEWS_PAGE_SIZE = 10;
export const MAX_AUTHOR_REVIEWS_OFFSET = 10_000;

export function parseAuthorReviewsOffset(value: string | null): number | null {
  if (value === null) {
    return 0;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const offset = Number(value);

  return Number.isSafeInteger(offset) && offset <= MAX_AUTHOR_REVIEWS_OFFSET
    ? offset
    : null;
}

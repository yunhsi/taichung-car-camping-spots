const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("zh-TW", {
  numeric: "always",
});

const MINUTE_IN_MS = 60_000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const MONTH_IN_MS = 30 * DAY_IN_MS;
const YEAR_IN_MS = 365 * DAY_IN_MS;

export function formatRelativeReviewDate(
  updatedAt: string,
  now = Date.now(),
): string {
  const elapsed = Math.max(0, now - new Date(updatedAt).getTime());

  if (elapsed < MINUTE_IN_MS) {
    return "剛剛";
  }

  if (elapsed < HOUR_IN_MS) {
    return formatElapsed(elapsed, MINUTE_IN_MS, "minute");
  }

  if (elapsed < DAY_IN_MS) {
    return formatElapsed(elapsed, HOUR_IN_MS, "hour");
  }

  if (elapsed < MONTH_IN_MS) {
    return formatElapsed(elapsed, DAY_IN_MS, "day");
  }

  if (elapsed < YEAR_IN_MS) {
    return formatElapsed(elapsed, MONTH_IN_MS, "month");
  }

  return formatElapsed(elapsed, YEAR_IN_MS, "year");
}

function formatElapsed(
  elapsed: number,
  unitInMs: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  return RELATIVE_TIME_FORMATTER.format(-Math.floor(elapsed / unitInMs), unit);
}

const UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: "month", ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: "week", ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: "day", ms: 24 * 60 * 60 * 1000 },
  { unit: "hour", ms: 60 * 60 * 1000 },
  { unit: "minute", ms: 60 * 1000 },
];

// numeric: "always" so it reads "1 day ago"/"in 2 weeks" rather than
// Intl's "auto" idioms ("yesterday", "next week").
const formatter = new Intl.RelativeTimeFormat("en", { numeric: "always" });

/** "1 year ago", "3 days ago", "30 minutes ago", etc. */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  if (absMs < 60_000) return "just now";

  const { unit, ms } = UNITS.find((candidate) => absMs >= candidate.ms) ?? UNITS[UNITS.length - 1];
  return formatter.format(Math.round(diffMs / ms), unit);
}

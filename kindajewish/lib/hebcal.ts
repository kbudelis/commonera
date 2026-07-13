// Live holiday dates from the Hebcal Jewish calendar API (hebcal.com).
// Fetched at build time (or daily on a server); every consumer falls back
// to the hand-written dates in lib/holidays.ts if this fetch fails.

type HebcalItem = {
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
};

type Occurrence = { start: Date; end: Date };

export type LiveDates = Record<string, { dates: string; start: Date; end: Date }>;

// Hebcal title prefixes → our holiday slugs. "Erev" (eve-of) entries are
// included on purpose: Jewish holidays begin at sundown the night before,
// and the hand-written dates on the site already follow that convention.
const SLUG_PATTERNS: Array<[string, RegExp]> = [
  ["rosh-hashanah", /^(Erev )?Rosh Hashana/],
  ["yom-kippur", /^(Erev )?Yom Kippur/],
  ["hanukkah", /^Chanukah/],
  ["passover", /^(Erev )?Pesach/],
  ["sukkot", /^(Erev )?Sukkot/],
  ["purim", /^(Erev )?Purim/],
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "June",
  "July", "Aug", "Sept", "Oct", "Nov", "Dec",
];

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatRange(start: Date, end: Date): string {
  const sm = MONTHS[start.getMonth()];
  const em = MONTHS[end.getMonth()];
  const year = end.getFullYear();
  if (start.getTime() === end.getTime()) {
    return `${sm} ${start.getDate()}, ${year}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${sm} ${start.getDate()}–${end.getDate()}, ${year}`;
  }
  return `${sm} ${start.getDate()}–${em} ${end.getDate()}, ${year}`;
}

async function fetchYear(year: number): Promise<HebcalItem[]> {
  const url = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=off&mod=off&nx=off&ss=off&mf=off&c=off&s=off&year=${year}`;
  const res = await fetch(url, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Hebcal responded ${res.status}`);
  const data = (await res.json()) as { items?: HebcalItem[] };
  return data.items ?? [];
}

/** Split a sorted list of single days into contiguous occurrences (a gap of more than 45 days means a different year's observance). */
function toOccurrences(days: Date[]): Occurrence[] {
  const occurrences: Occurrence[] = [];
  for (const day of days) {
    const current = occurrences[occurrences.length - 1];
    if (current && day.getTime() - current.end.getTime() < 45 * 86_400_000) {
      current.end = day;
    } else {
      occurrences.push({ start: day, end: day });
    }
  }
  return occurrences;
}

/**
 * Real dates for each holiday's next occurrence on or after `today`.
 * Returns {} on any failure so callers can fall back to hand-written dates.
 */
export async function getLiveHolidayDates(today: Date = new Date()): Promise<LiveDates> {
  try {
    const year = today.getFullYear();
    const [a, b] = await Promise.all([fetchYear(year), fetchYear(year + 1)]);
    const items = [...a, ...b].filter((i) => i.category === "holiday");

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const live: LiveDates = {};

    for (const [slug, pattern] of SLUG_PATTERNS) {
      const days = items
        .filter((i) => pattern.test(i.title))
        .map((i) => parseDay(i.date))
        .sort((x, y) => x.getTime() - y.getTime());
      const next = toOccurrences(days).find((o) => o.end >= startOfToday);
      if (next) {
        live[slug] = { dates: formatRange(next.start, next.end), start: next.start, end: next.end };
      }
    }
    return live;
  } catch {
    return {};
  }
}

/** The soonest upcoming holiday from the live data, or null if the fetch failed. */
export function pickUpcoming(live: LiveDates): { slug: string; dates: string } | null {
  const entries = Object.entries(live).sort(
    ([, x], [, y]) => x.start.getTime() - y.start.getTime()
  );
  const first = entries[0];
  return first ? { slug: first[0], dates: first[1].dates } : null;
}

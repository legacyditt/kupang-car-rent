/** Parses "YYYY-MM-DD" to a UTC midnight Date. */
export function parseYyyyMmDdToUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!));
}

/** Formats a UTC Date as "YYYY-MM-DD". */
export function formatUtcDateYyyyMmDd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Formats a UTC Date as "DD-MM-YYYY" (matching frontend calendar format). */
export function formatUtcDateDdMmYyyy(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${d}-${m}-${y}`;
}

/** Calculates inclusive calendar days between two "YYYY-MM-DD" strings. */
export function calculateInclusiveDays(
  startDate: string,
  endDate: string
): number {
  if (!startDate || !endDate || endDate < startDate) return 0;
  const startMs = parseYyyyMmDdToUtc(startDate).getTime();
  const endMs = parseYyyyMmDdToUtc(endDate).getTime();
  return Math.round((endMs - startMs) / 86_400_000) + 1;
}

/** Expands inclusive [startDate, endDate] ranges into unique "DD-MM-YYYY" strings. */
export function expandBookedDatesDdMmYyyy(
  ranges: Array<{ startDate: Date; endDate: Date }>
): string[] {
  const result = new Set<string>();
  for (const { startDate, endDate } of ranges) {
    const cursor = new Date(
      Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate()
      )
    );
    const end = new Date(
      Date.UTC(
        endDate.getUTCFullYear(),
        endDate.getUTCMonth(),
        endDate.getUTCDate()
      )
    );
    while (cursor <= end) {
      result.add(formatUtcDateDdMmYyyy(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return Array.from(result);
}

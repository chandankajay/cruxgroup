const IST_MS = 330 * 60 * 1000;

/** Start of calendar day 00:00 in Asia/Kolkata expressed as UTC `Date`. */
export function istMidnightUtc(y: number, month1: number, day: number): Date {
  return new Date(Date.UTC(y, month1 - 1, day, 0, 0, 0, 0) - IST_MS);
}

export function istMonthRangeUtc(year: number, month1: number): {
  startInclusive: Date;
  endExclusive: Date;
} {
  const startInclusive = istMidnightUtc(year, month1, 1);
  const nextY = month1 === 12 ? year + 1 : year;
  const nextM = month1 === 12 ? 1 : month1 + 1;
  const endExclusive = istMidnightUtc(nextY, nextM, 1);
  return { startInclusive, endExclusive };
}

/** YYYY-MM-DD in Asia/Kolkata for attendance grids. */
export function istCalendarDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const MS_DAY = 24 * 60 * 60 * 1000;

export function istDatesInMonth(year: number, month1: number): string[] {
  const { startInclusive, endExclusive } = istMonthRangeUtc(year, month1);
  const keys: string[] = [];
  for (let t = startInclusive.getTime(); t < endExclusive.getTime(); t += MS_DAY) {
    keys.push(istCalendarDateKey(new Date(t)));
  }
  return keys;
}

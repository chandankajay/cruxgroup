/** IST is UTC+5:30 — naive `datetime-local` values are interpreted as IST wall time. */
const IST_OFFSET_MS = 330 * 60 * 1000;

export function naiveIstLocalToUtc(naiveIso: string): Date {
  const [datePart, timePartRaw] = naiveIso.trim().split("T");
  if (!datePart || !timePartRaw) {
    throw new Error("Invalid datetime");
  }
  const timePart = timePartRaw.slice(0, 5);
  const dp = datePart.split("-");
  const y = Number(dp[0]);
  const mo = Number(dp[1]);
  const day = Number(dp[2]);
  const tp = timePart.split(":");
  const hh = Number(tp[0]);
  const mm = Number(tp[1]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(day)) {
    throw new Error("Invalid datetime");
  }
  const utcMs =
    Date.UTC(y, mo - 1, day, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0) -
    IST_OFFSET_MS;
  return new Date(utcMs);
}

export function formatUtcToIstLabel(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

/** Inverse of {@link naiveIstLocalToUtc} for `<input type="datetime-local">` (naive IST wall components). */
export function utcToNaiveIstLocalForInput(d: Date): string {
  const ms = d.getTime() + IST_OFFSET_MS;
  const x = new Date(ms);
  const y = x.getUTCFullYear();
  const mo = String(x.getUTCMonth() + 1).padStart(2, "0");
  const day = String(x.getUTCDate()).padStart(2, "0");
  const hh = String(x.getUTCHours()).padStart(2, "0");
  const mm = String(x.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${hh}:${mm}`;
}

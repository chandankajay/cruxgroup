import { istCalendarDateKey, istDatesInMonth } from "./ist-month";
import { phonesMatch } from "./phone-match";

export type MusterOperatorCol = {
  userId: string;
  name: string;
};

/**
 * Rows = IST calendar dates in month; first column Date; then one column per operator (P = present from OTP trip).
 */
export function buildMusterRollCsv(
  year: number,
  month1: number,
  operators: MusterOperatorCol[],
  trips: {
    actualStartTime: Date | null;
    actualEndTime: Date | null;
    equipment: { operatorPhone: string | null };
  }[],
  userPhoneById: Map<string, string | null>
): string {
  const monthDateKeys = new Set(istDatesInMonth(year, month1));

  const presentByOperatorDate = new Map<string, Set<string>>();
  for (const op of operators) {
    presentByOperatorDate.set(op.userId, new Set());
  }

  const phone = (uid: string) => userPhoneById.get(uid) ?? null;

  for (const t of trips) {
    if (!t.actualStartTime) continue;
    for (const op of operators) {
      if (!phonesMatch(t.equipment.operatorPhone, phone(op.userId))) continue;
      for (const d of [t.actualStartTime, t.actualEndTime]) {
        if (!d) continue;
        const dKey = istCalendarDateKey(d);
        if (monthDateKeys.has(dKey)) {
          presentByOperatorDate.get(op.userId)?.add(dKey);
        }
      }
    }
  }

  const dates = istDatesInMonth(year, month1);

  const headers = ["Date", ...operators.map((o) => o.name.replace(/,/g, " "))];
  const lines = [headers.join(",")];

  for (const d of dates) {
    const row = [d];
    for (const op of operators) {
      const mark = presentByOperatorDate.get(op.userId)?.has(d) ? "P" : "";
      row.push(mark);
    }
    lines.push(row.join(","));
  }

  return lines.join("\n");
}

import type { Equipment, Trip } from "@prisma/client";
import { istCalendarDateKey, istDatesInMonth, istMonthRangeUtc } from "./ist-month";
import { phonesMatch } from "./phone-match";

export type TripWithEquipment = Trip & { equipment: Pick<Equipment, "operatorPhone"> };

/**
 * Distinct IST calendar days in the month where OTP start exists; also counts end day if different.
 */
export function computeOperatorWorkingDayKeys(
  trips: TripWithEquipment[],
  operatorPhone: string | null,
  year: number,
  month1: number
): { dayKeys: string[]; tripIds: string[] } {
  const monthSet = new Set(istDatesInMonth(year, month1));
  const dayKeys = new Set<string>();
  const tripIds: string[] = [];

  for (const t of trips) {
    if (t.status !== "COMPLETED") continue;
    if (!phonesMatch(t.equipment.operatorPhone, operatorPhone)) continue;
    if (!t.actualStartTime) continue;

    tripIds.push(t.id);

    for (const d of [t.actualStartTime, t.actualEndTime]) {
      if (!d) continue;
      const key = istCalendarDateKey(d);
      if (monthSet.has(key)) dayKeys.add(key);
    }
  }

  return { dayKeys: [...dayKeys].sort(), tripIds };
}

export function grossPayPaise(daysWorked: number, dailyRatePaise: number): number {
  return Math.max(0, daysWorked * dailyRatePaise);
}

export function netPayablePaise(
  grossPaise: number,
  deductionPaise: number,
  advanceRecoveryPaise: number
): number {
  return Math.max(0, grossPaise - deductionPaise - advanceRecoveryPaise);
}

/** Query window for trips that may overlap the month (OTP start/end in range). */
export function completedTripsForMonthWhere(year: number, month1: number) {
  const { startInclusive, endExclusive } = istMonthRangeUtc(year, month1);
  return {
    status: "COMPLETED" as const,
    OR: [
      { actualStartTime: { gte: startInclusive, lt: endExclusive } },
      { actualEndTime: { gte: startInclusive, lt: endExclusive } },
    ],
  };
}

/**
 * Caps recovery against net-after-deduction and total advance still outstanding.
 * `priorRecoveryForMonthPaise` is the amount already stored for this month (add back to DB balance to get pre-line total owed).
 */
export function clampAdvanceRecoveryPaise(params: {
  requested: number;
  advanceBalancePaise: number;
  priorRecoveryForMonthPaise: number;
  grossPaise: number;
  deductionPaise: number;
}): number {
  const capFromNet = Math.max(0, params.grossPaise - params.deductionPaise);
  const totalAdvanceOwedPaise = Math.max(
    0,
    params.advanceBalancePaise + params.priorRecoveryForMonthPaise
  );
  return Math.min(
    Math.max(0, Math.floor(params.requested)),
    capFromNet,
    totalAdvanceOwedPaise
  );
}

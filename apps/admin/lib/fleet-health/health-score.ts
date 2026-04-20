/**
 * Derive a 0–100 health score from breakdown history and service schedule.
 */
export function computeMachineHealthScore(input: {
  totalHours: number;
  nextDueHours: number;
  openBreakdownCount: number;
  breakdownsLast90Days: number;
}): number {
  let score = 100;

  if (input.totalHours > input.nextDueHours) {
    const overdue = input.totalHours - input.nextDueHours;
    score -= Math.min(30, Math.floor(overdue / 10) * 3);
  }

  score -= Math.min(24, input.openBreakdownCount * 8);
  score -= Math.min(16, input.breakdownsLast90Days * 2);

  return Math.max(0, Math.min(100, score));
}

export function nextServiceDueHours(
  lastServiceHourReading: number,
  serviceIntervalHours: number
): number {
  return lastServiceHourReading + serviceIntervalHours;
}

/** Clock / timezone tolerance: jobs scheduled more than this far ahead cannot be completed yet. */
export const TRIP_COMPLETION_SCHEDULE_FUZZ_MS = 24 * 60 * 60 * 1000;

export const FUTURE_BOOKING_COMPLETION_MESSAGE =
  "Cannot complete a future booking. If the job was preponed, please edit the booking date first.";

/**
 * Trip `scheduledDate` is the operational job start (walk-in “start” in IST → UTC).
 * Blocks completion when that instant is still more than {@link TRIP_COMPLETION_SCHEDULE_FUZZ_MS} after `now`.
 */
export function isTripScheduleBlockingCompletion(
  scheduledDate: Date,
  nowMs: number = Date.now()
): boolean {
  return scheduledDate.getTime() > nowMs + TRIP_COMPLETION_SCHEDULE_FUZZ_MS;
}

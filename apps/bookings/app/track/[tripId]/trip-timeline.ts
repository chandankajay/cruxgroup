import type { TripStatus } from "@prisma/client";

/** Five UX stages aligned with `TripStatus` + `actualStartTime`. */
export const TRIP_TIMELINE_STEPS = [
  "Scheduled",
  "En Route",
  "On Site",
  "Working",
  "Completed",
] as const;

export type TripTimelineTerminal = "cancelled" | "disputed" | null;

export type TripTimelineState = {
  /** Index 0–4 of the step that is “in progress” (pulse), or 4 when done. */
  activeStep: number;
  /** Set when the job cannot be shown on the normal success path. */
  terminal: TripTimelineTerminal;
  /** When true, no step should use the “live” pulse (e.g. job finished or terminal). */
  suppressPulse: boolean;
};

/**
 * Maps Prisma `TripStatus` to a 5-step customer timeline.
 * - `ON_SITE` + no `actualStartTime` → “On Site” (arrived).
 * - `ON_SITE` + `actualStartTime` → “Working” (work started).
 * - `OVERRUN` → “Working” (extended on site).
 */
export function getTripTimelineState(
  status: TripStatus,
  actualStartTime: Date | null
): TripTimelineState {
  if (status === "CANCELLED") {
    return { activeStep: 0, terminal: "cancelled", suppressPulse: true };
  }
  if (status === "DISPUTED") {
    return { activeStep: 0, terminal: "disputed", suppressPulse: true };
  }
  if (status === "SCHEDULED") {
    return { activeStep: 0, terminal: null, suppressPulse: false };
  }
  if (status === "ENROUTE") {
    return { activeStep: 1, terminal: null, suppressPulse: false };
  }
  if (status === "ON_SITE") {
    if (actualStartTime) {
      return { activeStep: 3, terminal: null, suppressPulse: false };
    }
    return { activeStep: 2, terminal: null, suppressPulse: false };
  }
  if (status === "OVERRUN") {
    return { activeStep: 3, terminal: null, suppressPulse: false };
  }
  if (status === "COMPLETED") {
    return { activeStep: 4, terminal: null, suppressPulse: true };
  }
  return { activeStep: 0, terminal: null, suppressPulse: false };
}

export function isStepCompleted(
  index: number,
  status: TripStatus,
  activeStep: number
): boolean {
  if (status === "COMPLETED") return true;
  return index < activeStep;
}

export function isStepActive(
  index: number,
  state: TripTimelineState,
  status: TripStatus
): boolean {
  if (state.suppressPulse || state.terminal) return false;
  return index === state.activeStep;
}

/**
 * Mock ETA for “En Route”: offset from scheduled time using a simple travel-time heuristic.
 * Not a real route — product can swap for navigation / partner telemetry later.
 */
export function mockEstimatedArrival(
  scheduledDate: Date,
  distanceKm: number
): Date {
  const baseMin = 28;
  const perKmMin = 1.75;
  const extra = Math.min(distanceKm * perKmMin, 95);
  const totalMin = baseMin + extra;
  return new Date(scheduledDate.getTime() + totalMin * 60 * 1000);
}

export function formatTimeIst(d: Date): string {
  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTimeIst(d: Date): string {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Construction,
  Headphones,
  Route,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import { Badge } from "@repo/ui/badge";
import type { LiveTripPayload } from "./data";
import {
  TRIP_TIMELINE_STEPS,
  formatDateTimeIst,
  formatTimeIst,
  getTripTimelineState,
  isStepActive,
  isStepCompleted,
  mockEstimatedArrival,
} from "./trip-timeline";

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

function categoryLabel(raw: string): string {
  return raw.replaceAll("_", " ");
}

export function LiveTripTracking({ trip }: { readonly trip: LiveTripPayload }) {
  const scheduled = new Date(trip.scheduledDate);
  const actualStart = trip.actualStartTime ? new Date(trip.actualStartTime) : null;

  const timeline = getTripTimelineState(trip.status, actualStart);
  const eta =
    trip.status === "ENROUTE"
      ? mockEstimatedArrival(scheduled, trip.distanceKm)
      : null;

  const showTerminalBanner = timeline.terminal === "cancelled" || timeline.terminal === "disputed";

  return (
    <div className="space-y-6">
      {showTerminalBanner ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>
            {timeline.terminal === "cancelled" ? "Trip cancelled" : "Trip under review"}
          </AlertTitle>
          <AlertDescription>
            {timeline.terminal === "cancelled"
              ? "This trip is no longer active. Contact support if you need help."
              : "This trip is being reviewed. Our team will update you shortly."}
          </AlertDescription>
        </Alert>
      ) : null}

      {trip.status === "ENROUTE" && eta ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Alert variant="amber" className="border-amber-400/50 bg-amber-50/90">
            <Route className="size-4 text-amber-700" />
            <AlertTitle className="text-amber-950">Machine is on the way</AlertTitle>
            <AlertDescription className="text-amber-950/90">
              Estimated arrival by{" "}
              <span className="font-semibold tabular-nums">{formatTimeIst(eta)}</span>{" "}
              <span className="text-amber-950/75">(IST)</span>
              <span className="mt-1 block text-xs opacity-90">
                Based on your scheduled slot — actual arrival may vary with traffic and site access.
              </span>
            </AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <Card className="overflow-hidden border-brand-navy/10 shadow-md">
        <CardHeader className="border-b border-brand-navy/8 bg-gradient-to-br from-amber-50/80 to-white pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl text-brand-navy">Live trip tracking</CardTitle>
              <CardDescription className="mt-1 text-brand-navy/70">
                Scheduled {formatDateTimeIst(scheduled)}
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="shrink-0 border-violet-200 bg-violet-50 text-violet-900"
            >
              {trip.partnerYard}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <ol className="relative space-y-0">
            {TRIP_TIMELINE_STEPS.map((label, index) => {
              const completed = isStepCompleted(index, trip.status, timeline.activeStep);
              const active = isStepActive(index, timeline, trip.status);
              const pulse = active && !timeline.suppressPulse && !showTerminalBanner;
              const isLast = index === TRIP_TIMELINE_STEPS.length - 1;

              return (
                <li key={label} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast ? (
                    <div
                      className={cn(
                        "absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2",
                        completed ? "bg-emerald-400/90" : "bg-border"
                      )}
                      aria-hidden
                    />
                  ) : null}

                  <div className="relative z-[1] flex w-10 shrink-0 flex-col items-center">
                    <motion.div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold shadow-sm",
                        completed && "border-emerald-500 bg-emerald-500 text-white",
                        active &&
                          "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/35",
                        !completed &&
                          !active &&
                          "border-slate-200 bg-white text-slate-400"
                      )}
                      animate={
                        pulse
                          ? {
                              scale: [1, 1.09, 1],
                              boxShadow: [
                                "0 4px 14px rgba(245 158 11 / 0.35)",
                                "0 6px 22px rgba(245 158 11 / 0.55)",
                                "0 4px 14px rgba(245 158 11 / 0.35)",
                              ],
                            }
                          : { scale: 1 }
                      }
                      transition={
                        pulse
                          ? { duration: 1.75, repeat: Infinity, ease: "easeInOut" }
                          : { duration: 0.2 }
                      }
                    >
                      {completed && !active ? (
                        <Check className="size-5" strokeWidth={2.5} />
                      ) : (
                        <span className="tabular-nums">{index + 1}</span>
                      )}
                    </motion.div>
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        active ? "text-brand-navy" : "text-brand-navy/80",
                        !completed && !active && "text-brand-navy/45"
                      )}
                    >
                      {label}
                    </p>
                    {index === 1 && trip.status === "ENROUTE" && eta ? (
                      <p className="mt-0.5 text-sm text-brand-navy/60">
                        ETA {formatTimeIst(eta)} IST
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-brand-navy/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-brand-navy">Operator & machine</CardTitle>
          <CardDescription>Details for this dispatch</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-4 rounded-xl bg-brand-navy/[0.03] p-4 ring-1 ring-brand-navy/10">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-800">
              <Headphones className="size-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy/55">
                Operator
              </p>
              <p className="truncate text-lg font-bold text-brand-navy">{trip.equipment.operatorName}</p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl bg-brand-navy/[0.03] p-4 ring-1 ring-brand-navy/10">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-900">
              <Construction className="size-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy/55">
                Machine
              </p>
              <p className="text-lg font-bold text-brand-navy">{trip.equipment.name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-brand-navy/75">
                <span className="inline-flex items-center gap-1">
                  <Truck className="size-3.5 shrink-0 opacity-70" />
                  {categoryLabel(trip.equipment.category)}
                  {trip.equipment.subType ? ` · ${trip.equipment.subType}` : ""}
                </span>
                {trip.equipment.hp > 0 ? (
                  <span className="tabular-nums">{trip.equipment.hp} HP</span>
                ) : null}
                {trip.equipment.registrationNumber ? (
                  <Badge variant="outline" className="font-mono text-xs">
                    {trip.equipment.registrationNumber}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

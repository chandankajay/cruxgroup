"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BookingProgressStage } from "@prisma/client";
import {
  Check,
  CheckCircle2,
  Inbox,
  MapPin,
  PartyPopper,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProgressHistoryEntry = {
  stage: BookingProgressStage;
  timestamp: string;
  note: string | null;
};

const STAGES: {
  stage: BookingProgressStage;
  label: string;
  Icon: LucideIcon;
}[] = [
  { stage: "BOOKING_RECEIVED", label: "Booking received", Icon: Inbox },
  { stage: "BOOKING_CONFIRMED", label: "Booking confirmed", Icon: CheckCircle2 },
  { stage: "MACHINE_ASSIGNED", label: "Machine assigned", Icon: Truck },
  { stage: "ON_SITE", label: "On site", Icon: MapPin },
  { stage: "JOB_COMPLETED", label: "Job completed", Icon: PartyPopper },
];

const STAGE_INDEX: Record<BookingProgressStage, number> = Object.fromEntries(
  STAGES.map((s, i) => [s.stage, i]),
) as Record<BookingProgressStage, number>;

function impliedStageFromBookingStatus(status: string): BookingProgressStage {
  if (status === "COMPLETED") return "JOB_COMPLETED";
  if (status === "DISPATCHED") return "MACHINE_ASSIGNED";
  if (status === "PARTNER_ACCEPTED" || status === "CONFIRMED") return "BOOKING_CONFIRMED";
  return "BOOKING_RECEIVED";
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function timestampForStage(
  stage: BookingProgressStage,
  history: ProgressHistoryEntry[],
): string | null {
  const entry = history.find((h) => h.stage === stage);
  return entry ? formatTimestamp(entry.timestamp) : null;
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function BookingProgressTracker(props: {
  progressStage: BookingProgressStage;
  progressHistory: ProgressHistoryEntry[];
  /** Fallback when stored progressStage lags behind booking.status */
  bookingStatus?: string;
}) {
  const storedIdx = STAGE_INDEX[props.progressStage] ?? 0;
  const impliedIdx = props.bookingStatus
    ? STAGE_INDEX[impliedStageFromBookingStatus(props.bookingStatus)] ?? 0
    : storedIdx;
  const currentIdx = Math.max(storedIdx, impliedIdx);
  const effectiveStage =
    STAGES[currentIdx]?.stage ?? props.progressStage;
  const allComplete = effectiveStage === "JOB_COMPLETED";

  return (
    <div className="w-full">
      {/* Mobile: vertical stepper */}
      <ol className="flex flex-col gap-0 md:hidden">
        {STAGES.map((step, index) => {
          const completed = index < currentIdx || (allComplete && index === currentIdx);
          const current = index === currentIdx && !allComplete;
          const future = index > currentIdx;
          const ts = timestampForStage(step.stage, props.progressHistory);
          const isLast = index === STAGES.length - 1;

          return (
            <li key={step.stage} className="relative flex gap-4 pb-8 last:pb-0">
              {!isLast ? (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2 overflow-hidden">
                  <div className="h-full w-full bg-slate-200" />
                  <AnimatePresence>
                    {completed ? (
                      <motion.div
                        layoutId={`line-v-${index}`}
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        className="absolute inset-x-0 top-0 bg-[#d45800]"
                      />
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              <StageNode
                step={step}
                completed={completed}
                current={current}
                future={future}
                layoutId={`node-v-${index}`}
              />

              <StageLabel
                step={step}
                completed={completed}
                current={current}
                future={future}
                timestamp={ts}
              />
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal stepper */}
      <ol className="hidden md:flex md:items-start md:justify-between">
        {STAGES.map((step, index) => {
          const completed = index < currentIdx || (allComplete && index === currentIdx);
          const current = index === currentIdx && !allComplete;
          const future = index > currentIdx;
          const ts = timestampForStage(step.stage, props.progressHistory);
          const isLast = index === STAGES.length - 1;

          return (
            <li key={step.stage} className="relative flex flex-1 flex-col items-center">
              {!isLast ? (
                <div className="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-5 h-0.5 overflow-hidden">
                  <div className="h-full w-full bg-slate-200" />
                  <AnimatePresence>
                    {completed ? (
                      <motion.div
                        layoutId={`line-h-${index}`}
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="absolute inset-y-0 left-0 bg-[#d45800]"
                      />
                    ) : null}
                  </AnimatePresence>
                </div>
              ) : null}

              <StageNode
                step={step}
                completed={completed}
                current={current}
                future={future}
                layoutId={`node-h-${index}`}
              />

              <StageLabel
                step={step}
                completed={completed}
                current={current}
                future={future}
                timestamp={ts}
                centered
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StageNode(props: {
  step: (typeof STAGES)[number];
  completed: boolean;
  current: boolean;
  future: boolean;
  layoutId: string;
}) {
  const { step, completed, current, future } = props;
  const Icon = step.Icon;

  return (
    <div className="relative z-[1] flex shrink-0 flex-col items-center">
      <motion.div
        layoutId={props.layoutId}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border-2 shadow-sm",
          completed && "border-[#d45800] bg-[#d45800] text-white",
          current && "border-[#d45800] bg-[#fff0e8] text-[#d45800] shadow-md shadow-[#d45800]/25",
          future && "border-slate-200 bg-white text-slate-300",
        )}
        animate={
          current
            ? { scale: [1, 1.08, 1], opacity: [1, 0.85, 1] }
            : { scale: 1, opacity: 1 }
        }
        transition={
          current ? { duration: 1.75, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }
        }
      >
        {completed ? (
          <Check className="size-5" strokeWidth={2.5} />
        ) : (
          <Icon className="size-4" strokeWidth={2} />
        )}
      </motion.div>
    </div>
  );
}

function StageLabel(props: {
  step: (typeof STAGES)[number];
  completed: boolean;
  current: boolean;
  future: boolean;
  timestamp: string | null;
  centered?: boolean;
}) {
  const { step, completed, current, future, timestamp, centered } = props;

  return (
    <div className={cn("min-w-0 flex-1 pt-1", centered && "mt-3 flex-1 text-center")}>
      <p
        className={cn(
          "text-sm font-semibold sm:text-base",
          current && "text-brand-navy",
          completed && "text-brand-navy/80",
          future && "text-brand-navy/40",
        )}
      >
        {step.label}
      </p>
      {current ? (
        <p className="mt-0.5 text-xs font-medium text-[#d45800]">In progress</p>
      ) : null}
      {timestamp ? (
        <p className="mt-0.5 text-xs tabular-nums text-brand-navy/55">{timestamp}</p>
      ) : null}
    </div>
  );
}

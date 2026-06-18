"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { operatorEndJobAction, operatorStartJobAction } from "../../actions/operator-trip";
import type { TripStatus } from "@prisma/client";

/** Minimum elapsed time after start OTP before end OTP can be submitted. */
export const MIN_TRIP_DURATION_MINUTES = 30;

export type OperatorTripPayload = {
  token: string;
  status: TripStatus;
  /** True when job exceeded planned end (+ grace); billing still uses actual start/end. */
  isOverrun: boolean;
  jobLabel: string;
  customerMasked: string;
  mapsUrl: string | null;
  actualStartTimeIso: string | null;
  startOtpUsedAtIso: string | null;
  endOtpUsedAtIso: string | null;
  totalBilledHours: number | null;
};

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function LiveTimer({ startIso }: { startIso: string }) {
  const [, setTick] = useState(0);
  const start = new Date(startIso).getTime();

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [startIso]);

  const elapsedMs = Math.max(0, Date.now() - start);
  const totalSec = Math.floor(elapsedMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const label =
    h > 0
      ? `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
      : `${m}m ${s.toString().padStart(2, "0")}s`;

  return (
    <div className="rounded-2xl border-4 border-neutral-800 bg-neutral-950 px-4 py-8 text-center">
      <p className="mb-2 text-lg font-bold uppercase tracking-widest text-neutral-400">Job time</p>
      <p className="font-mono text-5xl font-black tabular-nums text-white sm:text-6xl">{label}</p>
    </div>
  );
}

function OtpStageForm(props: {
  label: string;
  submitLabel: string;
  onSubmit: (code: string) => void;
  busy: boolean;
  error: string | null;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-2xl border-4 border-neutral-700 bg-neutral-950 p-6">
      <label className="mb-4 block text-center text-xl font-bold text-white">{props.label}</label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={4}
        value={value}
        disabled={props.disabled || props.busy}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="mb-4 w-full rounded-xl border-4 border-white/30 bg-black px-4 py-5 text-center text-5xl font-black tracking-[0.4em] text-white outline-none ring-0 focus:border-emerald-400 disabled:opacity-40"
        placeholder="••••"
      />
      {props.error ? (
        <p className="mb-4 text-center text-lg font-semibold text-red-400">{props.error}</p>
      ) : null}
      {props.disabled && props.disabledMessage ? (
        <p className="mb-4 text-center text-base font-semibold text-amber-300">{props.disabledMessage}</p>
      ) : null}
      <button
        type="button"
        disabled={props.busy || props.disabled || value.length !== 4}
        onClick={() => props.onSubmit(value)}
        className="min-h-14 w-full rounded-xl bg-white py-4 text-xl font-bold text-black disabled:opacity-40"
      >
        {props.busy ? "Checking…" : props.submitLabel}
      </button>
    </div>
  );
}

function useEndOtpEligibility(startOtpUsedAtIso: string | null) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!startOtpUsedAtIso) {
      setRemainingMs(0);
      return;
    }
    const minMs = MIN_TRIP_DURATION_MINUTES * 60 * 1000;
    const startMs = new Date(startOtpUsedAtIso).getTime();

    const tick = () => {
      const elapsed = Date.now() - startMs;
      setRemainingMs(Math.max(0, minMs - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startOtpUsedAtIso]);

  const locked = remainingMs > 0;
  const remainingMin = Math.ceil(remainingMs / 60_000);

  return { locked, remainingMin };
}

export function OperatorJobClient({ initial }: { initial: OperatorTripPayload }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const startUsed = initial.startOtpUsedAtIso != null;
  const endUsed = initial.endOtpUsedAtIso != null;
  const { locked: endLocked, remainingMin } = useEndOtpEligibility(initial.startOtpUsedAtIso);

  const onStartSubmit = (code: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await operatorStartJobAction(initial.token, code);
      if (!res.ok) {
        if (res.error === "BAD_OTP") setActionError("Wrong code. Try again.");
        else if (res.error === "BAD_STATE") setActionError("Cannot start this job right now.");
        else setActionError("Something went wrong.");
        return;
      }
      refresh();
    });
  };

  const onEndSubmit = (code: string) => {
    setActionError(null);
    startTransition(async () => {
      const res = await operatorEndJobAction(initial.token, code);
      if (!res.ok) {
        setActionError(res.userMessage);
        return;
      }
      toast.success(res.payload.userMessage, { duration: 8000 });
      refresh();
    });
  };

  const showDone = endUsed || initial.status === "COMPLETED";
  const showStage1 = !startUsed && !showDone;
  const showStage2 = startUsed && !endUsed && !showDone;

  return (
    <div className="min-h-dvh bg-black px-4 pb-12 pt-8 text-white">
      <header className="mb-10 space-y-3 border-b-4 border-white/20 pb-8">
        <p className="text-2xl font-black leading-tight sm:text-3xl">
          <span className="text-neutral-400">Job: </span>
          {initial.jobLabel}
        </p>
        <p className="text-2xl font-black leading-tight sm:text-3xl">
          <span className="text-neutral-400">Customer: </span>
          {initial.customerMasked}
        </p>
      </header>

      {initial.mapsUrl && !showDone ? (
        <a
          href={initial.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 flex min-h-16 items-center justify-center rounded-2xl border-4 border-sky-400 bg-sky-500 px-4 py-5 text-center text-2xl font-black text-black shadow-lg active:scale-[0.98]"
        >
          Open in Google Maps
        </a>
      ) : null}

      {showStage1 ? (
        <OtpStageForm
          label="Enter Start OTP"
          submitLabel="Submit"
          onSubmit={onStartSubmit}
          busy={pending}
          error={actionError}
        />
      ) : null}

      {showStage2 ? (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-emerald-600/60 bg-emerald-950/40 px-4 py-4">
            <Check className="size-6 shrink-0 text-emerald-400" strokeWidth={2.5} />
            <p className="text-lg font-bold text-emerald-200">
              Trip Started {formatTimestamp(initial.startOtpUsedAtIso!)}
            </p>
          </div>

          {initial.isOverrun ? (
            <div
              className="rounded-2xl border-2 border-amber-500/70 bg-amber-950/40 px-4 py-4 text-center"
              role="status"
            >
              <p className="text-lg font-bold text-amber-300 sm:text-xl">
                This job has exceeded the expected hours (overrun).
              </p>
            </div>
          ) : null}

          {initial.actualStartTimeIso ? <LiveTimer startIso={initial.actualStartTimeIso} /> : null}

          <OtpStageForm
            label="Enter End OTP"
            submitLabel="Submit"
            onSubmit={onEndSubmit}
            busy={pending}
            error={actionError}
            disabled={endLocked}
            disabledMessage={
              endLocked
                ? `Available after ${MIN_TRIP_DURATION_MINUTES} minutes (${remainingMin} min remaining)`
                : undefined
            }
          />
        </div>
      ) : null}

      {showDone ? (
        <div className="rounded-2xl border-4 border-emerald-600/60 bg-emerald-950/40 px-4 py-10 text-center">
          <p className="text-3xl font-black text-emerald-300 sm:text-4xl">Trip Completed</p>
          {initial.endOtpUsedAtIso ? (
            <p className="mt-4 text-xl font-semibold text-emerald-200/90">
              at {formatTimestamp(initial.endOtpUsedAtIso)}
            </p>
          ) : null}
          <p className="mt-6 text-2xl font-bold text-white">
            Total time:{" "}
            <span className="text-emerald-200">
              {initial.totalBilledHours != null ? `${initial.totalBilledHours} hrs` : "—"}
            </span>
          </p>
          <p className="mt-8 text-xl font-semibold text-neutral-300">You can close this window.</p>
        </div>
      ) : null}
    </div>
  );
}

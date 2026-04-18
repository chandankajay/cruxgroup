"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { operatorEndJobAction, operatorStartJobAction } from "../../actions/operator-trip";
import type { TripStatus } from "@prisma/client";

export type OperatorTripPayload = {
  token: string;
  status: TripStatus;
  jobLabel: string;
  customerMasked: string;
  mapsUrl: string | null;
  actualStartTimeIso: string | null;
  totalBilledHours: number | null;
};

function OtpModal(props: {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  busy: boolean;
  error: string | null;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!props.open) setValue("");
  }, [props.open]);

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 pb-8 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-neutral-700 bg-neutral-950 p-6 text-white shadow-2xl">
        <h2 id="otp-modal-title" className="mb-4 text-center text-2xl font-bold tracking-tight">
          {props.title}
        </h2>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={4}
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="mb-4 w-full rounded-xl border-4 border-white/30 bg-black px-4 py-5 text-center text-5xl font-black tracking-[0.4em] text-white outline-none ring-0 focus:border-emerald-400"
          placeholder="••••"
          autoFocus
        />
        {props.error ? (
          <p className="mb-4 text-center text-lg font-semibold text-red-400">{props.error}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={props.busy || value.length !== 4}
            onClick={() => props.onSubmit(value)}
            className="min-h-14 rounded-xl bg-white py-4 text-xl font-bold text-black disabled:opacity-40"
          >
            {props.busy ? "Checking…" : "Confirm"}
          </button>
          <button
            type="button"
            disabled={props.busy}
            onClick={props.onClose}
            className="min-h-12 rounded-xl border-2 border-white/40 py-3 text-lg font-semibold text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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

export function OperatorJobClient({ initial }: { initial: OperatorTripPayload }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

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
      setStartOpen(false);
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
      setEndOpen(false);
      toast.success(res.payload.userMessage, { duration: 8000 });
      refresh();
    });
  };

  const showPreStart =
    initial.status === "CONFIRMED" || initial.status === "EN_ROUTE";
  const startIso =
    initial.status === "IN_PROGRESS" ? initial.actualStartTimeIso : null;
  const showDone = initial.status === "COMPLETED";

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

      {showPreStart ? (
        <div className="flex flex-col gap-6">
          {initial.mapsUrl ? (
            <a
              href={initial.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-16 items-center justify-center rounded-2xl border-4 border-sky-400 bg-sky-500 px-4 py-5 text-center text-2xl font-black text-black shadow-lg active:scale-[0.98]"
            >
              Open in Google Maps
            </a>
          ) : (
            <p className="text-center text-xl font-bold text-amber-400">Location not available for maps.</p>
          )}
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setStartOpen(true);
            }}
            className="min-h-[4.5rem] rounded-2xl bg-emerald-500 px-4 py-6 text-2xl font-black text-black shadow-lg active:scale-[0.98] sm:text-3xl"
          >
            START JOB (Enter OTP)
          </button>
        </div>
      ) : null}

      {startIso ? (
        <div className="flex flex-col gap-8">
          <LiveTimer startIso={startIso} />
          <button
            type="button"
            onClick={() => {
              setActionError(null);
              setEndOpen(true);
            }}
            className="min-h-[4.5rem] rounded-2xl bg-red-600 px-4 py-6 text-2xl font-black text-white shadow-lg active:scale-[0.98] sm:text-3xl"
          >
            END JOB (Enter OTP)
          </button>
        </div>
      ) : initial.status === "IN_PROGRESS" ? (
        <p className="text-center text-2xl font-bold text-amber-400">
          Start time is missing for this job. Please contact dispatch.
        </p>
      ) : null}

      {showDone ? (
        <div className="rounded-2xl border-4 border-emerald-600/60 bg-emerald-950/40 px-4 py-10 text-center">
          <p className="text-3xl font-black text-emerald-300 sm:text-4xl">Job complete!</p>
          <p className="mt-6 text-2xl font-bold text-white">
            Total time:{" "}
            <span className="text-emerald-200">
              {initial.totalBilledHours != null
                ? `${initial.totalBilledHours} hrs`
                : "—"}
            </span>
          </p>
          <p className="mt-8 text-xl font-semibold text-neutral-300">You can close this window.</p>
        </div>
      ) : null}

      <OtpModal
        title="Enter start code"
        open={startOpen}
        onClose={() => !pending && setStartOpen(false)}
        onSubmit={onStartSubmit}
        busy={pending}
        error={actionError}
      />
      <OtpModal
        title="Enter end code"
        open={endOpen}
        onClose={() => !pending && setEndOpen(false)}
        onSubmit={onEndSubmit}
        busy={pending}
        error={actionError}
      />
    </div>
  );
}

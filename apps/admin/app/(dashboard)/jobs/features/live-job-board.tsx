"use client";

import useSWR from "swr";
import type { LiveJobsPayload, LiveTripJobDto } from "../../../../lib/job-board-types";

const fetcher = async (url: string): Promise<LiveJobsPayload> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json() as Promise<LiveJobsPayload>;
};

const istFmt = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "short",
});

function formatIso(iso: string | null): string {
  if (!iso) return "—";
  return istFmt.format(new Date(iso));
}

function statusStyles(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "border-slate-300 bg-slate-50 text-slate-800";
    case "ENROUTE":
      return "border-sky-400 bg-sky-50 text-sky-950";
    case "ON_SITE":
      return "border-amber-400 bg-amber-50 text-amber-950";
    case "COMPLETED":
      return "border-emerald-400 bg-emerald-50 text-emerald-950";
    case "OVERRUN":
      return "border-red-500 bg-red-50 text-red-950";
    default:
      return "border-border bg-muted text-charcoal";
  }
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function TripJobCard({ job }: { readonly job: LiveTripJobDto }) {
  return (
    <article
      className={`rounded-xl border-2 p-4 shadow-sm transition-shadow ${statusStyles(job.status)}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Machine</p>
          <p className="text-lg font-semibold leading-tight">
            {job.machine.category} · {job.machine.name}
          </p>
          <p className="mt-1 text-xs text-black/60">{job.partnerCompany}</p>
        </div>
        <span className="shrink-0 rounded-full border border-current px-3 py-1 text-xs font-bold uppercase">
          {statusLabel(job.status)}
        </span>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-black/60">Operator</dt>
          <dd>
            {job.operator.name}
            <br />
            <span className="font-mono text-xs">{job.operator.phone}</span>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Customer</dt>
          <dd>
            {job.customer.name}
            <br />
            <span className="font-mono text-xs">{job.customer.phone}</span>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-black/60">Location</dt>
          <dd className="break-words">{job.locationLabel}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Scheduled start (IST)</dt>
          <dd className="font-mono text-xs">{formatIso(job.scheduledDate)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Expected end (IST)</dt>
          <dd className="font-mono text-xs">{formatIso(job.expectedEndTime)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Actual start (IST)</dt>
          <dd className="font-mono text-xs">{formatIso(job.actualStartTime)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/60">Actual end (IST)</dt>
          <dd className="font-mono text-xs">{formatIso(job.actualEndTime)}</dd>
        </div>
      </dl>
    </article>
  );
}

export function LiveJobBoard() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<LiveJobsPayload>(
    "/api/jobs/live",
    fetcher,
    {
      refreshInterval: 12_000,
      revalidateOnFocus: true,
    }
  );

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-destructive">
        <p className="font-medium">Could not load live jobs.</p>
        <button
          type="button"
          className="mt-3 rounded-md bg-charcoal px-4 py-2 text-sm text-white"
          onClick={() => void mutate()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Refreshes every 12s. Status reflects operator OTP start/end events. OVERRUN when now is
          more than 1 hour past the planned end (expected end from booking window).
        </p>
        {isValidating ? (
          <span className="text-xs font-medium text-muted-foreground">Updating…</span>
        ) : null}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Active jobs</h2>
        {data.live.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-white p-8 text-center text-muted-foreground">
            No active trips in SCHEDULED / ENROUTE / ON_SITE / OVERRUN.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.live.map((job) => (
              <TripJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-charcoal">Recently completed</h2>
        {data.recentCompleted.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed trips yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.recentCompleted.map((job) => (
              <TripJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

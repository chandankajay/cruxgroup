import Link from "next/link";
import type { ReactNode } from "react";
import type { KycStatus } from "@prisma/client";
import {
  Activity,
  AlertCircle,
  BarChart3,
  IndianRupee,
  Map as MapIcon,
  Tractor,
} from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";

export interface PartnerCommandCenterProps {
  readonly companyName: string;
  readonly kycStatus: KycStatus;
  readonly fleet: { total: number; active: number; pending: number };
  readonly mockMetrics: {
    readonly totalEarnings: number;
    readonly activeTrips: number;
    readonly utilizationPct: number;
  };
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PartnerCommandCenter({
  companyName,
  kycStatus,
  fleet,
  mockMetrics,
}: PartnerCommandCenterProps) {
  const displayName = companyName.trim() || "Partner";
  const kycVerified = kycStatus === "VERIFIED";
  const pendingKycCount = kycVerified ? 0 : fleet.total;
  const utilizationLabel = `${mockMetrics.utilizationPct}%`;
  const activeSharePct = fleet.total > 0 ? Math.round((fleet.active / fleet.total) * 100) : 0;

  return (
    <div
      className={cn(
        "dark min-h-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-zinc-100 shadow-xl sm:p-6",
        "selection:bg-amber-500/30 selection:text-amber-50"
      )}
    >
      <header className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          Welcome back, {displayName}
        </h1>

        {!kycVerified ? (
          <Alert
            variant="amber"
            className={cn(
              "w-full border-amber-400/70 bg-amber-500/25 text-amber-50",
              "[&>svg]:text-amber-200"
            )}
          >
            <AlertCircle />
            <AlertDescription className="text-[15px] leading-relaxed !text-amber-50 opacity-100">
              <span className="font-bold text-amber-100">Action Required:</span> Complete your Trust Center KYC to
              start receiving bookings.{" "}
              <Link
                href="/settings/kyc"
                className="font-semibold text-amber-200 underline decoration-amber-100/50 underline-offset-2 hover:text-white"
              >
                Trust Center
              </Link>
            </AlertDescription>
          </Alert>
        ) : null}
      </header>

      <section
        aria-label="Key metrics"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Active Trips"
          value={String(mockMetrics.activeTrips)}
          icon={<Activity className="size-5 text-amber-500" aria-hidden />}
        />
        <MetricCard
          title="Total Earnings"
          value={formatInr(mockMetrics.totalEarnings)}
          icon={<IndianRupee className="size-5 text-amber-500" aria-hidden />}
        />
        <MetricCard
          title="Fleet Utilization"
          value={utilizationLabel}
          subtext="Machines on rent"
          icon={<BarChart3 className="size-5 text-amber-500" aria-hidden />}
        />
        <MetricCard
          title="Total Fleet"
          value={String(fleet.total)}
          icon={<Tractor className="size-5 text-amber-500" aria-hidden />}
        />
      </section>

      <section
        aria-label="Operations and actions"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
      >
        <div className="lg:col-span-7">
          <Card className="border-zinc-800 bg-zinc-900/80 shadow-md">
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="text-lg text-zinc-50">Current &amp; Upcoming Jobs</CardTitle>
              <CardDescription className="text-zinc-400">
                Live view of work assigned to your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/50">
                <MapIcon className="size-8 text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="max-w-sm text-base leading-relaxed text-zinc-400">
                Your fleet is currently resting. Make sure your machines are active to catch the next booking!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="border-zinc-800 bg-zinc-900/80 shadow-md">
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="text-lg text-zinc-50">Quick Actions</CardTitle>
              <CardDescription className="text-zinc-400">Common tasks, optimized for mobile</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-6">
              <Link
                href="/fleet/new"
                className="flex w-full min-h-12 items-center justify-center rounded-xl bg-amber-500 px-4 py-4 text-center text-base font-semibold text-zinc-950 shadow-sm transition hover:bg-amber-400 active:scale-[0.99]"
              >
                Add New Equipment
              </Link>
              <Link
                href="/settings/kyc"
                className="flex w-full min-h-12 items-center justify-center rounded-xl border-2 border-amber-500/80 bg-amber-500/10 px-4 py-4 text-center text-base font-semibold text-amber-100 transition hover:bg-amber-500/20 active:scale-[0.99]"
              >
                Update KYC
              </Link>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 shadow-inner">
            <CardHeader className="pb-2 pt-5">
              <CardTitle className="text-base text-zinc-200">Fleet Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              <p className="text-sm text-zinc-400">
                <span className="font-semibold text-amber-400">{fleet.active}</span> Active,{" "}
                <span className="font-semibold text-amber-400/90">{pendingKycCount}</span> Pending KYC
              </p>
              <div className="space-y-1.5">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-[width]"
                    style={{ width: `${activeSharePct}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  {fleet.total === 0
                    ? "Add equipment to see utilization here."
                    : `${activeSharePct}% of units marked active`}
                </p>
                <p className="text-xs text-zinc-600">
                  {fleet.pending === 0
                    ? "No machines marked inactive or in maintenance."
                    : `${fleet.pending} unavailable for hire (inactive / maintenance).`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtext,
  icon,
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/90 shadow-md transition hover:border-zinc-700">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
        {subtext ? <CardDescription className="mt-1.5 text-xs text-zinc-500">{subtext}</CardDescription> : null}
      </CardContent>
    </Card>
  );
}

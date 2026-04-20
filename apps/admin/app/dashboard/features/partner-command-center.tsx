"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { KycStatus } from "@prisma/client";
import type { PartnerBusinessDashboard } from "@repo/db";
import {
  Activity,
  AlertCircle,
  BarChart3,
  IndianRupee,
  Map as MapIcon,
  Receipt,
  Tractor,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import {
  IdleMachineBanner,
  TopCustomersCard,
  UtilizationHeatmap,
  formatPartnerInrPaise,
} from "./partner-bi-panels";

export interface PartnerCommandCenterProps {
  readonly companyName: string;
  readonly kycStatus: KycStatus;
  readonly fleet: { total: number; active: number; pending: number };
  readonly bi: PartnerBusinessDashboard;
}

const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 400, damping: 28 },
  },
};

const metricsGridVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.08 },
  },
};

export function PartnerCommandCenter({
  companyName,
  kycStatus,
  fleet,
  bi,
}: PartnerCommandCenterProps) {
  const displayName = companyName.trim() || "Partner";
  const kycVerified = kycStatus === "VERIFIED";
  const pendingKycCount = kycVerified ? 0 : fleet.total;
  const utilizationLabel = `${bi.fleetUtilizationPct}%`;
  const activeSharePct = fleet.total > 0 ? Math.round((fleet.active / fleet.total) * 100) : 0;
  const collectionLabel =
    bi.collectionRatePct == null ? "—" : `${bi.collectionRatePct}%`;

  return (
    <motion.div
      className={cn(
        "dark min-h-full w-full rounded-none border-0 bg-zinc-950 py-4 text-zinc-100 lg:rounded-2xl lg:border lg:border-zinc-800 lg:p-6",
        "selection:bg-amber-500/30 selection:text-amber-50"
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.header className="mb-6 space-y-4" variants={cardVariants}>
        <h1 className="select-none text-2xl font-semibold tracking-tight text-zinc-50">
          Welcome back, {displayName}
        </h1>

        {!kycVerified ? (
          <div className="select-none">
            <div
              className={cn(
                "w-full rounded-2xl border border-amber-500/60 bg-amber-500/10 p-4 text-amber-50",
                "shadow-sm"
              )}
            >
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-amber-200/90">
                    Action required
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                    <span className="font-semibold text-amber-100">Complete your Trust Center KYC</span> to start
                    receiving bookings.{" "}
                    <Link
                      href="/settings/kyc"
                      className="touch-manipulation font-semibold text-amber-200 underline decoration-amber-100/50 underline-offset-2 active:text-white lg:hover:text-white"
                    >
                      Trust Center
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </motion.header>

      <IdleMachineBanner idleMachines={bi.idleMachines} />

      <motion.div className="mb-8" variants={cardVariants} role="region" aria-label="Key metrics">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-400">Overview</p>
        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-4"
          variants={metricsGridVariants}
          initial="initial"
          animate="animate"
        >
          <MetricCard
            title="Monthly revenue"
            value={formatPartnerInrPaise(bi.monthlyRevenuePaise)}
            subtext="Paid this month"
            icon={<IndianRupee className="size-5 text-amber-500" aria-hidden />}
          />
          <MetricCard
            title="Collection rate"
            value={collectionLabel}
            subtext="Paid ÷ invoiced (all time)"
            icon={<TrendingUp className="size-5 text-amber-500" aria-hidden />}
          />
          <MetricCard
            title="Overdue receivables"
            value={formatPartnerInrPaise(bi.overdueReceivablesPaise)}
            subtext="Unpaid &gt; 7 days"
            icon={<Receipt className="size-5 text-amber-500" aria-hidden />}
          />
          <MetricCard
            title="Active trips"
            value={String(bi.activeTrips)}
            icon={<Activity className="size-5 text-amber-500" aria-hidden />}
          />
          <MetricCard
            title="Utilisation"
            value={utilizationLabel}
            subtext="This month (avg days)"
            icon={<BarChart3 className="size-5 text-amber-500" aria-hidden />}
          />
          <MetricCard
            title="Fleet size"
            value={String(fleet.total)}
            icon={<Tractor className="size-5 text-amber-500" aria-hidden />}
          />
        </motion.div>
      </motion.div>

      <motion.div className="mb-8 grid gap-6 lg:grid-cols-12" variants={containerVariants}>
        <motion.div className="lg:col-span-8" variants={cardVariants}>
          <UtilizationHeatmap bi={bi} />
        </motion.div>
        <motion.div className="lg:col-span-4" variants={cardVariants}>
          <TopCustomersCard bi={bi} />
        </motion.div>
      </motion.div>

      <motion.div
        role="region"
        aria-label="Operations and actions"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className="lg:col-span-7" variants={cardVariants}>
          <Card className="select-none border-zinc-800 bg-zinc-800 shadow-md lg:bg-zinc-900/80">
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle className="text-lg text-zinc-50">Current &amp; Upcoming Jobs</CardTitle>
              <CardDescription className="text-sm text-zinc-300">
                Live view of work assigned to your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800/50">
                <MapIcon className="size-8 text-zinc-500" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-zinc-300">
                Your fleet is currently resting. Make sure your machines are active to catch the next booking!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <motion.div variants={cardVariants}>
            <Card className="select-none border-zinc-800 bg-zinc-800 shadow-md lg:bg-zinc-900/80">
              <CardHeader className="border-b border-zinc-800 pb-4">
                <CardTitle className="text-lg text-zinc-50">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-zinc-300">Common tasks, optimized for mobile</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-6">
                <Link
                  href="/fleet/new"
                  className="flex h-12 w-full touch-manipulation select-none items-center justify-center rounded-xl bg-amber-500 px-4 text-center text-sm font-semibold text-zinc-950 shadow-sm active:bg-amber-400 lg:hover:bg-amber-400"
                >
                  Add New Equipment
                </Link>
                <Link
                  href="/settings/kyc"
                  className="flex h-12 w-full touch-manipulation select-none items-center justify-center rounded-xl border-2 border-amber-500/80 bg-amber-500/10 px-4 text-center text-sm font-semibold text-amber-100 active:bg-amber-500/25 lg:hover:bg-amber-500/20"
                >
                  Update KYC
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="select-none border-zinc-800 bg-zinc-800/80 shadow-inner lg:bg-zinc-900/60">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-base text-zinc-200">Fleet Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <p className="text-sm text-zinc-300">
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
                  <p className="text-xs text-zinc-400">
                    {fleet.total === 0
                      ? "Add equipment to see utilization here."
                      : `${activeSharePct}% of units marked active`}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {fleet.pending === 0
                      ? "No machines marked inactive or in maintenance."
                      : `${fleet.pending} unavailable for hire (inactive / maintenance).`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
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
    <motion.div variants={cardVariants}>
      <Card className="h-full select-none rounded-2xl border-zinc-700 bg-zinc-800 shadow-md transition-colors active:border-zinc-600 lg:border-zinc-800 lg:bg-zinc-900/90 lg:hover:border-zinc-700">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-zinc-400">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight text-zinc-50">{value}</p>
          {subtext ? <CardDescription className="mt-1.5 text-xs text-zinc-400">{subtext}</CardDescription> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

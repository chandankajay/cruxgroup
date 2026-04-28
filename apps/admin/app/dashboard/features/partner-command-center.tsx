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
        "min-h-full w-full min-w-0 max-w-full rounded-none border-0 bg-card p-2 py-4 text-foreground lg:rounded-2xl lg:border lg:border-border lg:p-6",
        "selection:bg-primary/20 selection:text-foreground"
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.header className="mb-6 space-y-4" variants={cardVariants}>
        <h1 className="select-none text-2xl font-semibold tracking-tight text-foreground">
          Welcome back, {displayName}
        </h1>

        {!kycVerified ? (
          <div className="select-none">
            <div
              className={cn(
                "w-full rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 text-amber-900 shadow-sm",
                "dark:text-amber-50"
              )}
            >
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" aria-hidden />
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-amber-800/90 dark:text-amber-200/90">
                    Action required
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-950/90 dark:text-zinc-100">
                    <span className="font-semibold text-amber-900 dark:text-amber-100">Complete your Trust Center KYC</span> to start
                    receiving bookings.{" "}
                    <Link
                      href="/settings/kyc"
                      className="touch-manipulation font-semibold text-amber-800 underline decoration-amber-600/50 underline-offset-2 hover:text-amber-900 active:text-amber-900 dark:text-amber-200 dark:decoration-amber-100/50 dark:hover:text-amber-100 dark:active:text-amber-100"
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
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Overview</p>
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

      <motion.div
        className="mb-8 grid min-w-0 max-w-full gap-6 lg:grid-cols-12"
        variants={containerVariants}
      >
        <motion.div className="min-w-0 lg:col-span-8" variants={cardVariants}>
          <UtilizationHeatmap bi={bi} />
        </motion.div>
        <motion.div className="min-w-0 lg:col-span-4" variants={cardVariants}>
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
          <Card className="select-none border border-border bg-card text-card-foreground shadow-md">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg text-foreground">Current &amp; Upcoming Jobs</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Live view of work assigned to your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted/50">
                <MapIcon className="size-8 text-muted-foreground" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Your fleet is currently resting. Make sure your machines are active to catch the next booking!
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex flex-col gap-6 lg:col-span-5">
          <motion.div variants={cardVariants}>
            <Card className="select-none border border-border bg-card text-card-foreground shadow-md">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">Common tasks, optimized for mobile</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-6">
                <Link
                  href="/fleet/new"
                  className="flex h-12 w-full touch-manipulation select-none items-center justify-center rounded-xl bg-primary px-4 text-center text-sm font-semibold text-primary-foreground shadow-sm active:bg-primary/90 lg:hover:bg-primary/90"
                >
                  Add New Equipment
                </Link>
                <Link
                  href="/settings/kyc"
                  className="flex h-12 w-full touch-manipulation select-none items-center justify-center rounded-xl border-2 border-primary/40 bg-primary/10 px-4 text-center text-sm font-semibold text-foreground active:bg-primary/20 lg:hover:bg-primary/15"
                >
                  Update KYC
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="select-none border border-border bg-muted/40 shadow-inner">
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="text-base text-foreground">Fleet Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{fleet.active}</span> Active,{" "}
                  <span className="font-semibold text-amber-600/90 dark:text-amber-400/90">{pendingKycCount}</span> Pending KYC
                </p>
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${activeSharePct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fleet.total === 0
                      ? "Add equipment to see utilization here."
                      : `${activeSharePct}% of units marked active`}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
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
      <Card className="h-full select-none rounded-2xl border border-border bg-card text-card-foreground shadow-md transition-colors active:border-primary/30 lg:hover:border-border">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {subtext ? <CardDescription className="mt-1.5 text-xs text-muted-foreground">{subtext}</CardDescription> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}

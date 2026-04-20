"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import {
  addBreakdownReportAction,
  addHourMeterEntryAction,
  addMachineServiceLogAction,
  resolveBreakdownAction,
  updateMachineServiceSettingsAction,
  type MachineHealthPageData,
} from "../actions";

type Props = {
  readonly initialData: MachineHealthPageData;
  readonly equipmentId: string;
};

export function MachineHealthClient({ initialData, equipmentId }: Props) {
  const router = useRouter();
  const data = initialData;
  const [pending, startTransition] = useTransition();

  const [intervalH, setIntervalH] = useState(String(initialData.serviceIntervalHours));
  const [alertBefore, setAlertBefore] = useState(String(initialData.serviceAlertBeforeHours));

  useEffect(() => {
    setIntervalH(String(initialData.serviceIntervalHours));
    setAlertBefore(String(initialData.serviceAlertBeforeHours));
  }, [initialData.serviceAlertBeforeHours, initialData.serviceIntervalHours]);

  const [hoursDelta, setHoursDelta] = useState("");
  const [bdDesc, setBdDesc] = useState("");
  const [bdFile, setBdFile] = useState<File | null>(null);

  const [svcType, setSvcType] = useState("Preventive / oil service");
  const [svcVendor, setSvcVendor] = useState("");
  const [svcDate, setSvcDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [svcCostInr, setSvcCostInr] = useState("");
  const [svcMeter, setSvcMeter] = useState("");
  const [svcUpdateBaseline, setSvcUpdateBaseline] = useState(true);

  const refresh = () => router.refresh();

  const saveSettings = () => {
    const si = Number(intervalH);
    const ab = Number(alertBefore);
    if (!Number.isFinite(si) || !Number.isFinite(ab)) {
      toast.error("Invalid numbers");
      return;
    }
    startTransition(async () => {
      const res = await updateMachineServiceSettingsAction({
        equipmentId,
        serviceIntervalHours: Math.floor(si),
        serviceAlertBeforeHours: Math.floor(ab),
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Service settings saved");
      refresh();
    });
  };

  const submitHours = () => {
    const h = Number(hoursDelta);
    if (!Number.isFinite(h) || h <= 0) {
      toast.error("Enter positive hours");
      return;
    }
    startTransition(async () => {
      const res = await addHourMeterEntryAction({
        equipmentId,
        recordedHours: h,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Hour meter entry added");
      setHoursDelta("");
      refresh();
    });
  };

  const submitBreakdown = () => {
    if (!bdDesc.trim() || !bdFile) {
      toast.error("Description and photo required");
      return;
    }
    const fd = new FormData();
    fd.set("equipmentId", equipmentId);
    fd.set("description", bdDesc.trim());
    fd.set("photo", bdFile);
    startTransition(async () => {
      const res = await addBreakdownReportAction(fd);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Breakdown reported");
      setBdDesc("");
      setBdFile(null);
      refresh();
    });
  };

  const submitService = () => {
    const cost = Number(svcCostInr.replace(/,/g, ""));
    if (!Number.isFinite(cost) || cost < 0) {
      toast.error("Enter valid cost (INR)");
      return;
    }
    const costPaise = Math.round(cost * 100);
    const meterParsed =
      svcMeter.trim() === "" ? undefined : Number(svcMeter.replace(/,/g, ""));
    if (
      svcUpdateBaseline &&
      (meterParsed === undefined || !Number.isFinite(meterParsed) || meterParsed < 0)
    ) {
      toast.error("Enter cumulative hour reading at service, or disable baseline update");
      return;
    }
    startTransition(async () => {
      const res = await addMachineServiceLogAction({
        equipmentId,
        serviceType: svcType.trim(),
        vendor: svcVendor.trim() || "—",
        dateIso: new Date(svcDate + "T12:00:00").toISOString(),
        costPaise,
        hourMeterAtService: svcUpdateBaseline ? meterParsed : undefined,
        updateBaseline: svcUpdateBaseline,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Service / repair logged");
      setSvcCostInr("");
      refresh();
    });
  };

  const resolveBd = (breakdownId: string) => {
    startTransition(async () => {
      const res = await resolveBreakdownAction({ breakdownId, equipmentId });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Marked resolved");
      refresh();
    });
  };

  const overdue = data.totalHours > data.nextDueHours;
  const hoursUntilDue = Math.max(0, data.nextDueHours - data.totalHours);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">Health score</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on overdue service, open breakdowns, and recent reports (90 days).
            </p>
          </div>
          <div
            className={`text-5xl font-bold tabular-nums ${
              data.healthScore >= 70
                ? "text-emerald-600"
                : data.healthScore >= 40
                  ? "text-amber-600"
                  : "text-red-600"
            }`}
          >
            {data.healthScore}
          </div>
        </div>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2 border-b border-border/60 py-2">
            <dt className="text-muted-foreground">Total hours (meter)</dt>
            <dd className="font-mono font-medium">{data.totalHours.toFixed(1)} h</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-border/60 py-2">
            <dt className="text-muted-foreground">Next service due at</dt>
            <dd className="font-mono font-medium">{data.nextDueHours.toFixed(1)} h</dd>
          </div>
          <div className="flex justify-between gap-2 border-b border-border/60 py-2">
            <dt className="text-muted-foreground">Status</dt>
            <dd className={overdue ? "font-medium text-red-600" : "font-medium text-emerald-700"}>
              {overdue
                ? `Overdue by ${(data.totalHours - data.nextDueHours).toFixed(1)} h`
                : `${hoursUntilDue.toFixed(1)} h until due`}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Service interval (preventive)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Partner WhatsApp when remaining hours to due drops into the alert window (once per crossing).
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Interval (hours)</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              value={intervalH}
              onChange={(e) => setIntervalH(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Alert before due (hours)</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              value={alertBefore}
              onChange={(e) => setAlertBefore(e.target.value)}
            />
          </label>
        </div>
        <Button className="mt-4" type="button" disabled={pending} onClick={saveSettings}>
          Save settings
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Hour meter log</h2>
        <p className="mt-1 text-sm text-muted-foreground">Append hours worked since last reading.</p>
        <div className="mt-4 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Hours (delta)</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              value={hoursDelta}
              onChange={(e) => setHoursDelta(e.target.value)}
              placeholder="e.g. 8.5"
            />
          </label>
          <Button type="button" disabled={pending} onClick={submitHours}>
            Add entry
          </Button>
        </div>
        <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
          {data.hourEntries.map((h) => (
            <li key={h.id} className="flex justify-between gap-2 border-b border-border/40 py-1 font-mono text-xs">
              <span>
                +{h.recordedHours} h · {h.reportedBy}
              </span>
              <span className="text-muted-foreground">
                {new Date(h.createdAt).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Breakdown reporter</h2>
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Description</span>
            <textarea
              className="min-h-[88px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={bdDesc}
              onChange={(e) => setBdDesc(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm"
              onChange={(e) => setBdFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <Button type="button" disabled={pending} onClick={submitBreakdown}>
            Submit breakdown
          </Button>
        </div>
        <ul className="mt-6 space-y-3">
          {data.breakdowns.map((b) => (
            <li
              key={b.id}
              className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm"
            >
              <p className="font-medium">{b.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(b.reportedAt).toLocaleString("en-IN")}
                {b.resolvedAt ? (
                  <span className="ml-2 text-emerald-700">Resolved</span>
                ) : (
                  <span className="ml-2 text-amber-700">Open</span>
                )}
              </p>
              {b.photoUrl && (
                <a
                  href={b.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-brand-orange underline"
                >
                  View photo
                </a>
              )}
              {!b.resolvedAt && (
                <div className="mt-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => resolveBd(b.id)}
                  >
                    Mark resolved
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Repair / service cost log</h2>
        <p className="mt-1 text-sm text-muted-foreground">Costs stored in paise (enter INR below).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Service type</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={svcType}
              onChange={(e) => setSvcType(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Vendor</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={svcVendor}
              onChange={(e) => setSvcVendor(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Date</span>
            <input
              type="date"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={svcDate}
              onChange={(e) => setSvcDate(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Cost (INR)</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              value={svcCostInr}
              onChange={(e) => setSvcCostInr(e.target.value)}
              placeholder="0.00"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Hour meter at service (cumulative)</span>
            <input
              className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
              value={svcMeter}
              onChange={(e) => setSvcMeter(e.target.value)}
              placeholder={String(data.totalHours.toFixed(1))}
            />
          </label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={svcUpdateBaseline}
            onChange={(e) => setSvcUpdateBaseline(e.target.checked)}
          />
          Update preventive baseline from hour reading (next due = reading + interval)
        </label>
        <Button className="mt-4" type="button" disabled={pending} onClick={submitService}>
          Log repair / service
        </Button>

        <ul className="mt-6 max-h-56 space-y-2 overflow-y-auto text-sm">
          {data.serviceLogs.map((s) => (
            <li key={s.id} className="border-b border-border/40 py-2 font-mono text-xs">
              <div className="flex flex-wrap justify-between gap-2">
                <span>
                  {s.serviceType} · ₹{(s.cost / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-muted-foreground">
                  {new Date(s.date).toLocaleDateString("en-IN")}
                </span>
              </div>
              <div className="text-muted-foreground">{s.vendor}</div>
              {s.hourMeterAtService != null && (
                <div>Meter @ service: {s.hourMeterAtService}</div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

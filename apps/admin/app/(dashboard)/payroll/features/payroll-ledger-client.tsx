"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  exportMusterRollCsvAction,
  finalizePayrollAction,
  previewPayrollAction,
  savePayrollDraftAction,
  type PayrollOperatorRow,
  type PayrollPreviewResult,
} from "../actions";

function istNowYearMonth(): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value ?? new Date().getFullYear());
  const month = Number(parts.find((p) => p.type === "month")?.value ?? 1);
  return { year, month };
}

function paiseToInrInput(paise: number): string {
  return (paise / 100).toFixed(2);
}

function parseInrToPaise(raw: string): number | null {
  const n = Number(raw.replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function PayrollLedgerClient({
  operators,
}: {
  readonly operators: PayrollOperatorRow[];
}) {
  const router = useRouter();
  const { year: defaultYear, month: defaultMonth } = istNowYearMonth();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [operatorId, setOperatorId] = useState(operators[0]?.userId ?? "");
  const [preview, setPreview] = useState<PayrollPreviewResult | null>(null);
  const [deductionInr, setDeductionInr] = useState("0");
  const [recoveryInr, setRecoveryInr] = useState("0");
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => operators.find((o) => o.userId === operatorId),
    [operators, operatorId]
  );

  const runPreview = () => {
    if (!operatorId) {
      toast.error("Select an operator");
      return;
    }
    startTransition(async () => {
      const res = await previewPayrollAction({ year, month, operatorId });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setPreview(res.data);
      setDeductionInr(paiseToInrInput(res.data.deductionPaise));
      setRecoveryInr(paiseToInrInput(res.data.advanceRecoveryPaise));
      toast.success("Preview loaded");
      router.refresh();
    });
  };

  const deductionPaise = parseInrToPaise(deductionInr) ?? 0;
  const recoveryPaise = parseInrToPaise(recoveryInr) ?? 0;

  const liveNet =
    preview != null
      ? Math.max(
          0,
          preview.grossPayPaise - deductionPaise - recoveryPaise
        )
      : null;

  const saveDraft = () => {
    if (!operatorId) return;
    const d = parseInrToPaise(deductionInr);
    const r = parseInrToPaise(recoveryInr);
    if (d === null || r === null) {
      toast.error("Enter valid INR amounts");
      return;
    }
    startTransition(async () => {
      const res = await savePayrollDraftAction({
        year,
        month,
        operatorId,
        deductionPaise: d,
        advanceRecoveryPaise: r,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Payroll saved");
      const pr = await previewPayrollAction({ year, month, operatorId });
      if (pr.ok) setPreview(pr.data);
      router.refresh();
    });
  };

  const finalize = () => {
    if (!operatorId) return;
    const d = parseInrToPaise(deductionInr);
    const r = parseInrToPaise(recoveryInr);
    if (d === null || r === null) {
      toast.error("Enter valid INR amounts");
      return;
    }
    startTransition(async () => {
      const res = await finalizePayrollAction({
        year,
        month,
        operatorId,
        deductionPaise: d,
        advanceRecoveryPaise: r,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.notifyFailed) {
        toast.success("Payroll saved and PDF uploaded. WhatsApp notification could not be sent — check AiSensy logs.");
      } else {
        toast.success("Salary slip uploaded and WhatsApp sent (if template is configured)");
      }
      const pr = await previewPayrollAction({ year, month, operatorId });
      if (pr.ok) setPreview(pr.data);
      router.refresh();
    });
  };

  const downloadMuster = () => {
    startTransition(async () => {
      const res = await exportMusterRollCsvAction({ year, month });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Muster roll downloaded");
    });
  };

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: new Date(2000, i, 1).toLocaleString("en-IN", { month: "long" }),
    }));
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-charcoal">Period & operator</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Year</span>
            <input
              type="number"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={year}
              min={2020}
              max={2100}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Month</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[14rem] flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Operator</span>
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={operatorId}
              onChange={(e) => setOperatorId(e.target.value)}
            >
              {operators.length === 0 ? (
                <option value="">No operators with profiles</option>
              ) : (
                operators.map((o) => (
                  <option key={o.userId} value={o.userId}>
                    {o.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || !operatorId}
            onClick={runPreview}
            className="rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Compute preview
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={downloadMuster}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium"
          >
            Download muster roll (CSV)
          </button>
        </div>
      </section>

      {selected && (
        <p className="text-sm text-muted-foreground">
          Daily rate (paise): <span className="font-mono text-charcoal">{selected.dailyRatePaise}</span>
          {" · "}
          Advance balance (paise):{" "}
          <span className="font-mono text-charcoal">{selected.advanceBalancePaise}</span>
        </p>
      )}

      {preview && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Preview — {preview.operatorName}</h2>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">Working days (distinct IST)</dt>
              <dd className="font-mono font-medium">{preview.daysWorked}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">Trips counted</dt>
              <dd className="font-mono font-medium">{preview.tripIds.length}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">Gross (paise)</dt>
              <dd className="font-mono font-medium">{preview.grossPayPaise}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border/60 py-2">
              <dt className="text-muted-foreground">Saved PDF</dt>
              <dd className="max-w-xs truncate font-mono text-xs">
                {preview.existingPdfUrl ? (
                  <a href={preview.existingPdfUrl} className="text-brand-orange underline" target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Deductions (INR)</span>
              <input
                type="text"
                inputMode="decimal"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                value={deductionInr}
                onChange={(e) => setDeductionInr(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Advance recovery (INR)</span>
              <input
                type="text"
                inputMode="decimal"
                className="rounded-md border border-input bg-background px-3 py-2 font-mono text-sm"
                value={recoveryInr}
                onChange={(e) => setRecoveryInr(e.target.value)}
              />
            </label>
          </div>

          {liveNet != null && (
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Net payable (preview, paise): </span>
              <span className="font-mono font-semibold text-charcoal">{liveNet}</span>
              {" "}
              <span className="text-muted-foreground">
                (₹{(liveNet / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })})
              </span>
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={saveDraft}
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              Save payroll
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={finalize}
              className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white"
            >
              Generate PDF, upload & WhatsApp
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

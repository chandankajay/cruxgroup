"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { Button } from "@repo/ui/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/dialog";
import { Textarea } from "@repo/ui/textarea";
import { Label } from "@repo/ui/label";
import { rejectPartnerKyc, verifyPartnerKyc } from "../actions";
import type { KycQueuePartnerRow } from "../types";

interface KycApprovalQueueProps {
  readonly initialRows: KycQueuePartnerRow[];
}

function formatSubmitted(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function DocBlock({
  title,
  number,
  docViewPath,
}: {
  title: string;
  number: string | null;
  docViewPath: string | null;
}) {
  const viewUrl = docViewPath;
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 font-mono text-sm text-foreground">{number ?? "—"}</p>
      {viewUrl ? (
        <div className="mt-2 space-y-2">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Open full size in new tab
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element -- proxied or public Blob URLs */}
          <img
            src={viewUrl}
            alt={`${title} document`}
            className="max-h-44 w-full rounded-md border border-border bg-background object-contain"
          />
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No document uploaded.</p>
      )}
    </div>
  );
}

export function KycApprovalQueue({ initialRows }: KycApprovalQueueProps) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [review, setReview] = useState<KycQueuePartnerRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [pending, setPending] = useState<"verify" | "reject" | null>(null);

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const closeDialog = useCallback(() => {
    setReview(null);
    setRejectReason("");
    setShowRejectInput(false);
    setPending(null);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!review) return;
    setPending("verify");
    const res = await verifyPartnerKyc(review.id);
    setPending(null);
    if (res.success) {
      toast.success("Partner verified.");
      setRows((prev) => prev.filter((r) => r.id !== review.id));
      closeDialog();
      router.refresh();
    } else {
      toast.error(res.error ?? "Verification failed.");
    }
  }, [review, closeDialog, router]);

  const handleRejectSubmit = useCallback(async () => {
    if (!review) return;
    setPending("reject");
    const res = await rejectPartnerKyc(review.id, rejectReason);
    setPending(null);
    if (res.success) {
      toast.success("KYC rejected; partner will see your reason.");
      setRows((prev) => prev.filter((r) => r.id !== review.id));
      closeDialog();
      router.refresh();
    } else {
      toast.error(res.error ?? "Rejection failed.");
    }
  }, [review, rejectReason, closeDialog, router]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold tracking-tight text-charcoal">Platform Admin: KYC Approvals</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review submitted partner identity documents. Queue: {rows.length}
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-charcoal/5 hover:bg-charcoal/5">
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                Partner / Yard Name
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                Phone Number
              </TableHead>
              <TableHead className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide">
                Submitted Date
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">
                Fleet Size
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wide">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No partners awaiting KYC review.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="text-sm">
                  <TableCell className="max-w-[200px] font-medium text-foreground">
                    {row.companyName || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {row.user.phoneNumber ?? "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatSubmitted(row.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.equipmentCount}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" type="button" onClick={() => setReview(row)}>
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={review !== null}
        onClose={closeDialog}
        className="max-h-[90vh] max-w-5xl overflow-y-auto p-0 sm:p-6"
      >
        {review ? (
          <>
            <DialogHeader className="mb-0 border-b border-border px-6 pb-4 pt-6">
              <DialogTitle>Review: {review.companyName || "Partner"}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                User: {review.user.name}
                {review.user.email ? ` · ${review.user.email}` : ""}
              </p>
            </DialogHeader>

            <div className="grid gap-6 px-6 py-4 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Partner details</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Address</dt>
                    <dd>{review.address}</dd>
                  </div>
                  {review.baseLocation ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Base location</dt>
                      <dd>{review.baseLocation}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs text-muted-foreground">Service radius</dt>
                    <dd>{review.maxRadius} km</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">GST</dt>
                    <dd className="font-mono">{review.gstNumber ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Bank account</dt>
                    <dd className="font-mono">{review.bankAccountNumber ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">IFSC</dt>
                    <dd className="font-mono">{review.bankIfscCode ?? "—"}</dd>
                  </div>
                  {review.cancelledChequeViewPath ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">Cancelled cheque</dt>
                      <dd>
                        <a
                          href={review.cancelledChequeViewPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Open document
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Uploaded documents</h3>
                <DocBlock title="PAN" number={review.panNumber} docViewPath={review.panDocViewPath} />
                <DocBlock
                  title="Aadhaar"
                  number={review.aadhaarNumber}
                  docViewPath={review.aadhaarDocViewPath}
                />
              </div>
            </div>

            <div className="border-t border-border px-6 py-4">
              {showRejectInput ? (
                <div className="space-y-3">
                  <Label htmlFor="reject-reason">Rejection reason (visible to partner)</Label>
                  <Textarea
                    id="reject-reason"
                    placeholder="e.g. PAN card unreadable — please re-upload a clearer scan."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="resize-y"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={pending !== null}
                      onClick={() => void handleRejectSubmit()}
                    >
                      {pending === "reject" ? "Submitting…" : "Confirm rejection"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={pending !== null}
                      onClick={() => {
                        setShowRejectInput(false);
                        setRejectReason("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter className="mt-0 flex-wrap gap-2 border-t border-border px-6 py-4 sm:justify-between">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Close
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="bg-emerald-600 text-primary-foreground hover:bg-emerald-700"
                  disabled={pending !== null}
                  onClick={() => void handleVerify()}
                >
                  {pending === "verify" ? "Verifying…" : "Verify Partner"}
                </Button>
                {!showRejectInput ? (
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending !== null}
                    onClick={() => setShowRejectInput(true)}
                  >
                    Reject
                  </Button>
                ) : null}
              </div>
            </DialogFooter>
          </>
        ) : null}
      </Dialog>
    </div>
  );
}

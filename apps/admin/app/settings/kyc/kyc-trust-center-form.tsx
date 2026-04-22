"use client";

import { useMemo, useTransition } from "react";
import type { KycStatus } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { buildKycTrustFormSchema, type KycTrustFormValues } from "./schema";
import { KycFileDropzone } from "./kyc-file-dropzone";
import { uploadKycAction, type TrustCenterSubmitResult } from "./actions";

export type TrustCenterKycSnapshot = {
  kycStatus: KycStatus;
  kycRejectionReason: string | null;
  /** Bumps the form key when Prisma data changes. */
  updatedAtIso: string;
  panNumber: string | null;
  panDocUrl: string | null;
  aadhaarNumber: string | null;
  aadhaarDocUrl: string | null;
  gstNumber: string | null;
  bankAccountNumber: string | null;
  bankIfscCode: string | null;
  cancelledChequeUrl: string | null;
};

function duplicateCodeMessage(result: TrustCenterSubmitResult): string | null {
  if (result.success) return null;
  const { code, error } = result;
  if (code === "DUPLICATE_PAN" || code === "DUPLICATE_AADHAAR" || code === "DUPLICATE_GST") {
    return error;
  }
  return null;
}

export function KycTrustCenterForm({ snapshot }: { snapshot: TrustCenterKycSnapshot }) {
  const { kycStatus } = snapshot;
  /**
   * Prisma: `PENDING` = not yet submitted; `SUBMITTED` = under review; `VERIFIED` = approved;
   * `REJECTED` = resubmit path.
   */
  const isReadOnlyKyc = kycStatus === "SUBMITTED" || kycStatus === "VERIFIED";
  const canEdit = kycStatus === "PENDING" || kycStatus === "REJECTED";
  const showSubmit = canEdit;

  const formSchema = useMemo(
    () =>
      buildKycTrustFormSchema({
        isReadOnly: isReadOnlyKyc,
        isRejectedResubmit: kycStatus === "REJECTED",
        existingPanDocUrl: snapshot.panDocUrl,
        existingAadhaarDocUrl: snapshot.aadhaarDocUrl,
        existingChequeUrl: snapshot.cancelledChequeUrl,
      }),
    [isReadOnlyKyc, kycStatus, snapshot.panDocUrl, snapshot.aadhaarDocUrl, snapshot.cancelledChequeUrl]
  );

  const defaultValues: KycTrustFormValues = useMemo(
    () => ({
      panNumber: snapshot.panNumber ?? "",
      aadhaarNumber: snapshot.aadhaarNumber ?? "",
      gstNumber: snapshot.gstNumber ?? "",
      bankAccountNumber: snapshot.bankAccountNumber ?? "",
      bankIfscCode: snapshot.bankIfscCode ?? "",
      panDoc: undefined,
      aadhaarDoc: undefined,
      chequeDoc: undefined,
    }),
    [
      snapshot.panNumber,
      snapshot.aadhaarNumber,
      snapshot.gstNumber,
      snapshot.bankAccountNumber,
      snapshot.bankIfscCode,
    ]
  );

  const form = useForm<KycTrustFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const aadhaarDisplayValue = (raw: string) => {
    if (!isReadOnlyKyc) return raw;
    if (!raw || raw.length < 4) return raw;
    return "•".repeat(8) + raw.slice(-4);
  };

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("panNumber", values.panNumber);
      fd.append("aadhaarNumber", values.aadhaarNumber);
      fd.append("gstNumber", values.gstNumber);
      fd.append("bankAccountNumber", values.bankAccountNumber);
      fd.append("bankIfscCode", values.bankIfscCode);
      if (values.panDoc instanceof File) fd.append("panDoc", values.panDoc);
      if (values.aadhaarDoc instanceof File) fd.append("aadhaarDoc", values.aadhaarDoc);
      if (values.chequeDoc instanceof File) fd.append("chequeDoc", values.chequeDoc);

      let result: TrustCenterSubmitResult;
      try {
        result = await uploadKycAction(fd);
      } catch (err) {
        console.error("[KYC] uploadKycAction threw (client)", err);
        const msg =
          "We could not reach the server. Check your connection and try again.";
        form.setError("root", { message: msg });
        toast.error("KYC submission failed", { description: msg });
        return;
      }

      if (!result.success) {
        const dup = duplicateCodeMessage(result);
        const msg = dup ?? result.error;
        form.setError("root", { message: msg });
        toast.error("KYC submission failed", { description: msg });
        return;
      }

      toast.success("KYC Submitted Successfully!");
      window.location.reload();
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col space-y-6">
        {kycStatus === "SUBMITTED" ? (
          <Alert variant="amber" className="border-amber-500/60">
            <Clock className="h-4 w-4" />
            <AlertTitle>Documents under review</AlertTitle>
            <AlertDescription>
              Your KYC is being reviewed. You cannot change these details until verification
              is complete. The summary below shows what you submitted.
            </AlertDescription>
          </Alert>
        ) : null}

        {kycStatus === "VERIFIED" ? (
          <Alert
            className="border-emerald-500/60 bg-emerald-50/90 text-emerald-950 dark:border-emerald-500/50 dark:bg-emerald-950/30 dark:text-emerald-50 [&>svg]:text-emerald-700 dark:[&>svg]:text-emerald-200"
            role="status"
          >
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>KYC approved</AlertTitle>
            <AlertDescription>
              Your KYC is complete. Fleet and payout features use this verified profile.
            </AlertDescription>
          </Alert>
        ) : null}

        {kycStatus === "REJECTED" ? (
          <Alert variant="destructive" className="border-red-500/50">
            <XCircle className="h-4 w-4" />
            <AlertTitle>KYC rejected — please update your details</AlertTitle>
            <AlertDescription>
              {snapshot.kycRejectionReason?.trim() ||
                "Please correct your details and upload clear documents, then resubmit."}
            </AlertDescription>
          </Alert>
        ) : null}

        {form.formState.errors.root ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {form.formState.errors.root.message}
          </p>
        ) : null}

        {/* A — Identity */}
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>PAN and Aadhaar for statutory verification.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-8">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCDE1234F"
                        autoComplete="off"
                        maxLength={10}
                        disabled={isReadOnlyKyc}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <KycFileDropzone
                control={form.control}
                name="panDoc"
                label="PAN document"
                disabled={isReadOnlyKyc}
                existingFileUrl={snapshot.panDocUrl}
              />
            </div>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="aadhaarNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12 digits"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={isReadOnlyKyc ? 20 : 12}
                        disabled={isReadOnlyKyc}
                        {...field}
                        value={aadhaarDisplayValue(field.value)}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/\D/g, "").slice(0, 12))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <KycFileDropzone
                control={form.control}
                name="aadhaarDoc"
                label="Aadhaar document"
                disabled={isReadOnlyKyc}
                existingFileUrl={snapshot.aadhaarDocUrl}
              />
            </div>
          </CardContent>
        </Card>

        {/* B — Business */}
        <Card>
          <CardHeader>
            <CardTitle>Business</CardTitle>
            <CardDescription>Optional GSTIN for invoicing.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST number (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="15-character GSTIN"
                      autoComplete="off"
                      maxLength={15}
                      disabled={isReadOnlyKyc}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase().replace(/\s/g, ""))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* C — Bank */}
        <Card>
          <CardHeader>
            <CardTitle>Bank details</CardTitle>
            <CardDescription>Payout account for settlements.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FormField
                control={form.control}
                name="bankAccountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank account number</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={isReadOnlyKyc}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\s/g, ""))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankIfscCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IFSC code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="HDFC0001234"
                        autoComplete="off"
                        maxLength={11}
                        disabled={isReadOnlyKyc}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase().replace(/\s/g, ""))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <KycFileDropzone
              control={form.control}
              name="chequeDoc"
              label="Cancelled cheque"
              disabled={isReadOnlyKyc}
              existingFileUrl={snapshot.cancelledChequeUrl}
            />
          </CardContent>
        </Card>

        {showSubmit ? (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {pending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
              <span>
                {pending
                  ? "Uploading documents…"
                  : kycStatus === "REJECTED"
                    ? "Resubmit KYC"
                    : "Submit for verification"}
              </span>
            </Button>
          </div>
        ) : null}
      </form>
    </Form>
  );
}

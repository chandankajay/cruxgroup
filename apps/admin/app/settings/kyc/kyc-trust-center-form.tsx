"use client";

import { useMemo, useTransition } from "react";
import type { KycStatus } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { kycTrustFormSchema, type KycTrustFormValues } from "./schema";
import { KycFileDropzone } from "./kyc-file-dropzone";
import { uploadKycAction, type TrustCenterSubmitResult } from "./actions";

export type TrustCenterKycSnapshot = {
  kycStatus: KycStatus;
  kycRejectionReason: string | null;
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
  const locked = kycStatus === "VERIFIED" || kycStatus === "SUBMITTED";
  const showForm = useMemo(
    () => kycStatus === "PENDING" || kycStatus === "REJECTED",
    [kycStatus]
  );

  const form = useForm<KycTrustFormValues>({
    resolver: zodResolver(kycTrustFormSchema),
    defaultValues: {
      panNumber: snapshot.panNumber ?? "",
      aadhaarNumber: snapshot.aadhaarNumber ?? "",
      gstNumber: snapshot.gstNumber ?? "",
      bankAccountNumber: snapshot.bankAccountNumber ?? "",
      bankIfscCode: snapshot.bankIfscCode ?? "",
    },
    mode: "onSubmit",
  });

  const [pending, startTransition] = useTransition();

  const onSubmit = form.handleSubmit((values) => {
    form.clearErrors("root");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("panNumber", values.panNumber);
      fd.append("aadhaarNumber", values.aadhaarNumber);
      fd.append("gstNumber", values.gstNumber);
      fd.append("bankAccountNumber", values.bankAccountNumber);
      fd.append("bankIfscCode", values.bankIfscCode);
      fd.append("panDoc", values.panDoc);
      fd.append("aadhaarDoc", values.aadhaarDoc);
      fd.append("chequeDoc", values.chequeDoc);

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

  if (kycStatus === "VERIFIED") {
    return (
      <Card className="border-emerald-200 bg-emerald-50/80">
        <CardHeader>
          <CardTitle className="text-emerald-900">Account fully verified</CardTitle>
          <CardDescription className="text-emerald-800">
            Your KYC is complete. Fleet and payout features use this verified profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-emerald-900">
          <p>
            <span className="font-semibold">PAN:</span> {snapshot.panNumber ?? "—"}
          </p>
          <p>
            <span className="font-semibold">Aadhaar:</span>{" "}
            {snapshot.aadhaarNumber ? "••••••••" + snapshot.aadhaarNumber.slice(-4) : "—"}
          </p>
          <p>
            <span className="font-semibold">GST:</span> {snapshot.gstNumber ?? "—"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col space-y-6">
        {kycStatus === "SUBMITTED" ? (
          <div
            role="status"
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
          >
            Documents under review. You cannot change details until the team finishes
            verification.
          </div>
        ) : null}

        {kycStatus === "REJECTED" ? (
          <div
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950"
          >
            <p className="font-semibold text-red-900">Submission rejected</p>
            <p className="mt-1 text-red-800">
              {snapshot.kycRejectionReason?.trim() ||
                "Please correct your details and upload clear documents, then submit again."}
            </p>
          </div>
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
                        disabled={locked || !showForm}
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
                disabled={locked || !showForm}
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
                        maxLength={12}
                        disabled={locked || !showForm}
                        {...field}
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
                disabled={locked || !showForm}
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
                      disabled={locked || !showForm}
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
                        disabled={locked || !showForm}
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
                        disabled={locked || !showForm}
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
              disabled={locked || !showForm}
            />
          </CardContent>
          {showForm ? (
            <CardFooter>
              <Button
                type="submit"
                disabled={pending}
                className="inline-flex w-full items-center justify-center gap-2 sm:w-auto"
              >
                {pending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : null}
                <span>{pending ? "Uploading Documents..." : "Submit for verification"}</span>
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </form>
    </Form>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { acceptTerms } from "../../lib/partner/actions";

interface PartnerLegalGateProps {
  readonly termsContent: ReactNode;
}

export function PartnerLegalGate({ termsContent }: PartnerLegalGateProps) {
  const [agreed, setAgreed] = useState(false);
  const [pending, startTransition] = useTransition();

  const onContinue = () => {
    startTransition(async () => {
      try {
        const result = await acceptTerms();
        if (result?.success === false) {
          toast.error("Could not save acceptance", { description: result.error });
        }
      } catch {
        /* `redirect()` from the server action completes navigation */
      }
    });
  };

  return (
    <Card className="mx-auto w-full max-w-lg border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-charcoal">Partner Terms &amp; Conditions</CardTitle>
        <CardDescription>
          Please read the agreement below. You must accept before accessing your dashboard or
          submitting KYC.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="max-h-[min(50vh,420px)] overflow-y-auto rounded-md border border-border bg-muted/30 p-4"
          tabIndex={0}
          aria-label="Partner Terms and Conditions"
        >
          {termsContent}
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
          <input
            type="checkbox"
            className="border-input text-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded border focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            checked={agreed}
            disabled={pending}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-charcoal">
            I have read and agree to the Partner Terms and Conditions.
          </span>
        </label>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={!agreed || pending}
          onClick={onContinue}
        >
          {pending ? "Saving…" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}

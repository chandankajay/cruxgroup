"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { partnerOnboardingSchema, type PartnerOnboardingValues } from "./schema";
import { createPartnerProfileAction } from "./actions";

export function PartnerOnboardingForm() {
  const [pending, startTransition] = useTransition();
  const form = useForm<PartnerOnboardingValues>({
    resolver: zodResolver(partnerOnboardingSchema),
    defaultValues: {
      companyName: "",
      address: "",
      baseLocation: "",
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        const result = await createPartnerProfileAction(values);
        if (result?.success === false) {
          toast.error("Could not create profile", { description: result.error });
        }
      } catch {
        /* `redirect()` from the server action completes navigation */
      }
    });
  });

  return (
    <Card className="mx-auto w-full max-w-lg border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-charcoal">Fleet profile</CardTitle>
        <CardDescription>
          We use this to list your equipment and show your service area to customers.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Fleet / yard name</Label>
            <Input
              id="companyName"
              autoComplete="organization"
              placeholder="e.g. Sri Lakshmi Earthmovers"
              disabled={pending}
              {...form.register("companyName")}
            />
            {form.formState.errors.companyName ? (
              <p className="text-xs text-red-600">{form.formState.errors.companyName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Primary yard address</Label>
            <textarea
              id="address"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[88px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              autoComplete="street-address"
              placeholder="Full street address including city and PIN"
              disabled={pending}
              {...form.register("address")}
            />
            {form.formState.errors.address ? (
              <p className="text-xs text-red-600">{form.formState.errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseLocation">City or coordinates</Label>
            <Input
              id="baseLocation"
              autoComplete="off"
              placeholder="Hyderabad — or 17.4065, 78.4772"
              disabled={pending}
              {...form.register("baseLocation")}
            />
            <p className="text-xs text-muted-foreground">
              Use decimal latitude and longitude separated by a comma for an exact pin; otherwise
              we place a default map anchor until you refine location in Service Area.
            </p>
            {form.formState.errors.baseLocation ? (
              <p className="text-xs text-red-600">{form.formState.errors.baseLocation.message}</p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending} size="lg">
            {pending ? "Creating…" : "Create my profile"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

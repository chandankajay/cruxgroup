"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Switch } from "@repo/ui/switch";
import {
  createSalespersonAction,
  updateSalespersonAction,
  type SalespersonDetail,
} from "../actions";

type Props = {
  readonly mode: "create" | "edit";
  readonly initial?: SalespersonDetail;
};

export function SalespersonForm({ mode, initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phoneNumber ?? "");
  const [canSendQuotes, setCanSendQuotes] = useState(initial?.canSendQuotes ?? false);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [areasText, setAreasText] = useState(
    (initial?.assignedAreaSlugs ?? []).join(", "),
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    const assignedAreaSlugs = areasText
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const payload = {
        name,
        phoneNumber: phone,
        canSendQuotes,
        isActive,
        assignedAreaSlugs,
      };
      if (mode === "create") {
        const result = await createSalespersonAction(payload);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.push(`/salespeople/${result.id}/edit`);
        router.refresh();
        return;
      }
      if (!initial?.id) return;
      const result = await updateSalespersonAction(initial.id, payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "create" ? "New salesperson" : "Edit salesperson"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Only admins can create salesperson accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/salespeople">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {mode === "create" ? "Create account" : "Save changes"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-500" role="alert">{error}</p>
      ) : null}

      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sp-name">Full name *</Label>
          <Input
            id="sp-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sp-phone">Phone (login via OTP) *</Label>
          <Input
            id="sp-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            inputMode="tel"
            autoComplete="tel"
          />
          <p className="text-xs text-muted-foreground">
            They sign in with phone OTP + PIN. The role is set here, not chosen by the user.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sp-areas">Assigned clusters / areas</Label>
          <Input
            id="sp-areas"
            value={areasText}
            onChange={(e) => setAreasText(e.target.value)}
            placeholder="shadnagar, kothur, fatimapur-kothur"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated slugs. Leads from these areas are suggested when assigning.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
          <div>
            <p className="font-medium">Can send quotes</p>
            <p className="text-sm text-muted-foreground">
              When on, this salesperson can mark &quot;Quotation sent&quot; with amount and
              Billbook ref. When off, they use &quot;Send to admin&quot; after the site visit.
            </p>
          </div>
          <Switch
            checked={canSendQuotes}
            onCheckedChange={setCanSendQuotes}
            aria-label="Can send quotes"
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 p-4">
          <div>
            <p className="font-medium">Active</p>
            <p className="text-sm text-muted-foreground">
              Inactive salespeople cannot sign in. Their leads stay assigned until you reassign
              them.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="Active account" />
        </div>
      </div>
    </form>
  );
}

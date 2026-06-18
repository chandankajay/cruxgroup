"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LeadStatus, LeadType } from "@prisma/client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { createLeadAction, type LeadRow } from "../actions";

const LEAD_TYPES: { value: LeadType; label: string }[] = [
  { value: "FLEET_PARTNER", label: "Fleet partner" },
  { value: "CUSTOMER", label: "Customer" },
];

const STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "CONVERTED",
  "DEAD",
];

function statusVariant(status: LeadStatus): "default" | "secondary" | "outline" {
  if (status === "CONVERTED") return "default";
  if (status === "DEAD") return "secondary";
  return "outline";
}

interface LeadsPageContentProps {
  readonly initialItems: LeadRow[];
  readonly initialTotal: number;
  readonly initialStatus?: LeadStatus;
  readonly initialLeadType?: LeadType;
  readonly initialSearch?: string;
}

export function LeadsPageContent({
  initialItems,
  initialTotal,
  initialStatus,
  initialLeadType,
  initialSearch = "",
}: LeadsPageContentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [leadType, setLeadType] = useState<LeadType>("CUSTOMER");
  const [source, setSource] = useState("");

  const applyFilters = useCallback(
    (params: { status?: string; leadType?: string; search?: string }) => {
      const sp = new URLSearchParams();
      if (params.status) sp.set("status", params.status);
      if (params.leadType) sp.set("leadType", params.leadType);
      if (params.search) sp.set("search", params.search);
      const q = sp.toString();
      router.push(q ? `/sales/leads?${q}` : "/sales/leads");
    },
    [router],
  );

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await createLeadAction({
        name,
        phoneNumber: phone,
        leadType,
        source,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowForm(false);
      setName("");
      setPhone("");
      setSource("");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {initialTotal} lead{initialTotal !== 1 ? "s" : ""} in your pipeline
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add lead"}
        </Button>
      </div>

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="mb-8 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">New lead</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="lead-name">Name</Label>
              <Input
                id="lead-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lead-phone">Phone</Label>
              <Input
                id="lead-phone"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile"
                required
              />
            </div>
            <div>
              <Label>Lead type</Label>
              <Select
                value={leadType}
                onChange={(e) => setLeadType(e.target.value as LeadType)}
              >
                {LEAD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="lead-source">Source / notes</Label>
              <Input
                id="lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Referral, site visit, etc."
              />
            </div>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="mt-4" disabled={pending}>
            {pending ? "Saving…" : "Save lead"}
          </Button>
        </form>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          className="max-w-xs"
          placeholder="Search name or phone"
          defaultValue={initialSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              applyFilters({
                status: initialStatus,
                leadType: initialLeadType,
                search: (e.target as HTMLInputElement).value,
              });
            }
          }}
        />
        <Select
          value={initialStatus ?? "all"}
          onChange={(e) => {
            const v = e.target.value;
            applyFilters({
              status: v === "all" ? undefined : v,
              leadType: initialLeadType,
              search: initialSearch,
            });
          }}
          className="w-40"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select
          value={initialLeadType ?? "all"}
          onChange={(e) => {
            const v = e.target.value;
            applyFilters({
              status: initialStatus,
              leadType: v === "all" ? undefined : v,
              search: initialSearch,
            });
          }}
          className="w-44"
        >
          <option value="all">All types</option>
          {LEAD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl bg-card shadow-sm">
        {initialItems.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No leads yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Link
                      href={`/sales/leads/${lead.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {lead.name}
                    </Link>
                  </TableCell>
                  <TableCell>{lead.phoneNumber}</TableCell>
                  <TableCell className="capitalize">
                    {lead.leadType === "FLEET_PARTNER" ? "Fleet partner" : "Customer"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(lead.status)}>
                      {lead.status.charAt(0) + lead.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(lead.updatedAt).toLocaleDateString("en-IN")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

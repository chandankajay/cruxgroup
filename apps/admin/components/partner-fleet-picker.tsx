"use client";

import { Label } from "@repo/ui/label";

export type PartnerFleetOption = {
  id: string;
  label: string;
  partnerId: string;
  hourlyBase: number;
  dailyBase: number;
  category: string;
  catalogName: string | null;
  operatorPhone: string;
  operatorName: string;
  partnerBaseLocation: string | null;
};

interface PartnerFleetPickerProps {
  readonly options: PartnerFleetOption[];
  readonly value: string;
  readonly onChange: (equipmentId: string) => void;
  readonly disabled?: boolean;
  readonly id?: string;
}

export function PartnerFleetPicker({
  options,
  value,
  onChange,
  disabled,
  id = "equipmentId",
}: PartnerFleetPickerProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Machine / fleet row</Label>
      <select
        id={id}
        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select equipment…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function buildFleetPickerLabel(o: {
  catalogName: string | null;
  name: string;
  category: string;
  partnerBaseLocation: string | null;
  operatorName: string;
  operatorPhone: string;
}): string {
  const catalog = o.catalogName ?? o.category;
  const base = o.partnerBaseLocation ?? "—";
  const op = o.operatorName?.trim() || "Op";
  const phone = o.operatorPhone?.trim() || "—";
  return `${o.name} · ${catalog} · ${base} · ${op}: ${phone}`;
}

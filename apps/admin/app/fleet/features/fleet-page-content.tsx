"use client";

import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "../../equipment/features/delete-confirm-dialog";
import {
  deleteFleetItemAction,
  toggleFleetEquipmentActiveAction,
  type FleetEquipmentItem,
} from "../actions";
import type { KycStatus } from "@prisma/client";
import { FleetEquipmentCards } from "./fleet-equipment-cards";

interface FleetPageContentProps {
  readonly initialData: FleetEquipmentItem[];
  readonly partnerKycStatus: KycStatus | null;
}

export function FleetPageContent({ initialData, partnerKycStatus }: FleetPageContentProps) {
  const [items, setItems] = useState(initialData);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const partnerKycVerified = partnerKycStatus === "VERIFIED";
  const showKycBanner = partnerKycStatus !== "VERIFIED";

  const deletingItem = useMemo(
    () => items.find((i) => i.id === deleteId) ?? null,
    [items, deleteId]
  );

  const totalDailyRevenuePotential = useMemo(
    () => items.reduce((sum, i) => sum + i.pricing.daily, 0),
    [items]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const result = await deleteFleetItemAction(deleteId);

    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      toast.success("Equipment removed from fleet.");
    } else {
      toast.error(result.error ?? "Failed to delete.");
    }

    setIsDeleting(false);
    setDeleteId(null);
  }, [deleteId]);

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    const result = await toggleFleetEquipmentActiveAction(id, isActive);
    if (result.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive } : i)));
    } else {
      toast.error(result.error ?? "Could not update availability.");
    }
  }, []);

  return (
    <div>
      {showKycBanner && (
        <div
          className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-4 text-amber-950 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm leading-relaxed sm:max-w-2xl">
            Your fleet is safely saved, but hidden from customers. Complete your Trust Center KYC to
            start receiving bookings.
          </p>
          <Link
            href="/settings/kyc"
            className="inline-flex h-12 min-w-11 shrink-0 touch-manipulation select-none items-center justify-center rounded-xl border border-amber-700 bg-white px-4 text-sm font-semibold text-amber-950 shadow-sm active:bg-amber-100 lg:rounded-md lg:hover:bg-amber-100"
          >
            Go to Trust Center
          </Link>
        </div>
      )}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="select-none text-2xl font-semibold tracking-tight text-charcoal">My Fleet</h1>
          <p className="mt-1 text-sm text-zinc-600 lg:text-muted-foreground">
            Manage the equipment you offer for rent.
          </p>
        </div>
        <Link
          href="/fleet/new"
          className="inline-flex h-12 min-w-11 shrink-0 touch-manipulation select-none items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 text-sm font-semibold text-white shadow-sm active:bg-amber-600 lg:rounded-lg lg:hover:bg-amber-600"
        >
          + Add Equipment
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard
          label="Machines"
          value={items.length.toString()}
          icon="🏗️"
        />
        <StatCard
          label="Daily Revenue Potential"
          value={`₹${totalDailyRevenuePotential.toLocaleString("en-IN")}`}
          icon="💰"
        />
        <StatCard
          label="Categories"
          value={[...new Set(items.map((i) => i.category))].join(", ") || "—"}
          icon="📊"
        />
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm sm:p-6">
        <FleetEquipmentCards
          items={items}
          partnerKycVerified={partnerKycVerified}
          onToggleActive={handleToggleActive}
          onEdit={() => {}}
          onDelete={setDeleteId}
        />
      </div>

      <DeleteConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        equipmentName={deletingItem?.name ?? ""}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

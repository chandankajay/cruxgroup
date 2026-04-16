"use client";

import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { EquipmentTable } from "../../equipment/features/equipment-table";
import { EquipmentFormDialog } from "../../equipment/features/equipment-form-dialog";
import { DeleteConfirmDialog } from "../../equipment/features/delete-confirm-dialog";
import {
  createFleetItemAction,
  deleteFleetItemAction,
} from "../actions";
import type { EquipmentFormValues } from "../../equipment/schema";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { hourly: number; daily: number };
  images: string[];
  specifications: unknown;
}

interface FleetPageContentProps {
  readonly partnerId: string;
  readonly initialData: EquipmentItem[];
}

export function FleetPageContent({
  partnerId,
  initialData,
}: FleetPageContentProps) {
  const [items, setItems] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deletingItem = useMemo(
    () => items.find((i) => i.id === deleteId) ?? null,
    [items, deleteId]
  );

  const totalDailyRevenuePotential = useMemo(
    () => items.reduce((sum, i) => sum + i.pricing.daily, 0),
    [items]
  );

  const handleFormSubmit = useCallback(
    async (values: EquipmentFormValues) => {
      setIsSubmitting(true);

      const specs = values.specifications.trim()
        ? (JSON.parse(values.specifications) as Record<string, unknown>)
        : {};
      const images = values.imageUrl ? [values.imageUrl] : [];

      const result = await createFleetItemAction({
        name: values.name,
        category: values.category,
        subType: values.subType || undefined,
        hourlyRate: values.hourlyRate,
        dailyRate: values.dailyRate,
        images,
        specifications: specs,
        partnerId,
      });

      if (result.success) {
        toast.success("Equipment added to your fleet!");
        window.location.reload();
      } else {
        toast.error(result.error ?? "Failed to add equipment.");
      }

      setIsSubmitting(false);
      setFormOpen(false);
    },
    [partnerId]
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

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">My Fleet</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the equipment you offer for rent.
          </p>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600"
        >
          + Add Equipment
        </button>
      </div>

      {/* Summary strip */}
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

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm">
        <EquipmentTable
          items={items}
          onEdit={() => {}}
          onDelete={setDeleteId}
        />
      </div>

      <EquipmentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        equipment={null}
      />

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

"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@repo/ui/button";
import { EquipmentTable } from "./equipment-table";
import { EquipmentFormDialog } from "./equipment-form-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import {
  createEquipmentAction,
  updateEquipmentAction,
  deleteEquipmentAction,
} from "../actions";
import type { EquipmentFormValues } from "../schema";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { hourly: number; daily: number };
  images: string[];
  specifications: unknown;
}

interface EquipmentPageContentProps {
  readonly initialData: EquipmentItem[];
}

export function EquipmentPageContent({
  initialData,
}: EquipmentPageContentProps) {
  const [items, setItems] = useState(initialData);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editingItem = useMemo(
    () => items.find((i) => i.id === editingId) ?? null,
    [items, editingId]
  );

  const deletingItem = useMemo(
    () => items.find((i) => i.id === deleteId) ?? null,
    [items, deleteId]
  );

  function handleAdd() {
    setEditingId(null);
    setFormOpen(true);
  }

  function handleEdit(id: string) {
    setEditingId(id);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  const handleFormSubmit = useCallback(
    async (values: EquipmentFormValues) => {
      setIsSubmitting(true);

      const specs = values.specifications.trim()
        ? (JSON.parse(values.specifications) as Record<string, unknown>)
        : {};
      const images = values.imageUrl ? [values.imageUrl] : [];

      if (editingId) {
        const result = await updateEquipmentAction({
          id: editingId,
          name: values.name,
          category: values.category,
          subType: values.subType || undefined,
          hourlyRate: values.hourlyRate,
          dailyRate: values.dailyRate,
          images,
          specifications: specs,
        });

        if (result.success) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingId
                ? {
                    ...item,
                    name: values.name,
                    category: values.category,
                    subType: values.subType || null,
                    pricing: {
                      hourly: values.hourlyRate,
                      daily: values.dailyRate,
                    },
                    images,
                    specifications: specs,
                  }
                : item
            )
          );
        }
      } else {
        const result = await createEquipmentAction({
          name: values.name,
          category: values.category,
          subType: values.subType || undefined,
          hourlyRate: values.hourlyRate,
          dailyRate: values.dailyRate,
          images,
          specifications: specs,
        });

        if (result.success) {
          window.location.reload();
        }
      }

      setIsSubmitting(false);
      handleCloseForm();
    },
    [editingId]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    const result = await deleteEquipmentAction(deleteId);

    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
    }

    setIsDeleting(false);
    setDeleteId(null);
  }, [deleteId]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Equipment</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} machine{items.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button onClick={handleAdd}>+ Add Equipment</Button>
      </div>

      <div className="rounded-xl border border-border bg-background shadow-sm">
        <EquipmentTable
          items={items}
          onEdit={handleEdit}
          onDelete={setDeleteId}
        />
      </div>

      <EquipmentFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        equipment={editingItem}
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

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { equipmentFormSchema, type EquipmentFormValues } from "../schema";

interface EquipmentData {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { hourly: number; daily: number };
  images: string[];
  specifications: unknown;
}

interface EquipmentFormDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (values: EquipmentFormValues) => void;
  readonly isSubmitting: boolean;
  readonly equipment?: EquipmentData | null;
}

export function EquipmentFormDialog({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  equipment,
}: EquipmentFormDialogProps) {
  const isEditing = !!equipment;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      category: "JCB",
      subType: "",
      dailyRate: 0,
      hourlyRate: 0,
      imageUrl: "",
      specifications: "",
    },
  });

  useEffect(() => {
    if (equipment) {
      reset({
        name: equipment.name,
        category: equipment.category as EquipmentFormValues["category"],
        subType: equipment.subType ?? "",
        dailyRate: equipment.pricing.daily,
        hourlyRate: equipment.pricing.hourly,
        imageUrl: equipment.images[0] ?? "",
        specifications: JSON.stringify(equipment.specifications, null, 2),
      });
    } else {
      reset({
        name: "",
        category: "JCB",
        subType: "",
        dailyRate: 0,
        hourlyRate: 0,
        imageUrl: "",
        specifications: "",
      });
    }
  }, [equipment, reset]);

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? "Edit Equipment" : "Add Equipment"}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select id="category" {...register("category")}>
              <option value="JCB">JCB</option>
              <option value="Crane">Crane</option>
              <option value="Excavator">Excavator</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subType">Sub-type (optional)</Label>
            <Input id="subType" {...register("subType")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyRate">Daily Rate (₹)</Label>
            <Input
              id="dailyRate"
              type="number"
              {...register("dailyRate")}
            />
            {errors.dailyRate && (
              <p className="text-xs text-destructive">
                {errors.dailyRate.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
            <Input
              id="hourlyRate"
              type="number"
              {...register("hourlyRate")}
            />
            {errors.hourlyRate && (
              <p className="text-xs text-destructive">
                {errors.hourlyRate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" placeholder="https://..." {...register("imageUrl")} />
          {errors.imageUrl && (
            <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="specifications">Specifications (JSON)</Label>
          <Textarea
            id="specifications"
            rows={4}
            placeholder='{ "weight": "8 tonnes", "power": "76 HP" }'
            {...register("specifications")}
          />
          {errors.specifications && (
            <p className="text-xs text-destructive">
              {errors.specifications.message}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

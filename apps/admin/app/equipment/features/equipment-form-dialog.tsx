"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Drawer } from "vaul";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { equipmentFormSchema, type EquipmentFormValues } from "../schema";
import { useIsLgUp } from "../../lib/use-media-query";
import { cn } from "@repo/ui/lib/utils";

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
  const isLg = useIsLgUp();
  const useDrawer = isLg !== true;

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
        dailyRate: equipment.pricing.daily / 100,
        hourlyRate: equipment.pricing.hourly / 100,
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

  const id = (base: string) => (useDrawer ? base : `${base}-dlg`);

  const inputClass = cn(
    "touch-manipulation",
    useDrawer ? "h-12 rounded-xl" : "h-10 rounded-md"
  );

  const labelClass = useDrawer ? "text-zinc-300" : undefined;

  const formInner = (
    <>
      <div className="space-y-2">
        <Label htmlFor={id("name")} className={labelClass}>
          Name
        </Label>
        <Input id={id("name")} className={inputClass} {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={id("category")} className={labelClass}>
            Category
          </Label>
          <Select id={id("category")} className={inputClass} {...register("category")}>
            <option value="JCB">JCB</option>
            <option value="Crane">Crane</option>
            <option value="Excavator">Excavator</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={id("subType")} className={labelClass}>
            Sub-type (optional)
          </Label>
          <Input id={id("subType")} className={inputClass} {...register("subType")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={id("dailyRate")} className={labelClass}>
            Daily Rate (₹)
          </Label>
          <Input id={id("dailyRate")} type="number" className={inputClass} {...register("dailyRate")} />
          {errors.dailyRate && <p className="text-xs text-destructive">{errors.dailyRate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor={id("hourlyRate")} className={labelClass}>
            Hourly Rate (₹)
          </Label>
          <Input id={id("hourlyRate")} type="number" className={inputClass} {...register("hourlyRate")} />
          {errors.hourlyRate && <p className="text-xs text-destructive">{errors.hourlyRate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={id("imageUrl")} className={labelClass}>
          Image URL
        </Label>
        <Input id={id("imageUrl")} placeholder="https://..." className={inputClass} {...register("imageUrl")} />
        {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={id("specifications")} className={labelClass}>
          Specifications (JSON)
        </Label>
        <Textarea
          id={id("specifications")}
          rows={4}
          placeholder='{ "weight": "8 tonnes", "power": "76 HP" }'
          className={cn("touch-manipulation", useDrawer && "rounded-xl")}
          {...register("specifications")}
        />
        {errors.specifications && <p className="text-xs text-destructive">{errors.specifications.message}</p>}
      </div>
    </>
  );

  if (useDrawer) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) handleClose();
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[92vh] flex-col rounded-t-3xl bg-zinc-900 outline-none">
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-zinc-600" aria-hidden />
            <div className="min-h-0 flex-1 overflow-y-auto p-6 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <Drawer.Title className="text-lg font-semibold text-zinc-50">
                {isEditing ? "Edit Equipment" : "Add Equipment"}
              </Drawer.Title>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                {formInner}
                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 touch-manipulation rounded-xl border-zinc-600 bg-zinc-800 text-zinc-100"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-12 touch-manipulation rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : isEditing ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Equipment" : "Add Equipment"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formInner}
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

"use client";

import { Drawer } from "vaul";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";
import { useIsLgUp } from "../../lib/use-media-query";

interface DeleteConfirmDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly isDeleting: boolean;
  readonly equipmentName: string;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  equipmentName,
}: DeleteConfirmDialogProps) {
  const isLg = useIsLgUp();
  const useDrawer = isLg !== true;

  if (useDrawer) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={(next) => {
          if (!next) onClose();
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-50 bg-foreground/30" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border border-border bg-card p-6 text-card-foreground pb-[calc(1.5rem+env(safe-area-inset-bottom))] outline-none">
            <div className="mx-auto mb-5 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />
            <Drawer.Title className="text-lg font-semibold text-foreground">Delete Equipment</Drawer.Title>
            <p className="mt-4 text-sm text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{equipmentName}</strong>? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 touch-manipulation rounded-xl"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="button" variant="destructive" className="h-12 touch-manipulation rounded-xl" onClick={onConfirm} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <DialogTitle>Delete Equipment</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        Are you sure you want to delete <strong className="text-foreground">{equipmentName}</strong>? This action
        cannot be undone.
      </p>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}

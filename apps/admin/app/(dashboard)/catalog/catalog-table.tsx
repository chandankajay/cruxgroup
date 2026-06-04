"use client";

import { useRef, useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import {
  updateMasterCatalogImageAction,
  type CatalogRow,
} from "./actions";

function fmtInr(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

function CatalogCard({ row }: { row: CatalogRow }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));

    startTransition(async () => {
      const fd = new FormData();
      fd.append("catalogId", row.id);
      fd.append("image", file);
      const result = await updateMasterCatalogImageAction(fd);
      if (result.success) {
        toast.success(`Image updated for ${row.name}.`);
        setPreviewUrl(null);
      } else {
        toast.error(result.error);
        setPreviewUrl(null);
      }
    });
  }

  const displayUrl = previewUrl ?? row.imageUrl;

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={row.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}
        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-xs font-medium text-muted-foreground">
              Uploading…
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold text-charcoal">{row.name}</h3>
          <p className="text-xs text-muted-foreground">{row.category}</p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Hourly: {fmtInr(row.minHourlyRate)} – {fmtInr(row.maxHourlyRate)}
          </span>
          <span>
            Daily: {fmtInr(row.minDailyRate)} – {fmtInr(row.maxDailyRate)}
          </span>
        </div>

        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {row.imageUrl ? "Replace image" : "Upload image"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CatalogTable({ rows }: { rows: CatalogRow[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <CatalogCard key={row.id} row={row} />
      ))}
    </div>
  );
}

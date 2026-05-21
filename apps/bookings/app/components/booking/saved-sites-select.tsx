"use client";

import { useEffect, useState } from "react";
import { Label } from "@repo/ui/label";
import { Select } from "@repo/ui/select";
import { Button } from "@repo/ui/button";

export type SavedSiteOption = {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
  pincode: string;
};

interface SavedSitesSelectProps {
  readonly open: boolean;
  readonly selectedId: string | null;
  readonly onSelect: (site: SavedSiteOption | null) => void;
}

export function SavedSitesSelect({
  open,
  selectedId,
  onSelect,
}: SavedSitesSelectProps) {
  const [sites, setSites] = useState<SavedSiteOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    fetch("/api/saved-locations")
      .then((r) => r.json())
      .then((data: { locations?: SavedSiteOption[] }) => {
        if (cancelled) return;
        setSites(Array.isArray(data.locations) ? data.locations : []);
      })
      .catch(() => {
        if (!cancelled) setSites([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!loading && sites.length === 0) {
    return null;
  }

  const displayLabel = (s: SavedSiteOption) => {
    const base = s.label.trim() || s.address;
    return base.length > 64 ? `${base.slice(0, 64)}…` : base;
  };

  const selectValue = selectedId ?? "__map__";

  return (
    <div className="space-y-2">
      <Label className="block" htmlFor="saved-sites-select">
        Select from saved sites
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          id="saved-sites-select"
          disabled={loading}
          className="flex-1"
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "__map__") {
              onSelect(null);
              return;
            }
            const site = sites.find((s) => s.id === v);
            onSelect(site ?? null);
          }}
        >
          <option value="__map__">
            {loading ? "Loading saved sites…" : "Enter address on map"}
          </option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {displayLabel(s)}
            </option>
          ))}
        </Select>
        {selectedId ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onSelect(null)}>
            Use map instead
          </Button>
        ) : null}
      </div>
    </div>
  );
}

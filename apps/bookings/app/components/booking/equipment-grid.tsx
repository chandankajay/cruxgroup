"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@repo/ui/input";
import { useLabels } from "@repo/ui/dictionary-provider";
import { EquipmentCard } from "./equipment-card";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { daily: number };
  images: string[];
  specifications: Record<string, unknown>;
}

interface EquipmentGridProps {
  readonly items: EquipmentItem[];
  readonly onSelect: (id: string) => void;
}

export function EquipmentGrid({ items, onSelect }: EquipmentGridProps) {
  const t = useLabels();
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      `${item.name} ${item.category}`.toLowerCase().includes(normalizedQuery)
    );
  }, [items, query]);

  const searchPlaceholderLabel = t("SEARCH_FILTER_PLACEHOLDER");
  const searchPlaceholder =
    searchPlaceholderLabel === "SEARCH_FILTER_PLACEHOLDER"
      ? "Search by equipment name or category"
      : searchPlaceholderLabel;

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        {t("NO_EQUIPMENT")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-background p-3 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg px-4 py-2 pl-10"
        />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No equipment matches your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <EquipmentCard
              key={item.id}
              id={item.id}
              name={item.name}
              category={item.category}
              subType={item.subType}
              dailyRate={item.pricing.daily}
              image={item.images[0]}
              specifications={item.specifications as Record<string, unknown>}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

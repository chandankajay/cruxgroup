"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useLabels } from "@repo/ui/dictionary-provider";
import { EquipmentCard } from "./equipment-card";
import type { NearbyEquipmentItem } from "@repo/api";

interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  subType?: string | null;
  pricing: { daily: number; hourly?: number };
  images: string[];
  specifications: Record<string, unknown>;
  priceRange?: {
    minDaily: number;
    maxDaily: number;
    minHourly: number;
    maxHourly: number;
  };
  partnerCount: number;
  partners: NearbyEquipmentItem["partners"];
}

interface EquipmentGridProps {
  readonly items: EquipmentItem[];
  readonly onSelect: (
    id: string,
    partner?: {
      equipmentId: string;
      partnerId: string;
      dailyRate: number;
      hourlyRate: number;
    }
  ) => void;
  readonly locationAware?: boolean;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

export function EquipmentGrid({ items, onSelect, locationAware }: EquipmentGridProps) {
  const t = useLabels();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
      <p
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "#94a3b8",
        }}
      >
        {t("NO_EQUIPMENT")}
      </p>
    );
  }

  return (
    <div>
      {/* Search bar */}
      <div style={{ padding: "20px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#f8f9fa",
            border: searchFocused
              ? "1.5px solid #d45800"
              : "1.5px solid #e2e8f0",
            borderRadius: 12,
            padding: "0 16px",
            height: 50,
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: searchFocused
              ? "0 0 0 3px rgba(212,88,0,0.1)"
              : "none",
          }}
        >
          <Search
            size={18}
            color="#94a3b8"
            style={{ flexShrink: 0 }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
              color: "#0f172a",
              fontSize: "0.95rem",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <p
          style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#94a3b8",
          }}
        >
          No equipment matches your search.
        </p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={locationAware ? "nearby" : "all"}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
            padding: "20px 24px",
          }}
        >
          {filteredItems.map((item) => (
            <motion.div key={item.id} variants={cardVariants}>
              <EquipmentCard
                id={item.id}
                name={item.name}
                category={item.category}
                subType={item.subType}
                hourlyRate={item.pricing.hourly ?? item.priceRange?.minHourly ?? 0}
                image={item.images[0]}
                specifications={item.specifications}
                onSelect={onSelect}
                priceRange={item.priceRange}
                partnerCount={item.partnerCount}
                partners={item.partners}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

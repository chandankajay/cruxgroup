"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { useLabels } from "@repo/ui/dictionary-provider";

interface EquipmentCardProps {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly subType?: string | null;
  readonly dailyRate: number;
  readonly image?: string;
  readonly specifications: Record<string, unknown>;
  readonly onSelect: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function EquipmentCard({
  id,
  name,
  category,
  subType,
  dailyRate,
  image,
  specifications,
  onSelect,
}: EquipmentCardProps) {
  const t = useLabels();
  const [imgError, setImgError] = useState(false);

  function handleSelect() {
    onSelect(id);
  }

  const showImage = image && !imgError;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-48 w-full bg-muted">
        {showImage ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-brand-orange/10">
            <span className="text-3xl font-bold text-brand-orange">
              {getInitials(name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-brand-navy">{name}</h3>
          <Badge variant="secondary" className="shrink-0 p-1">
            {category}
          </Badge>
        </div>
        {subType && (
          <Badge variant="outline" className="w-fit p-1">{subType}</Badge>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {Object.entries(specifications)
            .filter(([key]) => key !== "imageUrl" && key !== "description")
            .slice(0, 3)
            .map(([key, val]) => (
              <span key={key}>
                {key}: <strong>{String(val)}</strong>
              </span>
            ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-lg font-bold text-brand-orange">
            ₹{(dailyRate / 100).toLocaleString("en-IN")}
            <span className="text-sm font-normal text-muted-foreground">
              {t("EQUIPMENT_PER_DAY")}
            </span>
          </p>
          <Button
            size="sm"
            className="cursor-pointer rounded-full bg-[#F97316] font-bold text-white hover:bg-[#EA580C]"
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
          >
            {t("EQUIPMENT_BOOK_NOW")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

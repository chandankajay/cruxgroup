"use client";

import { useState } from "react";
import Image from "next/image";
import { useLabels } from "@repo/ui/dictionary-provider";
import type { NearbyEquipmentItem } from "@repo/api";

interface EquipmentCardProps {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly subType?: string | null;
  readonly hourlyRate: number;
  readonly image?: string;
  readonly specifications: Record<string, unknown>;
  readonly onSelect: (
    id: string,
    partner?: {
      equipmentId: string;
      partnerId: string;
      dailyRate: number;
      hourlyRate: number;
    }
  ) => void;
  readonly priceRange?: {
    minDaily: number;
    maxDaily: number;
    minHourly: number;
    maxHourly: number;
  };
  readonly partnerCount: number;
  readonly partners: NearbyEquipmentItem["partners"];
}

const CATEGORY_ICONS: Record<string, string> = {
  Crane: "\u{1F3D7}\u{FE0F}",
  JCB: "\u{1F69C}",
  Excavator: "\u{26CF}\u{FE0F}",
  Dozer: "\u{1F6A7}",
  Harvester: "\u{1F33E}",
  Agriculture: "\u{1F33E}",
  Earthmoving: "\u{1F69C}",
};

const SPEC_LABELS: Record<string, string> = {
  liftingCapacity: "Lifting",
  boomLength: "Boom",
  power: "Power",
  bladeCapacity: "Blade",
  trackType: "Track",
  cutterBarWidth: "Cutter",
  grainTank: "Grain Tank",
  bucketCapacity: "Bucket",
  maxDepth: "Max Depth",
  operatingWeight: "Weight",
};

function formatPaise(paise: number): string {
  return (paise / 100).toLocaleString("en-IN");
}

export function EquipmentCard({
  id,
  name,
  category,
  subType,
  hourlyRate,
  image,
  specifications,
  onSelect,
  priceRange,
  partnerCount,
  partners,
}: EquipmentCardProps) {
  const t = useLabels();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const showImage = image && !imgError;
  const emoji = CATEGORY_ICONS[category] ?? "\u{1F3D7}\u{FE0F}";

  const specs = Object.entries(specifications)
    .filter(([key]) => key !== "imageUrl" && key !== "description")
    .slice(0, 3);

  const hasRange =
    priceRange &&
    priceRange.minHourly !== priceRange.maxHourly;

  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (partners.length > 0) {
      const cheapest = [...partners].sort((a, b) => a.hourlyRate - b.hourlyRate)[0]!;
      onSelect(id, {
        equipmentId: cheapest.equipmentId,
        partnerId: cheapest.partnerId,
        dailyRate: cheapest.dailyRate,
        hourlyRate: cheapest.hourlyRate,
      });
    } else {
      onSelect(id);
    }
  };

  return (
    <div
      onClick={handleBook}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 180,
          position: "relative",
          backgroundColor: "#f1f5f9",
          overflow: "hidden",
        }}
      >
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
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>{emoji}</span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Category badge overlaying image */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#1d6fa4",
            border: "1px solid rgba(29,111,164,0.2)",
          }}
        >
          {category}
        </span>

        {/* Partner count badge */}
        {partnerCount > 1 && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "rgba(212,88,0,0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: 20,
              padding: "3px 10px",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            {partnerCount} providers
          </span>
        )}
      </div>

      {/* Card body */}
      <div
        style={{
          padding: "14px 16px 16px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Name */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {name}
        </h3>

        {/* SubType badge */}
        {subType && (
          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              fontSize: "0.72rem",
              backgroundColor: "#e8f2fa",
              color: "#1d6fa4",
              borderRadius: 6,
              padding: "2px 8px",
              fontWeight: 500,
              marginBottom: 8,
            }}
          >
            {subType}
          </span>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {specs.map(([key, val]) => (
              <span
                key={key}
                style={{
                  fontSize: "0.72rem",
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontWeight: 500,
                }}
              >
                {SPEC_LABELS[key] ?? key}:{" "}
                <strong style={{ color: "#0f172a" }}>{String(val)}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Price + Book Now */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
          }}
        >
          <div>
            {hasRange ? (
              <>
                <span
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "#d45800",
                  }}
                >
                  ₹{formatPaise(priceRange.minHourly)} – ₹
                  {formatPaise(priceRange.maxHourly)}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    fontWeight: 400,
                  }}
                >
                  {t("EQUIPMENT_PER_HOUR")}
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "#d45800",
                  }}
                >
                  ₹{formatPaise(hourlyRate)}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#94a3b8",
                    fontWeight: 400,
                  }}
                >
                  {t("EQUIPMENT_PER_HOUR")}
                </span>
              </>
            )}
          </div>
          <button
            onClick={handleBook}
            style={{
              backgroundColor: "#d45800",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#b84a00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#d45800";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {t("EQUIPMENT_BOOK_NOW")}
          </button>
        </div>
      </div>
    </div>
  );
}

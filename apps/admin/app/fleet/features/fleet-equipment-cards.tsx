"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Badge } from "@repo/ui/badge";
import { Button, buttonVariants } from "@repo/ui/button";
import { Card, CardContent, CardFooter } from "@repo/ui/card";
import { Switch } from "@repo/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
import { cn } from "@repo/ui/lib/utils";
import type { FleetEquipmentItem } from "../actions";

const KYC_LOCK_TOOLTIP = "Complete KYC verification to activate this machine.";

interface FleetEquipmentCardsProps {
  readonly items: FleetEquipmentItem[];
  readonly partnerKycVerified: boolean;
  readonly onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  readonly onDelete: (id: string) => void;
}

export function FleetEquipmentCards({
  items,
  partnerKycVerified,
  onToggleActive,
  onDelete,
}: FleetEquipmentCardsProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleCheckedChange = useCallback(
    async (id: string, checked: boolean) => {
      setPendingId(id);
      await onToggleActive(id, checked);
      setPendingId(null);
    },
    [onToggleActive]
  );

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No equipment found. Add your first machine.
      </p>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const locked = !partnerKycVerified;
          const imageUrl = item.images[0] ?? null;
          return (
            <Card
              key={item.id}
              className={cn(
                "relative overflow-hidden transition-opacity",
                locked && "border-amber-500/50 bg-gray-50/80 opacity-60"
              )}
            >
              {locked && (
                <Badge
                  variant="outline"
                  className="absolute right-3 top-3 z-10 border-amber-500 bg-amber-50 font-semibold text-amber-900 shadow-sm"
                >
                  Locked: Pending KYC
                </Badge>
              )}
              <div className="relative aspect-[16/10] w-full bg-muted">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- dynamic catalog / blob URLs
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">
                    🏗️
                  </div>
                )}
              </div>
              <CardContent className="space-y-2 pt-4">
                <h2 className="pr-24 font-semibold leading-tight text-charcoal">{item.name}</h2>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{item.category}</Badge>
                  {item.subType && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {item.subType}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-charcoal">₹{(item.pricing.daily / 100).toLocaleString("en-IN")}</span>
                  {" / day · "}
                  <span className="font-medium text-charcoal">₹{(item.pricing.hourly / 100).toLocaleString("en-IN")}</span>
                  {" / hr"}
                </p>
                <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Availability
                    </p>
                    <p className="text-sm font-medium text-charcoal">
                      {item.isActive ? "Active" : "In-Maintenance"}
                    </p>
                  </div>
                  {locked ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex shrink-0 cursor-not-allowed rounded-md">
                          <Switch checked={item.isActive} disabled aria-label="Availability locked until KYC" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{KYC_LOCK_TOOLTIP}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Switch
                      checked={item.isActive}
                      disabled={pendingId === item.id}
                      onCheckedChange={(checked) => void handleCheckedChange(item.id, checked)}
                      aria-label={item.isActive ? "Set in maintenance" : "Set active"}
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t border-border bg-muted/30 py-3">
                <Link
                  href={`/fleet/${item.id}/edit`}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: "outline",
                    }),
                    "inline-flex h-12 min-w-11 touch-manipulation rounded-xl sm:h-9 sm:rounded-md"
                  )}
                >
                  Edit
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  type="button"
                  className="h-12 min-w-11 touch-manipulation rounded-xl sm:h-9 sm:rounded-md"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

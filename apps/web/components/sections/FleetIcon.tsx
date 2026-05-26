"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowBigUp,
  Building2,
  CircleDot,
  Construction,
  Drill,
  Hammer,
  Layers,
  Pickaxe,
  Tractor,
  Truck,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Tractor,
  Building2,
  ArrowBigUp,
  Pickaxe,
  Truck,
  CircleDot,
  Drill,
  Layers,
  Hammer,
  Construction,
};

export function FleetIcon({
  name,
  className,
}: {
  readonly name: string | null | undefined;
  readonly className?: string;
}): React.ReactElement {
  const Icon = (name && ICONS[name]) || Hammer;
  return <Icon className={className} aria-hidden />;
}

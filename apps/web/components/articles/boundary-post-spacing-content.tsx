"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "spacing-standards",
    title: "Standard Post Spacing Intervals",
    summary:
      "Post spacing drives hole count, auger hire duration, and wind load per panel. These intervals assume level ground and standard Telangana wind Zone II unless noted.",
    specs: [
      { label: "Chain-link / UPVC wire", value: "2.5–3.0 m c/c; strainer posts at corners and every 30–40 m" },
      { label: "Corrugated MS sheet", value: "2.0–2.5 m c/c; reduce to 2.0 m on NH44 frontage with gust exposure" },
      { label: "Precast H-column", value: "2.0–2.5 m c/c aligned with plank length (typically 2.0 m modules)" },
      { label: "Corner posts", value: "Heavy section — 200 mm × 200 mm RCC minimum; diagonal bracing on chain-link corners" },
      { label: "Gate posts", value: "Double the foundation depth of line posts; M30 grade minimum for openings > 4 m" },
    ],
    applications: [
      "NIMZ industrial plots with 500 m+ perimeter — spacing errors multiply hole count",
      "Residential layout boundaries — uniform spacing required for precast plank alignment",
      "Farm fencing on undulating terrain — allow step adjustment ±150 mm between posts",
    ],
  },
  {
    id: "hole-dimensions",
    title: "Hole Diameter & Auger Selection",
    summary:
      "Hole diameter must accommodate post section plus concrete cover. Undersized holes cause post plumb errors and weak foundations.",
    specs: [
      { label: "150 mm × 150 mm RCC post", value: "Auger Ø 300 mm; minimum 75 mm concrete cover on all faces" },
      { label: "200 mm × 200 mm RCC post", value: "Auger Ø 375–450 mm" },
      { label: "Precast H-column", value: "Pad footing or strip footing — individual bore Ø 450 mm × 600 mm deep typical" },
      { label: "Auger hire spec", value: "12-inch (300 mm) auger for standard posts; 15-inch for heavy gate posts" },
      { label: "Hole verticality", value: "Max deviation 1:100 — tractor-mounted augers need skilled operator on hard laterite" },
    ],
    notes: [
      "For a 40×60 m plot boundary (~200 m perimeter) at 2.5 m spacing, expect ~80 line holes plus 4 corner/gate posts — specify this count when booking a post hole digger.",
    ],
  },
  {
    id: "embedment-depth",
    title: "Foundation Depth & Embedment Ratios",
    summary:
      "Embedment depth below ground level is the primary variable across soil types. These depths assume unsupported height of 2.4 m above ground.",
    specs: [
      { label: "Alluvial soil (Hyderabad periphery)", value: "600–750 mm embedment; PCC (1:4:8) backfill to 150 mm below GL" },
      { label: "Laterite (Ranga Reddy west, Mahbubnagar)", value: "750–900 mm embedment; roughen bore walls before concreting" },
      { label: "Black cotton soil", value: "900 mm minimum; widen bore to 375 mm; consider sand cushion at base" },
      { label: "Soft / waterlogged", value: "900–1200 mm; compacted gravel plug 200 mm at base before RCC" },
      { label: "Embedment ratio rule", value: "Minimum 1:4 (embedment : exposed height) for standard loads; 1:3 for gate posts" },
    ],
    applications: [
      "Shadnagar NIMZ plots — laterite common; default to 900 mm unless soil test says otherwise",
      "ORR corridor layouts on filled ground — treat as soft soil regardless of surface appearance",
    ],
  },
  {
    id: "concrete-grades",
    title: "Concrete Grades & Reinforcement",
    summary:
      "Post concrete must match exposure and load. M20 is acceptable for standard line posts; gate zones and wind-exposed frontages need M30.",
    specs: [
      { label: "Line posts (standard)", value: "M20 (20 MPa); Fe 500D, 4×12 mm longitudinal; stirrups @ 150 mm" },
      { label: "Gate & corner posts", value: "M30 (30 MPa); 6×12 mm longitudinal; stirrups @ 100 mm" },
      { label: "PCC backfill", value: "1:4:8 or 1:5:10; compact in 150 mm layers; cure 7 days before post load" },
      { label: "Cast-in-place vs precast", value: "Cast-in-place in bore for RCC posts; precast H-columns sit on pad footings" },
      { label: "Curing", value: "Minimum 14 days before mesh or sheet tensioning; 21 days before full wind load" },
    ],
    notes: [
      "Do not tension chain-link or MS sheets before concrete reaches 70% design strength — premature loading cracks green concrete at bore interface.",
    ],
  },
];

export function BoundaryPostSpacingContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Foundations"
      title="Boundary Post Spacing & Foundation Depth: Engineering Reference"
      intro="Uniform post spacing and correct foundation depth determine whether a compound wall survives its first monsoon without leaning or cracking. This reference consolidates the spacing intervals, auger sizes, embedment depths, and concrete grades we specify on Telangana industrial and layout sites — use it to plan hole counts before mobilising equipment."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("boundary-post-spacing-foundations")}
      whatsappTopic="boundary post spacing and foundations"
      jumpNavLabel="Jump to topic"
      equipmentLinks={[
        { href: `/${locale}/equipment/posthole`, label: "Post hole digger hire" },
        { href: `/${locale}/articles/post-hole-digger-uses-telangana`, label: "Auger use cases in Telangana" },
      ]}
    />
  );
}

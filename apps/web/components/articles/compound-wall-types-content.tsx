"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "chain-link",
    title: "Type 1: RCC Posts with Chain-Link Mesh",
    summary:
      "Best when you need deterrence and visibility without full screening. Common on agricultural plots, storage yards, and semi-urban boundaries where CCTV and patrols supplement the fence line.",
    specs: [
      { label: "Security level", value: "Moderate — deters casual entry; climbable without topping wire" },
      { label: "Visibility", value: "High — open mesh allows surveillance sightlines" },
      { label: "Wind load", value: "Low permeability loss; suitable for open NH44 corridors with M30 posts" },
      { label: "Install speed", value: "Fast after pole holes are drilled — mesh unrolls between posts" },
      { label: "Maintenance", value: "Mesh tension checks every 2–3 years; GI re-galvanising in coastal zones" },
      { label: "Terrain fit", value: "Alluvial and laterite with auger foundations; rocky sites need doweling" },
    ],
    applications: [
      "Farm and orchard boundaries in Mahbubnagar and Vikarabad districts",
      "Industrial storage yards in NIMZ Shadnagar where inventory visibility matters",
      "Temporary demarcation during phased factory construction",
    ],
    notes: [
      "Not ideal as the sole security layer for high-value pharma or electronics units — pair with MS sheet or precast on the road frontage.",
    ],
  },
  {
    id: "ms-sheet",
    title: "Type 2: Concrete Posts with Corrugated MS Sheets",
    summary:
      "Solid-screen boundary for factories, warehouses, and highway-front plots. Blocks sightlines, increases wind load on posts, and requires gauge and stiffener design per IS 875.",
    specs: [
      { label: "Security level", value: "Medium-high — solid infill; anti-climb height extensions available" },
      { label: "Visibility", value: "None through panel — gate and CCTV become primary monitoring points" },
      { label: "Wind load", value: "High — design stiffeners at 1.0 m intervals in Zone II/III; heavier posts at 2.0 m c/c" },
      { label: "Install speed", value: "Moderate — bolt-on runner systems allow phased panel installation" },
      { label: "Maintenance", value: "Coating inspection every 5 years; sheet replacement without post removal" },
      { label: "Terrain fit", value: "Flat to gently sloping industrial plots; plinth needed on black cotton soil" },
    ],
    applications: [
      "Logistics parks along ORR and NH44 frontage",
      "Pharma and food-processing units requiring visual screening",
      "Warehouse compounds in Kothur and Shamshabad logistics belt",
    ],
    notes: [
      "Specify rust-prevention coating system at procurement — skimping on primer in Telangana humidity leads to panel replacement within 8–10 years.",
    ],
  },
  {
    id: "precast",
    title: "Type 3: Precast H-Column Concrete Walls",
    summary:
      "Permanent industrial boundary with M40-grade planks, interlocking H-columns, and minimal ongoing maintenance. Highest upfront coordination (crane access, delivery sequence) but lowest lifecycle cost for 20+ year horizons.",
    specs: [
      { label: "Security level", value: "High — 2.4–3.0 m monolithic wall; difficult to breach without power tools" },
      { label: "Visibility", value: "Solid — same sightline constraints as MS sheet" },
      { label: "Wind load", value: "Low panel drag; mass provides stability — design footings for overturning" },
      { label: "Install speed", value: "Fast on site once footings cure — 100–150 m per day with crane crew" },
      { label: "Maintenance", value: "Joint sealant inspection every 5–7 years; no repainting cycle" },
      { label: "Terrain fit", value: "Requires levelled strip footing; rocky sites need pad footings or grade beam" },
    ],
    applications: [
      "NIMZ factory plots with permanent boundary requirements",
      "Utility substations and institutional campuses",
      "Substations and telecom switching yards",
    ],
    notes: [
      "Crane access along the full boundary line is mandatory — plan laydown zones before ordering planks.",
    ],
  },
  {
    id: "upvc-wire",
    title: "Type 4: UPVC-Coated Wire with RCC or MS Poles",
    summary:
      "Modern aesthetic perimeter for farmhouses, nurseries, and landscaped compounds. UV-stable coating outperforms bare GI in Telangana's intense sun and monsoon cycles without the mass of a solid wall.",
    specs: [
      { label: "Security level", value: "Low-moderate — same climb profile as chain-link" },
      { label: "Visibility", value: "Partial — green or brown wire blends with landscaping" },
      { label: "Wind load", value: "Low — similar to chain-link with lighter visual profile" },
      { label: "Install speed", value: "Fastest wire system — tension strainers every 30–40 m" },
      { label: "Maintenance", value: "Minimal — no zinc bloom; inspect strainer hardware annually" },
      { label: "Terrain fit", value: "Excellent on undulating farm plots; follows grade with stepped posts" },
    ],
    applications: [
      "Agri-tourism and farmhouse compounds in Chevella and Shankarpally belt",
      "Internal subdivision within larger secured campuses",
      "Nursery and horticulture plots where aesthetics matter",
    ],
    notes: [
      "Do not specify UPVC wire as the primary boundary for high-security industrial plots — use on rear and side lines only if frontage is MS or precast.",
    ],
  },
  {
    id: "selection-matrix",
    title: "Quick Selection Matrix",
    summary:
      "Use this matrix to narrow options before a site survey. Final specification depends on soil investigation, wind zone, and client security classification.",
    bullets: [
      "Need visibility for patrols/CCTV → chain-link or UPVC wire",
      "Highway frontage with gust loads → MS sheet or precast with wind-designed footings",
      "Permanent factory boundary, 20+ year horizon → precast H-column",
      "Rocky laterite (common in Ranga Reddy west) → avoid shallow auger-only designs; see doweling guide",
      "Farm plot, aesthetics priority → UPVC wire on RCC posts",
      "Phased construction, panel replacement likely → MS bolt-on runner system",
    ],
    notes: [
      "For material grades, dimensions, and foundation methods on each type, see the detailed specification guide in this library.",
    ],
  },
];

export function CompoundWallTypesContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Decision Guide"
      title="Compound Wall Types Compared: RCC, Precast, MS Sheet & Chain-Link"
      intro="Before specifying a boundary system for an industrial plot in Shadnagar, a farm in Mahbubnagar, or a layout in Tukkuguda, engineers weigh security class, wind exposure, soil bearing capacity, and maintenance horizon. This guide compares the four compound wall families we see most often across Telangana — without prescribing a single winner. The right system is the one that matches your terrain and how long the boundary must last."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("compound-wall-types-compared")}
      whatsappTopic="compound wall selection for my plot"
      jumpNavLabel="Compare wall types"
      equipmentLinks={[
        { href: `/${locale}/equipment/posthole`, label: "Post hole digger hire" },
        { href: `/${locale}/articles/boundary-post-spacing-foundations`, label: "Post spacing reference" },
      ]}
    />
  );
}

"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "rcc-chain-link",
    title: "Solution A: RCC Posts with Chain-Link Mesh",
    summary:
      "A proven perimeter system combining reinforced cement concrete (RCC) posts with galvanized iron (GI) chain-link mesh. Ideal for agricultural plots, industrial yards, and semi-urban boundaries where visibility and deterrence are required without full solid screening.",
    specs: [
      { label: "Concrete grade", value: "M20 (20 MPa) for standard loads; M30 (30 MPa) for high wind or heavy-gate zones" },
      { label: "Post section", value: "150 mm × 150 mm square RCC or pre-stressed poles, 2.4–3.0 m above ground" },
      { label: "Reinforcement", value: "Fe 500D TMT bars, 4–6 nos. longitudinal; stirrups @ 150 mm c/c" },
      { label: "Mesh", value: "Tata Wiron GI chain-link, 12-gauge (2.5 mm wire), 50 mm × 50 mm diamond aperture" },
      { label: "Tensile strength", value: "GI wire min. 450 MPa; mesh selvedge wire 13-gauge for edge reinforcement" },
      { label: "Coating", value: "Hot-dip galvanized to IS 2721; optional PVC coating for coastal or high-humidity zones" },
      { label: "Post spacing", value: "2.5–3.0 m c/c depending on terrain and wind exposure" },
      { label: "Foundation depth", value: "600–900 mm in normal soil; increased for soft or waterlogged strata" },
    ],
    applications: [
      "Open farmland and orchard boundaries with moderate security needs",
      "Industrial storage yards requiring visibility for surveillance",
      "Semi-urban plots along wind-exposed corridors (M30 posts recommended)",
      "Rocky or laterite terrain using doweling or auger-PCC foundations",
    ],
    notes: [
      "Standard foundation: auger bore Ø 300 mm, PCC (1:4:8) backfill to 150 mm below ground level, RCC post cast-in-place or grouted.",
      "Doweling method (rocky terrain): drill Ø 40–50 mm × 400 mm deep into bedrock, epoxy-grout Fe 500D dowels (16 mm dia.), cast 300 mm × 300 mm RCC pedestal (M30) before post erection.",
    ],
  },
  {
    id: "concrete-ms-sheets",
    title: "Solution B: Concrete Posts with Corrugated MS Sheets",
    summary:
      "A solid-screen perimeter using RCC or precast concrete posts with corrugated mild steel (MS) sheet infill. Delivers higher privacy and wind resistance than mesh systems, suited to factories, warehouses, and compound walls along highways.",
    specs: [
      { label: "Post system", value: "Heavy-duty slotted RCC posts (200 mm × 200 mm) or bolt-on runner channels at 2.0–2.5 m c/c" },
      { label: "Sheet gauge", value: "Corrugated MS sheets, 0.45–0.60 mm (18–22 gauge) depending on span and wind zone" },
      { label: "Yield strength", value: "MS sheets to IS 513, min. 240 MPa yield; structural grade for spans > 1.2 m" },
      { label: "Wind load design", value: "Designed per IS 875 (Part 3); stiffener angles at 1.0 m vertical intervals in Zone II/III" },
      { label: "Fixing", value: "Self-drilling screws (SS 304) or M8 bolt-on runner with neoprene washers" },
      { label: "Rust prevention", value: "Alkyd primer + epoxy intermediate + PU topcoat; or hot-dip galvanized sheets with 80 μm min. coating" },
      { label: "Effective height", value: "2.4–3.6 m typical; anti-climb cap extension optional" },
      { label: "Base treatment", value: "Bituminous coat or cement plinth (150 mm) to prevent capillary rise at sheet base" },
    ],
    applications: [
      "Manufacturing units and logistics parks requiring visual screening",
      "Highway-adjacent boundaries subject to gust loads",
      "Sites needing rapid erection with bolt-on sheet replacement",
      "Medium-security compounds where solid infill deters intrusion",
    ],
    notes: [
      "Runner systems allow sheet replacement without disturbing posts — useful for phased industrial expansion.",
      "Provide weep holes or ventilation gaps at sheet base in humid climates to reduce trapped moisture behind panels.",
    ],
  },
  {
    id: "precast-walls",
    title: "Solution C: Precast Concrete Walls",
    summary:
      "Factory-cast H-column and plank systems forming a monolithic, zero-maintenance boundary. Compressive strength and dimensional accuracy make this the preferred choice for permanent industrial and institutional perimeters.",
    specs: [
      { label: "System type", value: "Interlocking H-column (precast) with tongue-and-groove concrete planks" },
      { label: "Plank dimensions", value: "Typical 500 mm (H) × 150–200 mm (T) × 2.0–2.5 m (L); custom lengths available" },
      { label: "Compressive strength", value: "Min. 40 MPa at 28 days (M40 grade concrete, controlled batching)" },
      { label: "Column section", value: "H-column 200 mm × 200 mm web; interlock pocket for plank seating" },
      { label: "Reinforcement", value: "Fe 500D; plank prestress or conventional RC per span" },
      { label: "Surface finish", value: "Steel-trowelled or shot-blasted; optional pigment integral colour" },
      { label: "Foundation", value: "Continuous PCC (1:4:8) strip footing 450 mm wide × 300 mm deep, or individual pad footings @ 2.5 m" },
      { label: "Joint treatment", value: "Dry interlock + flexible sealant at exposed joints; no wet masonry required" },
    ],
    applications: [
      "Permanent industrial plant boundaries with 25+ year design life",
      "Institutional campuses and utility substations",
      "Noise-sensitive zones when combined with absorptive cap layers",
      "Sites demanding fire resistance and minimal ongoing maintenance",
    ],
    notes: [
      "Precast delivery requires crane access along the boundary line — plan laydown and erection sequence before ordering.",
      "Zero-maintenance refers to structural elements; periodic joint sealant inspection is recommended every 5–7 years.",
    ],
  },
  {
    id: "upvc-wired",
    title: "Solution D: UPVC Wired Compound with Poles",
    summary:
      "A modern aesthetic perimeter combining UPVC-coated wire with RCC or MS poles. Offers superior UV and corrosion resistance compared to standard GI wire, with clean sightlines suitable for residential farmhouses, nurseries, and landscaped compounds.",
    specs: [
      { label: "Wire coating", value: "UPVC extruded over high-tensile steel core, 2.0–2.5 mm overall diameter" },
      { label: "Tensile strength", value: "Core wire min. 1,200 MPa (high-tensile); UPVC sheath 0.4–0.6 mm wall thickness" },
      { label: "UV resistance", value: "UPVC stabilised to ASTM G154; colour retention 10+ years in tropical exposure" },
      { label: "Pole options", value: "RCC 100 mm × 100 mm, MS powder-coated tubular, or composite FRP for coastal sites" },
      { label: "Mesh aperture", value: "75 mm × 75 mm or 100 mm × 100 mm square grid, crimped knot construction" },
      { label: "Post spacing", value: "2.0–2.5 m c/c; tensioning strainer posts every 30–40 m and at corners" },
      { label: "Weatherproofing", value: "Non-hygroscopic UPVC; no zinc-oxide bloom or white rust as with bare GI" },
      { label: "Colour range", value: "Green, black, or brown — blends with landscaping without repainting cycles" },
    ],
    applications: [
      "Farmhouses, nurseries, and agri-tourism properties prioritising aesthetics",
      "Coastal and high-rainfall districts where GI corrosion is accelerated",
      "Internal subdivision fencing within larger secured campuses",
      "Low-to-medium security perimeters with quick installation timelines",
    ],
    notes: [
      "Strainer assemblies (turnbuckles or ratchet tensioners) are critical — specify galvanised hardware rated for wire breaking load.",
      "UPVC wire is not a substitute for anti-climb solid walls on high-security sites; pair with topping wire or CCTV as required.",
    ],
  },
];

export function BoundaryFencingContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Specifications"
      title="Technical Specifications for Industrial & Agricultural Perimeter Fencing"
      intro="Selecting the right perimeter boundary is a structural decision driven by terrain geology, wind load (per IS 875), security classification, and maintenance horizon. The four solutions below outline material grades, dimensions, and application criteria to help you specify the correct system before a site survey. Start with the compound wall comparison guide if you have not yet narrowed your wall type."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("boundary-fencing-specifications")}
      whatsappTopic="industrial and agricultural perimeter fencing"
      jumpNavLabel="Jump to a solution"
      equipmentLinks={[
        { href: `/${locale}/articles/compound-wall-types-compared`, label: "Compare wall types first" },
        { href: `/${locale}/equipment/posthole`, label: "Post hole digger hire" },
      ]}
    />
  );
}

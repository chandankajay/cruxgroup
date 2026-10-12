"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "fgl-platform",
    title: "Finished Ground Level (FGL) & Platform Formation",
    summary:
      "FGL is the reference elevation for the entire venture — roads, plots, and drainage tie to it. On sloped raw land, the platform may be a single level (large factory pad) or stepped terraces (hill ventures in Vikarabad). The earthworks contractor works to provisional FGL from the layout engineer; the licensed surveyor certifies final levels after compaction.",
    specs: [
      { label: "Provisional FGL source", value: "Layout plan, HMDA approval drawing, or architect site section" },
      { label: "Platform width", value: "Full plot for industrial; individual plot pads in layout ventures" },
      { label: "Tolerance at handover", value: "±50 mm for survey; ±20 mm before PCC in critical factory zones" },
      { label: "Stepped plots", value: "Max 600 mm riser between terraces; geotechnical check if higher" },
    ],
    applications: [
      "Single-shed NIMZ plots requiring one flat pad from natural slope",
      "Multi-plot layouts where each 40×60 m unit gets independent FGL",
    ],
  },
  {
    id: "cut-fill-balance",
    title: "Cut-Fill Balance & Quantity Control",
    summary:
      "Unbalanced cut-fill drives tipper cost. Smart grading keeps spoil on-site as road sub-base or landscape fill, and imports murram only when local cut is insufficient.",
    specs: [
      { label: "Volume estimate", value: "Grid survey at 10 m intervals before works; compare after Stage 3" },
      { label: "Shrinkage factor", value: "Apply 1.15–1.25 on loose fill volume for compaction settlement" },
      { label: "Borrow material", value: "Approved murram — no organic soil, no building demolition rubble in structural fill" },
      { label: "Spoil reuse", value: "Broken rock → sub-base; excess → stockpile off footprint or haul away" },
      { label: "Tipper planning", value: "10–16 m³ tippers; count trips from volume ÷ payload for budget control" },
    ],
    notes: [
      "On ORR layout ventures, developers often cut road levels first and use spoil to raise low plots — plan this before isolated plot grading.",
    ],
  },
  {
    id: "grading-slopes",
    title: "Grading Slopes & Drainage During Levelling",
    summary:
      "A perfectly flat pad without drainage slope ponds water and fails surveyor handover after first monsoon. Grade toward storm drains, plot edges, or temporary sump pits during development.",
    specs: [
      { label: "Minimum slope", value: "1:100 (1% ) on paved zones; 1:50 on unpaved during construction" },
      { label: "Cross-fall", value: "Crown at centre or single fall to edge — consistent with layout drain design" },
      { label: "Temporary drains", value: "V-ditches at plot edge until permanent SWD installed" },
      { label: "JCB finish", value: "Bucket reverse pass for fine trim; laser or dumpy level check every 20 m" },
    ],
    applications: [
      "Tukkuguda and Adibatla plots on filled lowlands — positive drainage mandatory",
      "Shadnagar industrial pads with internal RCC drain network tied to FGL",
    ],
  },
  {
    id: "compaction-layers",
    title: "Fill Placement & Compaction Layers",
    summary:
      "Fill placed in thick dumps will not compact uniformly. Layered placement with moisture control is non-negotiable under building footprints.",
    specs: [
      { label: "Lift thickness", value: "150–200 mm loose before rolling" },
      { label: "Compaction energy", value: "8–10 pass vibratory roller per lift; overlap 200 mm" },
      { label: "Testing", value: "Sand replacement or nuclear gauge — 1 test per 500 m² per lift" },
      { label: "Subgrade CBR", value: "Min CBR 5% for roads; CBR 8%+ under factory floor slabs (project spec)" },
      { label: "Curing fill", value: "No traffic on uncompacted lift > 24 h without re-roll" },
    ],
  },
  {
    id: "equipment-selection",
    title: "Equipment for Levelling Work",
    summary:
      "Machine selection depends on acreage, rock content, and access width. JCB backhoe is the default for Telangana venture plots; dozer and roller follow for fine work and compaction.",
    specs: [
      { label: "JCB backhoe", value: "Cut, fill, load tipper, trim — primary machine for plots up to 5 acres" },
      { label: "Dozer blade (tractor)", value: "Spread fill, long push distances, light shrub clearing" },
      { label: "Tipper / dumper", value: "Haul spoil and imported murram — batch with JCB loading" },
      { label: "Vibratory roller", value: "Required above 1,000 m² compacted area; partner hire typical" },
      { label: "Laser / auto-level", value: "Surveyor or site engineer — not machine hire, but required for grade control" },
    ],
    notes: [
      "Book JCB with operator who has venture levelling experience — bucket finish quality determines surveyor rework.",
    ],
  },
];

export function SiteLevellingCutFillContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="Site Levelling & Cut-Fill: FGL, Slopes & Compaction Reference"
      intro="Levelling is not simply flattening ground — it is forming a platform at the correct Finished Ground Level with balanced earthworks, controlled fill layers, and slopes that drain. This reference covers the engineering parameters earthworks contractors and venture developers use on Telangana layout and industrial plots before surveyors peg final coordinates."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("site-levelling-cut-fill-reference")}
      whatsappTopic="site levelling and cut-fill for my venture plot"
      jumpNavLabel="Levelling topics"
      equipmentLinks={[
        { href: `/${locale}/equipment/jcb`, label: "JCB for cut-fill & grading" },
        { href: `/${locale}/articles/land-development-raw-to-survey-ready`, label: "Full development workflow" },
      ]}
    />
  );
}

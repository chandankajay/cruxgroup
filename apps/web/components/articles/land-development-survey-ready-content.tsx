"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "stage-0-assessment",
    title: "Stage 0: Site Assessment Before Any Machine Mobilises",
    summary:
      "A raw venture plot — rocky, sloped, or covered in scrub — cannot go straight to a levelling JCB. The developer first confirms title, encumbrances, and a provisional layout plan. The civil team walks the site to map high points, rock outcrops, drainage paths, and access for tippers and machines.",
    bullets: [
      "Walk the full plot boundary and note rock shelves, boulders, and cut banks visible on surface",
      "Identify single access road for JCB and tipper — widen or stabilise before heavy mobilisation",
      "Mark tentative Finished Ground Level (FGL) from layout plan or architect brief",
      "Flag black cotton, fill zones, or waterlogging pockets for special treatment later",
      "Photograph existing conditions — baseline for cut-fill quantity disputes",
    ],
    notes: [
      "Licensed land surveyors typically peg the plot after bulk earthworks, not before. Your earthworks contractor works to a provisional FGL from the layout engineer; the surveyor then fixes final coordinates and levels on the prepared surface.",
    ],
  },
  {
    id: "stage-1-clearing",
    title: "Stage 1: Clearing & Grubbing",
    summary:
      "Remove vegetation, stumps, surface boulders under 300 mm, and construction debris. Clearing defines the net earthworks footprint — skipping it inflates cut-fill estimates and leaves organic matter that decomposes under fill, causing settlement.",
    specs: [
      { label: "Scope", value: "Trees, shrubs, roots to 300 mm depth, rubbish, old fence lines" },
      { label: "Equipment", value: "JCB with bucket; manual clearing at boundary peg zones" },
      { label: "Debris disposal", value: "Haul vegetative waste off-site; do not bury organic matter in fill" },
      { label: "Output", value: "Clean soil surface visible across full build footprint ± 1 m" },
    ],
    applications: [
      "New HMDA layout ventures in Nallagandla and Ghatkesar before layout handover",
      "NIMZ industrial plots after land allotment, before factory civil begins",
      "Farm-to-venture conversions in Mahbubnagar with standing crop and fence removal",
    ],
  },
  {
    id: "stage-2-rock",
    title: "Stage 2: Rock Breaking & Hard Strata Reduction",
    summary:
      "On Telangana's laterite and granite belts — Chevella, Vikarabad, Shadnagar west, Maheshwaram — raw land often has rock within 500 mm of surface. Standard bucket excavation stops here; rock breaker attachment on JCB backhoe fractures rock for removal or level reduction.",
    specs: [
      { label: "When required", value: "Bucket refusal, boulders > 400 mm, or rockhead above design cut level" },
      { label: "Equipment", value: "JCB backhoe with hydraulic rock breaker; avoid hammer on soft fill" },
      { label: "Depth target", value: "Break to 150 mm below design FGL in building footprint" },
      { label: "Spoil", value: "Stockpile broken rock for sub-base or haul off-site via tipper" },
      { label: "Safety", value: "Exclusion zone 15 m radius; PPE for flying chips; no breaker on suspended boulders" },
    ],
    notes: [
      "See the dedicated rock-breaking guide for breaker sizing and production rates on granite vs laterite.",
    ],
  },
  {
    id: "stage-3-cut-fill",
    title: "Stage 3: Bulk Cut-Fill & Grading to Provisional FGL",
    summary:
      "Cut high ground, fill low pockets, and shape the plot to a uniform slope toward drainage. Bulk work uses JCB bucket and optionally dozer blade on tractor for fine passes. Balance cut and fill on-site where possible to avoid tipper cost.",
    specs: [
      { label: "Cut-fill tolerance (bulk)", value: "±150 mm of provisional FGL before fine grading" },
      { label: "Slope", value: "Min 1:100 away from building pads toward drain or plot edge" },
      { label: "Fill layers", value: "150–200 mm loose lifts; organic-free murram or approved borrow" },
      { label: "Equipment", value: "JCB 3DX/4DX for cut-fill; tractor dozer for spread and level" },
      { label: "Black cotton", value: "Remove 300 mm topsoil; replace with sand blanket before structural fill" },
    ],
    applications: [
      "ORR corridor plotted ventures on undulating natural ground",
      "Industrial sheds on sloped NIMZ allotments requiring platform formation",
    ],
  },
  {
    id: "stage-4-compaction",
    title: "Stage 4: Compaction & Proof Rolling",
    summary:
      "Loose fill must be compacted before a surveyor fixes final levels or before PCC/foundation work. Under-compacted fill causes slab cracking and peg movement within weeks.",
    specs: [
      { label: "Compaction target", value: "95% of Maximum Dry Density (MDD) per IS 2720 (Part 8) on structural zones" },
      { label: "Equipment", value: "Vibratory roller 8–10 ton for large plots; plate compactor for narrow strips" },
      { label: "Moisture", value: "OMC ±2% — sprinkle or aerate before rolling" },
      { label: "Proof roll", value: "Heavy truck pass or roller — no pumping or ruts > 25 mm" },
      { label: "Documentation", value: "Layer thickness log; compaction test every 500 m² or per lift on industrial jobs" },
    ],
    notes: [
      "Residential layout ventures may accept 93% MDD on internal roads; factory and warehouse pads require 95% minimum under column zones.",
    ],
  },
  {
    id: "stage-5-survey-handover",
    title: "Stage 5: Benchmarks & Surveyor Handover",
    summary:
      "Once bulk earthworks and compaction are complete, the licensed surveyor establishes grid lines, plot corners, and final levels from stable benchmarks. This is the point where layout ventures issue possession or factory projects release foundation contractors.",
    specs: [
      { label: "Surface readiness", value: "±50 mm of agreed provisional FGL across survey zone" },
      { label: "Benchmarks", value: "Min 2 fixed BM points outside disturbance zone; concrete peg or nail in rock" },
      { label: "Access", value: "Clear line of sight across diagonals; no standing water or loose spoil piles" },
      { label: "Boundary", value: "Temporary boundary stones or paint visible; encroachments resolved" },
      { label: "Drainage", value: "Provisional slope confirmed — no ponding after 24 h post light rain" },
    ],
    bullets: [
      "Surveyor pegs plot corners and grid for layout or column lines",
      "Final FGL certificate or contour map issued to structural engineer",
      "Developer releases compound wall / foundation contractors to mobilise",
      "Post hole digger and boundary work follow survey pegs — not before",
    ],
    notes: [
      "Mobilising a surveyor on unprepared ground wastes a day and damages professional pegs in soft fill. Complete Stages 1–4 first. HMDA layout buyers should complete the venture handover checklist before booking boundary works.",
    ],
  },
  {
    id: "equipment-summary",
    title: "Equipment Sequence Summary",
    summary:
      "Typical machine order on a raw rocky venture plot in Telangana — durations vary by acreage and rock percentage.",
    specs: [
      { label: "1 — Clearing", value: "JCB bucket · 1–3 days per acre light scrub" },
      { label: "2 — Rock breaking", value: "JCB + rock breaker · 3–10 days per acre on hard strata" },
      { label: "3 — Cut-fill", value: "JCB + tipper · 5–15 days depending on balance and haul distance" },
      { label: "4 — Fine grade", value: "JCB / dozer blade · 2–4 days" },
      { label: "5 — Compaction", value: "Roller hire (partner) · 2–5 days" },
      { label: "6 — After survey", value: "Post hole digger for boundary; no earthworks on pegged lines without protection" },
    ],
  },
];

export function LandDevelopmentSurveyReadyContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="From Raw Land to Survey-Ready Plot: Site Development Workflow"
      intro="Venture developers across Telangana inherit plots that are rocky, sloped, and uncleared — nothing a licensed surveyor can peg accurately until earthworks finish. This guide walks through the staged process from raw ground to a levelled, compacted surface with benchmarks in place: clearing, rock breaking, cut-fill, compaction, and surveyor handover. It is the site-prep sequence that precedes compound walls, foundations, and factory construction."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("land-development-raw-to-survey-ready")}
      whatsappTopic="land development and site levelling for my plot"
      jumpNavLabel="Development stages"
      equipmentLinks={[
        { href: `/${locale}/equipment/jcb`, label: "JCB backhoe hire" },
        { href: `/${locale}/articles/internal-road-formation-layout-ventures`, label: "Internal road formation" },
        { href: `/${locale}/articles/hmda-layout-venture-handover-checklist`, label: "Plot possession checklist" },
        { href: `/${locale}/articles/monsoon-earthworks-timing-telangana`, label: "Monsoon earthworks timing" },
      ]}
    />
  );
}

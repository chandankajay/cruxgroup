"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "road-hierarchy",
    title: "Layout Road Hierarchy: Arterial, Collector & Plot Frontage",
    summary:
      "HMDA ventures are served by a road hierarchy before individual plots become accessible. Earthworks and machine access follow this sequence — attempting plot levelling before collector roads exist traps equipment when monsoon arrives.",
    specs: [
      { label: "Arterial", value: "Venture main entry from ORR/NH — first to grade; carries tipper fleet" },
      { label: "Collector", value: "Internal lanes dividing sectors; formed before plot handover in that sector" },
      { label: "Plot frontage", value: "Edge of 12–18 m lane abutting individual plot; owner driveway ties here" },
      { label: "Formation width", value: "Carriageway + drains + footpath per layout sanction — typically 12–24 m reserve" },
    ],
    applications: [
      "Large ventures in Nallagandla with phased sector release",
      "Ghatkesar layouts where rear sectors lag front sector road formation",
    ],
  },
  {
    id: "formation-sequence",
    title: "Road Formation Sequence Before Surfacing",
    summary:
      "Internal roads build from subgrade up. Skipping layers to open roads early produces potholes under first monsoon tipper traffic.",
    bullets: [
      "Strip topsoil 200 mm from road reserve width",
      "Cut-fill subgrade to formation level ± 30 mm",
      "Compact subgrade to 95% MDD over full reserve width",
      "Place GSB (graded stone base) 150–200 mm in two lifts",
      "W.B.M. or wet mix macadam 75–100 mm before B.T. if specified",
      "B.T. wearing course only after GSB passes proof roll under loaded tipper",
    ],
    notes: [
      "Many ventures hand over at W.B.M. stage and complete B.T. after 70% occupancy — confirm surfacing stage at possession.",
    ],
  },
  {
    id: "gsb-specs",
    title: "GSB & Sub-Base Specifications",
    summary:
      "Graded stone base carries tipper loads during venture construction and later plot-owner material deliveries. Under-specified GSB fails under 16-ton axle loads common on layout haul routes.",
    specs: [
      { label: "GSB material", value: "IS 383 graded stone 63 mm down; fines < 10%" },
      { label: "Thickness", value: "150 mm min. for light layouts; 200 mm for heavy haul routes" },
      { label: "Compaction", value: "95% MDD per lift; vibratory roller 8–10 ton" },
      { label: "CBR requirement", value: "Min 30% after GSB for B.T. readiness per IRC 37" },
      { label: "Edge restraint", value: "Kerb or compacted shoulder prevents GSB migration under wheel paths" },
    ],
  },
  {
    id: "drainage-with-roads",
    title: "Road Drainage Integrated With Formation",
    summary:
      "Road crown and channel levels set the drainage baseline for every plot fronting the lane. Form roads before final plot FGL is fixed — plots drain to road, not the reverse.",
    specs: [
      { label: "Crown slope", value: "2.5% (1:40) to both edges or 2% single fall on narrow lanes" },
      { label: "Side drain", value: "U-drain or covered pipe at edge; connect to venture SWD main" },
      { label: "Invert level", value: "Plot FGL min. 150 mm above drain invert at frontage" },
      { label: "Culverts", value: "At every low point crossing plot access — precast NP2/NP3 pipes" },
    ],
    applications: [
      "Sloped ventures in Kokapet and Narsingi where rear plots sit above road — driveway culverts mandatory",
    ],
  },
  {
    id: "machine-access",
    title: "Machine Access Planning During Road Formation",
    summary:
      "JCB and tipper hire for plot works depends on formed road bearing capacity. Using plot subgrade as haul route before compaction destroys work and blocks surveyor access.",
    specs: [
      { label: "Haul route rule", value: "Only on compacted GSB or higher — never on fresh fill" },
      { label: "Turning radius", value: "JCB 3DX needs 6 m clear at plot entry; plan temp widening at bends" },
      { label: "Tipper staging", value: "Designate murram stockpile zones off carriageway — reload from stockpile to plot" },
      { label: "Plot access temp", value: "300 mm murram plug from road edge to plot for monsoon if B.T. delayed" },
    ],
    notes: [
      "Book JCB for plot levelling only after collector lane GSB is proof-rolled — operator refusal on soft subgrade is correct engineering, not delay tactics.",
    ],
  },
  {
    id: "possession-readiness",
    title: "Road Readiness vs Plot Possession",
    summary:
      "A sector should not hand over plots until collector road formation is complete to at least W.B.M. and connected to storm drain. Plot owners cannot build without material delivery access.",
    specs: [
      { label: "Minimum at possession", value: "Compacted subgrade + GSB on frontage lane; drain invert set" },
      { label: "Preferred at possession", value: "W.B.M. surface on lane to plot front; B.T. scheduled" },
      { label: "Owner driveway", value: "Owner connects plot to road edge — not developer scope unless agreed" },
      { label: "As-built", value: "Road level certificate at plot frontage in possession letter" },
    ],
  },
];

export function InternalRoadFormationContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="Internal Road Formation for Layout Ventures Before Plot Possession"
      intro="Layout buyers cannot build until internal roads carry tippers, surveyors, and concrete trucks to their frontage. Venture developers must sequence road formation — subgrade, GSB, drains, and surfacing — before plot-level works and possession. This guide covers the road hierarchy, layer specifications, drainage integration, and machine access rules that govern HMDA and private layout ventures across Hyderabad's ORR corridor."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("internal-road-formation-layout-ventures")}
      whatsappTopic="layout road and plot levelling works"
      jumpNavLabel="Road formation topics"
      equipmentLinks={[
        { href: `/${locale}/equipment/jcb`, label: "JCB for road subgrade & cut-fill" },
        { href: `/${locale}/articles/hmda-layout-venture-handover-checklist`, label: "Plot possession checklist" },
        { href: `/${locale}/articles/monsoon-earthworks-timing-telangana`, label: "Monsoon earthworks timing" },
      ]}
    />
  );
}

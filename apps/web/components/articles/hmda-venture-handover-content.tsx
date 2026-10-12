"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "before-possession",
    title: "What HMDA Layout Buyers Should Expect Before Possession",
    summary:
      "An HMDA-approved venture in Nallagandla, Ghatkesar, or Kokapet does not hand over a build-ready plot by default. The developer completes layout-level works — boundary demarcation, internal roads, drainage backbone, and often plot-level levelling — to an agreed standard before individual possession. Buyers should verify which items are complete versus scheduled.",
    bullets: [
      "Layout approval drawing and plot sketch with dimensions and FGL noted",
      "Venture boundary fully fenced or demarcated with stone pillars",
      "Internal B.T. or W.B.M. road reaches within 50 m of your plot frontage (venture-dependent)",
      "Plot corners pegged by licensed surveyor on compacted surface",
      "No standing water on plot 24 h after light rain",
      "Electricity and water pipeline corridors marked — not necessarily connected",
    ],
    notes: [
      "Possession without survey pegs on soft fill is a red flag — pegs will move on first monsoon and boundary disputes follow.",
    ],
  },
  {
    id: "developer-scope",
    title: "Developer Scope vs Individual Plot Owner Scope",
    summary:
      "Venture developers and plot owners split civil work at a defined handover line. Misunderstanding this split is the most common cause of duplicate earthworks spend.",
    specs: [
      { label: "Developer typically provides", value: "Layout roads, storm drain mains, venture boundary wall, common area levelling, plot peg survey" },
      { label: "Owner typically provides", value: "Plot-level cut-fill within boundary, compound wall, building foundation, driveway from road to plinth" },
      { label: "Grey zone — confirm in writing", value: "Plot levelling to FGL, individual plot drainage connection, approach road from internal lane" },
      { label: "Documentation", value: "Possession letter stating FGL, peg coordinates, and road level at frontage" },
    ],
    applications: [
      "ORR west plotted layouts where buyers construct villas within 6 months of possession",
      "Multi-phase ventures where Phase 2 roads lag Phase 1 possession",
    ],
  },
  {
    id: "survey-pegs",
    title: "Survey Pegs, Coordinates & Boundary Verification",
    summary:
      "Licensed surveyor pegs fix the legal plot boundary. Building plans and compound walls must tie to these pegs — not to approximate fence lines or neighbour assumptions.",
    specs: [
      { label: "Peg material", value: "RCC boundary stones or iron pegs with paint crown; GPS coordinates recorded" },
      { label: "Tolerance", value: "±50 mm from approved layout dimension on each boundary line" },
      { label: "Owner verification", value: "Measure diagonals and frontage before compound wall pole holes" },
      { label: "Encroachment", value: "Stop work and notify developer if peg-to-peg dimension differs from sale deed sketch" },
      { label: "Re-survey trigger", value: "Pegs disturbed by earthworks, missing, or buried — re-survey before wall/foundation" },
    ],
    notes: [
      "Book post hole digger only after peg verification — see boundary post spacing reference for hole layout from pegs.",
    ],
  },
  {
    id: "road-levels",
    title: "Internal Road Levels at Plot Frontage",
    summary:
      "Your plot FGL ties to the internal road crown or edge level at the frontage. A mismatch here causes invert problems for driveway drainage and plinth height errors.",
    specs: [
      { label: "Reference point", value: "Road centre crown or channel edge per layout section drawing" },
      { label: "Typical plinth gap", value: "450–600 mm above road edge for residential; project-specific for commercial" },
      { label: "Driveway slope", value: "1:15 max from road to plinth for vehicle access" },
      { label: "Check before build", value: "Auto-level from road edge to proposed plinth — confirm with architect" },
    ],
    applications: [
      "Sloped layout ventures in Ghatkesar where rear plots sit higher than frontage road",
    ],
  },
  {
    id: "drainage-handover",
    title: "Drainage & Stormwater at Handover",
    summary:
      "Layout-level drains must carry monsoon runoff before owners start plot filling. Individual plot drains connect later, but the main line must be open.",
    bullets: [
      "Confirm SWD pipe from plot frontage connects to venture main — not blocked with construction debris",
      "No fill placed over manhole covers or inspection chambers",
      "Plot graded to drain toward road channel or designated sump — not toward neighbour plot",
      "Developer completes culverts at venture entrance before heavy monsoon",
    ],
  },
  {
    id: "handover-checklist",
    title: "Plot Possession Checklist (Field Use)",
    summary:
      "Use this checklist on possession day before signing acceptance. Items marked fail should delay compound wall and foundation mobilisation.",
    specs: [
      { label: "1 — Deed vs pegs", value: "Dimensions match sale sketch within tolerance" },
      { label: "2 — Surface", value: "Compacted or cut to stated FGL; no rubble dumps on plot" },
      { label: "3 — Access", value: "JCB can reach plot from internal road without crossing neighbour land" },
      { label: "4 — Utilities", value: "Water/electricity corridor marked; no surprise HT lines on build zone" },
      { label: "5 — Drainage", value: "Positive slope to road or drain; no ponding" },
      { label: "6 — Documents", value: "Possession letter, FGL note, survey sketch, layout NOC copies" },
    ],
    notes: [
      "If plot-level levelling is owner scope, treat possession as raw handover and follow the land development workflow from Stage 1.",
    ],
  },
];

export function HmdaVentureHandoverContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="HMDA Layout Venture Handover: Plot Possession Checklist"
      intro="Buyers in HMDA-approved ventures across Hyderabad's ORR west corridor — Nallagandla, Ghatkesar, Kokapet, and similar layouts — often receive plots that look finished but fail basic civil checks. This checklist defines what should be complete at developer handover versus what the plot owner executes next: survey pegs, road levels, drainage, and the documentation that prevents compound wall and foundation rework."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("hmda-layout-venture-handover-checklist")}
      whatsappTopic="plot levelling and possession works on my HMDA layout plot"
      jumpNavLabel="Handover topics"
      equipmentLinks={[
        { href: `/${locale}/articles/land-development-raw-to-survey-ready`, label: "Raw land to survey-ready workflow" },
        { href: `/${locale}/articles/internal-road-formation-layout-ventures`, label: "Internal road formation guide" },
        { href: `/${locale}/equipment/posthole`, label: "Post hole digger for boundary poles" },
      ]}
    />
  );
}

export type TechnicalGuidePillar = "perimeter" | "land-development";

export interface TechnicalGuideMeta {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly tag: string;
  readonly pillar: TechnicalGuidePillar;
  readonly readMinutes: number;
  readonly datePublished: string;
  readonly seoDescription: string;
  readonly about: readonly string[];
  readonly sortOrder: number;
}

/** Static engineering reference pages — no pricing, surfaced on blog and articles index. */
export const TECHNICAL_GUIDES: readonly TechnicalGuideMeta[] = [
  {
    slug: "compound-wall-types-compared",
    title: "Compound Wall Types Compared: RCC, Precast, MS Sheet & Chain-Link",
    excerpt:
      "Decision guide for industrial and agricultural plots — compare visibility, wind load, installation speed, maintenance, and terrain suitability across four boundary systems.",
    tag: "Decision Guide",
    pillar: "perimeter",
    readMinutes: 7,
    datePublished: "2025-06-10",
    seoDescription:
      "Compare compound wall types for Telangana industrial and farm plots — RCC chain-link, corrugated MS sheet, precast H-column walls, and UPVC wire systems with terrain and security guidance.",
    about: ["Compound wall types", "Industrial boundary walls", "Perimeter comparison"],
    sortOrder: 1,
  },
  {
    slug: "boundary-post-spacing-foundations",
    title: "Boundary Post Spacing & Foundation Depth: Engineering Reference",
    excerpt:
      "Standard post spacing intervals, hole diameter, embedment depth, and concrete grades for RCC and precast compound wall poles across soil types.",
    tag: "Foundations",
    pillar: "perimeter",
    readMinutes: 6,
    datePublished: "2025-06-12",
    seoDescription:
      "Boundary post spacing and foundation depth reference for RCC compound walls — hole diameter, embedment, M20/M30 grades, and auger specifications for Telangana sites.",
    about: ["Boundary post spacing", "Compound wall foundations", "Post hole depth"],
    sortOrder: 2,
  },
  {
    slug: "foundation-methods-rocky-terrain",
    title: "Foundation Methods for Rocky Terrain: Augering vs Doweling vs Drilling",
    excerpt:
      "When standard auger-PCC foundations fail on laterite and bedrock, engineers switch to doweling, pedestal casting, or shifted post spacing — how to choose.",
    tag: "Soil & Terrain",
    pillar: "perimeter",
    readMinutes: 7,
    datePublished: "2025-06-14",
    seoDescription:
      "Rocky terrain foundation methods for boundary posts in Telangana — augering with PCC backfill, doweling into bedrock, pedestal casting, and when to change wall type.",
    about: ["Rocky terrain foundations", "Doweling method", "Boundary post foundations"],
    sortOrder: 3,
  },
  {
    slug: "boundary-fencing-specifications",
    title: "Technical Specifications for Industrial & Agricultural Perimeter Fencing",
    excerpt:
      "Civil-engineering specs for RCC chain-link, corrugated MS sheet, precast concrete walls, and UPVC wired compounds — foundations, material grades, and terrain guidance.",
    tag: "Specifications",
    pillar: "perimeter",
    readMinutes: 8,
    datePublished: "2025-06-01",
    seoDescription:
      "Civil-engineering specifications for RCC chain-link, corrugated MS sheet, precast concrete wall, and UPVC wired perimeter fencing — material grades, foundations, and terrain guidance.",
    about: [
      "Perimeter fencing",
      "RCC chain-link fencing",
      "Precast concrete boundary walls",
      "Industrial compound fencing",
    ],
    sortOrder: 4,
  },
  {
    slug: "land-development-raw-to-survey-ready",
    title: "From Raw Land to Survey-Ready Plot: Site Development Workflow",
    excerpt:
      "Staged guide for venture plots — clearing, rock breaking, cut-fill, compaction, and benchmark handover so a licensed surveyor can peg layout coordinates.",
    tag: "Land Development",
    pillar: "land-development",
    readMinutes: 9,
    datePublished: "2025-06-18",
    seoDescription:
      "Land development workflow for Telangana venture plots — raw rocky land through clearing, rock breaking, levelling, compaction to survey-ready platform for licensed surveyors.",
    about: [
      "Land development",
      "Site levelling",
      "Survey-ready plot",
      "Venture plot preparation",
    ],
    sortOrder: 5,
  },
  {
    slug: "site-levelling-cut-fill-reference",
    title: "Site Levelling & Cut-Fill: FGL, Slopes & Compaction Reference",
    excerpt:
      "Finished Ground Level, cut-fill balance, drainage slopes, fill lifts, and compaction targets for layout and industrial platform formation.",
    tag: "Levelling",
    pillar: "land-development",
    readMinutes: 7,
    datePublished: "2025-06-20",
    seoDescription:
      "Site levelling and cut-fill reference for Telangana plots — FGL platform formation, grading slopes, fill layers, compaction to IS 2720, and JCB grading workflow.",
    about: ["Site levelling", "Cut-fill balance", "Finished ground level"],
    sortOrder: 6,
  },
  {
    slug: "rock-breaking-hard-strata-site-prep",
    title: "Rock Breaking & Hard Strata: Site Prep Before Levelling",
    excerpt:
      "Identify granite and laterite hardpan, pair rock breaker to JCB, and sequence breaking work before cut-fill on raw venture land.",
    tag: "Rock Breaking",
    pillar: "land-development",
    readMinutes: 6,
    datePublished: "2025-06-22",
    seoDescription:
      "Rock breaking and hard strata site preparation in Telangana — JCB hydraulic breaker, boulder removal, spoil reuse, and sequencing before levelling on venture plots.",
    about: ["Rock breaking", "Hard strata excavation", "JCB rock breaker"],
    sortOrder: 7,
  },
  {
    slug: "hmda-layout-venture-handover-checklist",
    title: "HMDA Layout Venture Handover: Plot Possession Checklist",
    excerpt:
      "What developers should deliver vs what plot owners execute — survey pegs, road levels, drainage, and documentation before compound wall or foundation work.",
    tag: "Venture Handover",
    pillar: "land-development",
    readMinutes: 7,
    datePublished: "2025-06-25",
    seoDescription:
      "HMDA layout venture plot possession checklist for Telangana — survey peg verification, FGL, internal road levels, drainage, and developer vs owner scope before building.",
    about: ["HMDA layout possession", "Venture handover checklist", "Plot survey pegs"],
    sortOrder: 8,
  },
  {
    slug: "monsoon-earthworks-timing-telangana",
    title: "Monsoon Timing for Earthworks in Telangana",
    excerpt:
      "Which site works to continue June–September, which to pause, temporary drainage, and a venture developer earthworks calendar aligned to possession targets.",
    tag: "Monsoon Planning",
    pillar: "land-development",
    readMinutes: 7,
    datePublished: "2025-06-27",
    seoDescription:
      "Monsoon earthworks planning for Telangana venture plots — safe vs pause activities, compaction moisture checks, temporary drainage, and seasonal calendar for layout developers.",
    about: ["Monsoon earthworks", "Telangana construction season", "Compaction in rain"],
    sortOrder: 9,
  },
  {
    slug: "internal-road-formation-layout-ventures",
    title: "Internal Road Formation for Layout Ventures Before Plot Possession",
    excerpt:
      "Road hierarchy, GSB sub-base specs, drainage integration, and machine access sequencing before individual plots hand over to buyers.",
    tag: "Road Formation",
    pillar: "land-development",
    readMinutes: 8,
    datePublished: "2025-06-29",
    seoDescription:
      "Internal road formation for HMDA layout ventures in Telangana — subgrade, GSB, W.B.M., drainage inverts, and road readiness before plot possession and owner construction.",
    about: ["Internal road formation", "Layout venture roads", "GSB sub-base"],
    sortOrder: 10,
  },
];

export function getTechnicalGuideSlugs(): string[] {
  return TECHNICAL_GUIDES.map((g) => g.slug);
}

export function getTechnicalGuideBySlug(slug: string): TechnicalGuideMeta | undefined {
  return TECHNICAL_GUIDES.find((g) => g.slug === slug);
}

export function getRelatedTechnicalGuides(
  currentSlug: string,
  limit = 3,
): TechnicalGuideMeta[] {
  const current = getTechnicalGuideBySlug(currentSlug);
  const pillar = current?.pillar;

  const samePillar = TECHNICAL_GUIDES.filter(
    (g) => g.slug !== currentSlug && g.pillar === pillar,
  );
  const otherPillar = TECHNICAL_GUIDES.filter(
    (g) => g.slug !== currentSlug && g.pillar !== pillar,
  );

  return [...samePillar, ...otherPillar]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit);
}

export function getTechnicalGuidesByPillar(
  pillar: TechnicalGuidePillar,
): TechnicalGuideMeta[] {
  return TECHNICAL_GUIDES.filter((g) => g.pillar === pillar).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

/** Industrial / layout corridors where engineering refs are relevant. */
export const ENGINEERING_GUIDE_LOCATION_SLUGS = new Set([
  "shadnagar",
  "kothur",
  "tukkuguda",
  "adibatla",
  "maheshwaram",
  "ghatkesar",
  "nallagandla",
  "kokapet",
  "chevella",
  "vikarabad",
  "jadcherla",
  "tellapur",
  "turkayamjal",
]);

export function locationShowsEngineeringGuides(locationSlug: string): boolean {
  return ENGINEERING_GUIDE_LOCATION_SLUGS.has(locationSlug);
}

export function getEngineeringGuidesForLocation(): TechnicalGuideMeta[] {
  return [...TECHNICAL_GUIDES].sort((a, b) => a.sortOrder - b.sortOrder);
}

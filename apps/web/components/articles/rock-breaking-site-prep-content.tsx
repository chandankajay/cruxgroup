"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "identify-hard-strata",
    title: "Identifying Hard Strata on Raw Venture Land",
    summary:
      "Before booking a rock breaker, confirm you are dealing with rock — not caliche, laterite hardpan, or buried boulders in fill. Misidentification wastes breaker hire on material a bucket could handle.",
    bullets: [
      "Bucket test: if JCB bucket tooth marks white/grey granite or ringing sound on impact → rock",
      "Laterite hardpan: red-brown, crumbles with repeated breaker passes — may need ripper not hammer",
      "Buried boulders in fill: isolated highs; surround often soft — extract individually",
      "Rockhead map: trial pits every 30–50 m on plots > 1 acre before quoting earthworks",
    ],
    applications: [
      "Chevella and Vikarabad venture plots with granite outcrops",
      "Maheshwaram and Kongara Kalan laterite belts",
      "Cut slopes along ORR layout berms exposing fresh rock",
    ],
  },
  {
    id: "breaker-specs",
    title: "Rock Breaker Attachment & JCB Pairing",
    summary:
      "Hydraulic rock breakers mount on JCB backhoe dipper arm. Breaker size must match carrier weight — undersized breakers overheat; oversized units stress pins.",
    specs: [
      { label: "JCB 3DX class", value: "Breaker 300–400 kg class; 400–800 blows/min on medium granite" },
      { label: "JCB 4DX / heavy", value: "Breaker 400–600 kg; suitable for boulders > 1 m" },
      { label: "Working depth", value: "Typically 500–1,500 mm below surface per pass; bench in layers" },
      { label: "Production", value: "3–8 m³ fractured rock per day per machine — highly site-specific" },
      { label: "Fuel & wear", value: "Breaker jobs consume 1.5–2× normal JCB diesel; tool bit replacement every 100–200 h" },
    ],
    notes: [
      "Always specify rock breaker attachment when enquiring — standard bucket hire does not include breaker.",
    ],
  },
  {
    id: "methods",
    title: "Breaking Methods: Bench, Pocket & Boulder Extract",
    summary:
      "Three field patterns cover most venture plot rock. Method choice affects neighbour vibration complaints and production rate.",
    specs: [
      { label: "Bench breaking", value: "Horizontal layers 300–500 mm deep across pad; best for continuous rockhead" },
      { label: "Pocket excavation", value: "Break centre, bucket removes chips; repeat for column footings" },
      { label: "Boulder extract", value: "Break surrounding soil, wrap chain, JCB lift to tipper — for isolated > 2 m boulders" },
      { label: "Blasting", value: "Licensed contractor only; rare on small ventures inside ORR buffer — prefer mechanical break" },
    ],
    applications: [
      "Factory column zones where rockhead is above footing depth",
      "Road formation through rock ridge in multi-plot layouts",
    ],
  },
  {
    id: "spoil-handling",
    title: "Fractured Rock Spoil & Reuse",
    summary:
      "Broken rock is an asset if graded correctly — use as sub-base under internal roads or platform fill. Oversized fragments cause roller refusal and surveyor level errors.",
    specs: [
      { label: "Max fragment", value: "150 mm for structural fill; 300 mm acceptable in non-load zones" },
      { label: "Screening", value: "Bucket sort or grizzly if mixing with murram fill" },
      { label: "Stockpile", value: "Outside building footprint; cover before monsoon to avoid fines washout" },
      { label: "Haul-off trigger", value: "When on-site reuse exceeds balance or CBR test fails on rock fill" },
    ],
  },
  {
    id: "sequence",
    title: "Where Rock Breaking Sits in the Development Sequence",
    summary:
      "Rock work happens after clearing and before final cut-fill to FGL. Breaking below final level wastes production; stopping above FGL forces surveyor to report level shortfall.",
    bullets: [
      "Clear vegetation → expose rock extent",
      "Break to 150 mm below provisional FGL in building pad",
      "Remove oversized boulders → stockpile or haul",
      "Murram fill over fractured rock surface in thin lifts if level still low",
      "Compact → fine grade → surveyor mobilises",
    ],
    notes: [
      "Do not peg plot corners in rock before breaking — pegs get destroyed on first breaker pass. Use temporary paint or GPS stakes outside footprint.",
    ],
  },
];

export function RockBreakingSitePrepContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="Rock Breaking & Hard Strata: Site Prep Before Levelling"
      intro="Raw venture land in Telangana's western and southern corridors often hides granite and laterite hardpan within arm's reach of the surface. Standard excavation stops where rock starts — hydraulic rock breaker on JCB backhoe is the usual next step. This guide covers identification, breaker pairing, field methods, and how rock work connects to cut-fill and surveyor handover on industrial and layout plots."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("rock-breaking-hard-strata-site-prep")}
      whatsappTopic="rock breaking and site preparation"
      jumpNavLabel="Rock prep topics"
      equipmentLinks={[
        { href: `/${locale}/equipment/jcb`, label: "JCB with rock breaker" },
        { href: `/${locale}/articles/land-development-raw-to-survey-ready`, label: "Full site development workflow" },
        { href: `/${locale}/articles/foundation-methods-rocky-terrain`, label: "Rocky terrain foundations" },
      ]}
    />
  );
}

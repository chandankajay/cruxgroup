"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "soil-assessment",
    title: "When Standard Augering Stops Working",
    summary:
      "Auger-PCC-RCC is the default on alluvial and soft laterite. It fails when bore refusal occurs above design depth, when bore walls collapse in loose sand, or when bedrock is encountered within 400 mm of target embedment.",
    bullets: [
      "Bore refusal above 600 mm depth on a 900 mm design → switch method or relocate post",
      "Water ingress filling bore within 30 minutes → dewatering sleeve or wider gravel plug required",
      "Bedrock encountered before 1:4 embedment ratio achieved → doweling or pedestal method",
      "Loose fill (common on ORR layout berms) → bore walls collapse; use casing or pre-drill oversized bore",
    ],
    applications: [
      "Chevella and Vikarabad granite outcrop zones",
      "Shadnagar laterite belts with shallow rock shelves",
      "Cut-fill plots in Tukkuguda and Adibatla where imported fill hides native strata",
    ],
  },
  {
    id: "auger-pcc",
    title: "Method 1: Augering with PCC Backfill",
    summary:
      "Standard method for cohesive soils with SPT N > 4. Tractor-mounted or hydraulic post hole diggers bore to depth, PCC backfills the annulus, and RCC post is cast in place or grouted.",
    specs: [
      { label: "Bore size", value: "Ø 300 mm for 150 mm posts; Ø 375–450 mm for 200 mm posts" },
      { label: "PCC mix", value: "1:4:8; placed in 150 mm lifts and rod-compacted" },
      { label: "Depth", value: "600–900 mm per spacing guide; verify plumb before PCC sets" },
      { label: "Equipment", value: "12-inch auger on post hole digger; 15-inch for gate posts" },
      { label: "Limitation", value: "Not for solid bedrock or boulder fields — auger skips and hole wanders" },
    ],
    notes: [
      "On NIMZ plots, book auger machines with the hole count and spacing already marked on site — re-measuring after mobilisation wastes half a day.",
    ],
  },
  {
    id: "doweling",
    title: "Method 2: Doweling into Bedrock",
    summary:
      "When rock is sound and within 400 mm of finished grade, drill anchor holes into bedrock, epoxy-grout Fe 500D dowels, and cast an RCC pedestal before erecting the post. This is the standard fix for rocky Telangana west corridors.",
    specs: [
      { label: "Dowel drill", value: "Ø 40–50 mm × 400 mm deep into sound bedrock (core sample if doubtful)" },
      { label: "Dowel bar", value: "Fe 500D, 16 mm dia., 2–4 bars per post depending on moment load" },
      { label: "Grout", value: "Epoxy or polyester resin grout per manufacturer spec; cure before pedestal pour" },
      { label: "Pedestal", value: "300 mm × 300 mm × 300 mm RCC (M30); post anchored with starter bars" },
      { label: "When to use", value: "Rockhead within 300 mm of design foundation level; no overburden slip risk" },
    ],
    applications: [
      "Industrial plots in Shadnagar and Kothur with exposed laterite-patina rock",
      "Hill slope boundaries in Vikarabad where shallow rock meets grade",
    ],
    notes: [
      "Doweling is not a shortcut for insufficient embedment in soil — it is specifically for rock-bearing conditions. If soil exists above rock, use auger to rockhead then dowel.",
    ],
  },
  {
    id: "pedestal-shift",
    title: "Method 3: Pedestal Casting & Post Relocation",
    summary:
      "When a designed post location hits an un-drillable boulder, engineers offset the post by up to 500 mm along the boundary line (maintaining spacing average) or cast an elevated pedestal to achieve embedment without reaching design depth in poor soil.",
    specs: [
      { label: "Max offset", value: "500 mm from surveyed boundary line without re-survey approval" },
      { label: "Raised pedestal", value: "300 mm above GL on compacted hardcore; M30 pedestal, 450 mm sq." },
      { label: "Spacing adjustment", value: "Redistribute spacing over next 3 bays — do not cluster offsets" },
      { label: "Documentation", value: "Mark relocated posts on as-built; affects gate and corner geometry" },
    ],
    notes: [
      "Relocating more than 10% of posts on a precast wall line may break plank module alignment — switch to cast-in-place RCC on affected bays.",
    ],
  },
  {
    id: "decision-flow",
    title: "Decision Flowchart (Field Use)",
    summary:
      "Walk the boundary with a trial bore or auger test every 50 m before finalising wall type and foundation budget.",
    bullets: [
      "Trial bore to 900 mm → soil only, no refusal → auger-PCC method",
      "Rock at < 600 mm → doweling on rockhead posts; auger on soil-only bays",
      "Boulder refusal in > 30% of trial points → consider precast on pad footings or shift boundary inward",
      "Black cotton or fill → deepen embedment 300 mm and widen bore before abandoning auger method",
      "Water table within embedment zone → gravel plug + uplift-resistant pedestal, not deeper auger alone",
    ],
  },
];

export function FoundationMethodsRockyContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Soil & Terrain"
      title="Foundation Methods for Rocky Terrain: Augering vs Doweling vs Drilling"
      intro="Telangana's industrial corridors sit on a mix of alluvial fill, laterite, and shallow bedrock — often within the same plot. A boundary design that assumes uniform auger holes will fail on the first rocky bay. This guide explains when to stay with auger-PCC foundations, when to dowel into bedrock, and when to relocate posts or change wall type entirely."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("foundation-methods-rocky-terrain")}
      whatsappTopic="boundary foundations on rocky terrain"
      jumpNavLabel="Jump to method"
      equipmentLinks={[
        { href: `/${locale}/equipment/posthole`, label: "Post hole digger hire" },
        { href: `/${locale}/equipment/jcb`, label: "JCB for site grading" },
      ]}
    />
  );
}

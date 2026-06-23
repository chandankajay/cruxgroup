"use client";

import {
  TechnicalGuideLayout,
  type GuideSection,
} from "./technical-guide/technical-guide-layout";
import { getRelatedTechnicalGuides } from "../../lib/seo/data/technical-guides";

const SECTIONS: readonly GuideSection[] = [
  {
    id: "telangana-monsoon",
    title: "Telangana Monsoon Pattern & Earthworks Risk",
    summary:
      "South-west monsoon typically active June–September across Telangana, with secondary rains in October–November. Earthworks during peak monsoon face moisture, access failure, and compaction rejection — but stopping all work for four months delays venture handovers. The goal is selective sequencing, not a full shutdown.",
    specs: [
      { label: "Peak risk months", value: "July–August — daily rain, saturated fill, roller ineffective" },
      { label: "Shoulder season", value: "June and September — workable windows between systems if drainage good" },
      { label: "Best earthworks window", value: "November–May — dry soil, reliable compaction, lower moisture content" },
      { label: "Black cotton soil", value: "Avoid fill placement when moisture > OMC; swell-shrink cycle destroys lifts" },
    ],
    applications: [
      "Layout ventures in Ghatkesar and Nallagandla racing for year-end possession",
      "NIMZ plots where factory timelines assume Q2 civil start",
    ],
  },
  {
    id: "safe-during-monsoon",
    title: "Works Safe to Continue During Monsoon",
    summary:
      "Not all machine hire stops in rain. Some activities tolerate wet conditions; others must pause to avoid rework cost exceeding the delay.",
    bullets: [
      "Rock breaking on exposed granite — rain cools bits; manage mud in spoil stockpile",
      "Clearing and grubbing — vegetation removal unaffected by light rain",
      "Tipper haul on paved internal roads — if road base exists and axle loads controlled",
      "Survey on compacted, drained platform — not on fresh uncompacted fill",
      "Compound wall pole casting in drilled holes — if bore walls stable and dewatered",
    ],
    notes: [
      "Light drizzle: JCB can continue cut on rock or clearing. Heavy rain: park machines on high ground — wet clutch and hydraulic contamination from wading are expensive failures.",
    ],
  },
  {
    id: "pause-during-monsoon",
    title: "Works to Pause Until Dry Weather",
    summary:
      "These activities produce rejectable work in wet season if rushed — the rework cost exceeds waiting two weeks for dry soil.",
    specs: [
      { label: "Fill placement & rolling", value: "Pause when rain forecast > 25 mm / 24 h or fill surface wet" },
      { label: "Fine grading to FGL", value: "Bucket finish on saturated soil creates ruts that surveyor rejects" },
      { label: "Murram import & spread", value: "Wet murram compacts to false density — tests fail after drying" },
      { label: "B.T. road laying", value: "Per IRC — no bitumen when ambient < 25°C or surface wet" },
      { label: "Black cotton excavation", value: "Stockpiled wet black cotton is unusable — allow to dry or replace" },
    ],
  },
  {
    id: "drainage-monsoon",
    title: "Temporary Drainage During Earthworks",
    summary:
      "Active earthworks sites without temporary drainage become lakes within one cloudburst. Plan V-ditches and sump pumps before monsoon mobilisation, not after the first flood.",
    specs: [
      { label: "Interim V-ditch", value: "300 mm deep min. at low plot edge; clear daily during rain events" },
      { label: "Sump pump", value: "Required in cut pockets below road level until permanent SWD live" },
      { label: "Fill protection", value: "Cover stockpiled murram with tarp; seed stockpiles erode into drains" },
      { label: "Access matting", value: "Hessian or geogrid on internal haul routes — prevents tipper bog-down" },
    ],
    applications: [
      "Low-lying Tukkuguda and Adibatla plots with high water table",
      "Cut-fill ventures where platform is above natural grade — protect downhill neighbour plots",
    ],
  },
  {
    id: "planning-calendar",
    title: "Suggested Earthworks Calendar for Venture Developers",
    summary:
      "Backward-plan from target possession date using this sequence. Add 3–4 week monsoon buffer on fill and compaction phases.",
    specs: [
      { label: "Nov–Jan", value: "Bulk cut-fill, rock breaking, main SWD trenches" },
      { label: "Feb–Apr", value: "Plot-level levelling, compaction testing, surveyor pegging" },
      { label: "May", value: "Internal W.B.M. / B.T. roads, boundary wall poles, handover batch 1" },
      { label: "Jun (early)", value: "Final drainage connections; stop fill by mid-June" },
      { label: "Jul–Aug", value: "Clearing only; drainage maintenance; no new fill" },
      { label: "Sep–Oct", value: "Resume fill and grading; second possession window" },
    ],
    notes: [
      "Factory industrial plots on NIMZ timeline often ignore monsoon pause at their cost — document moisture tests if client insists on wet-season compaction.",
    ],
  },
  {
    id: "moisture-testing",
    title: "Field Moisture Checks Before Compaction",
    summary:
      "Simple field tests prevent sending a roller onto wet fill. Failed compaction discovered after surveyor handover forces re-strip and re-roll entire lifts.",
    bullets: [
      "Grab sample at 150 mm depth — roll into ball; if water squeezes out, too wet",
      "Compare to Optimum Moisture Content from lab Proctor test on borrow material",
      "Nuclear gauge or sand replacement test only when field check passes",
      "Re-test after each rain event before resuming roller — surface dry ≠ lift dry",
    ],
  },
];

export function MonsoonEarthworksContent({
  locale,
}: {
  readonly locale: string;
}): React.ReactElement {
  return (
    <TechnicalGuideLayout
      locale={locale}
      eyebrow="Engineering Reference Library · Land Development"
      title="Monsoon Timing for Earthworks in Telangana"
      intro="Telangana's monsoon transforms venture earthworks from routine grading into mud, rework, and rejected compaction tests. Developers who plan around June–September weather finish layouts on schedule; those who treat monsoon as a minor inconvenience often re-strip entire fill sections in October. This guide separates works that can continue in rain from those that must wait, and provides a planning calendar aligned to HMDA layout possession targets."
      sections={SECTIONS}
      relatedGuides={getRelatedTechnicalGuides("monsoon-earthworks-timing-telangana")}
      whatsappTopic="earthworks and levelling schedule for my venture plot"
      jumpNavLabel="Monsoon planning topics"
      equipmentLinks={[
        { href: `/${locale}/articles/site-levelling-cut-fill-reference`, label: "Cut-fill & compaction reference" },
        { href: `/${locale}/equipment/jcb`, label: "JCB hire for dry-season grading" },
      ]}
    />
  );
}

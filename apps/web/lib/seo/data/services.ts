import type { Locale } from "../../locale";
import type { ServicePageSlug } from "../service-slugs";

export interface SiteService {
  readonly slug: ServicePageSlug;
  readonly image: string;
  readonly imageAlt: string;
  readonly eyebrow_en: string;
  readonly eyebrow_te: string;
  readonly title_en: string;
  readonly title_te: string;
  readonly body_en: string;
  readonly body_te: string;
  readonly specs_en: readonly string[];
  readonly specs_te: readonly string[];
  readonly seoTitle: string;
  readonly seoDescription: string;
  readonly whatsappMessage: string;
  readonly relatedGuideSlugs: readonly string[];
  readonly searchTerms: readonly string[];
}

export const SITE_SERVICES: readonly SiteService[] = [
  {
    slug: "compound-fence",
    image: "/images/posthole-section.png",
    imageAlt: "Compound fence installation with RCC posts and chain-link mesh in Telangana",
    eyebrow_en: "PERIMETER & COMPOUND",
    eyebrow_te: "కంపౌండ్ & ఫెన్సింగ్",
    title_en: "Compound Fence Services",
    title_te: "కంపౌండ్ ఫెన్స్ సేవలు",
    body_en:
      "End-to-end compound fencing for industrial plots, HMDA layouts, farms, and warehouses — RCC posts with chain-link mesh, corrugated MS sheet walls, precast H-column systems, and UPVC wired compounds. We handle post hole drilling, foundation casting, pole erection, and mesh or sheet fixing with trained crews across Hyderabad's ORR corridor and Telangana.",
    body_te:
      "Industrial plots, HMDA layouts, farms, warehouses kosam end-to-end compound fencing — RCC posts with chain-link, MS sheet walls, precast walls, UPVC compounds. Post holes, foundations, pole erection, mesh fixing — Hyderabad ORR corridor mariyu Telangana motham.",
    specs_en: [
      "RCC, MS sheet, precast & UPVC systems",
      "Post hole drilling & foundation work",
      "Industrial, farm & layout plots",
      "Available across Telangana",
    ],
    specs_te: [
      "RCC, MS sheet, precast & UPVC systems",
      "Post hole drilling & foundations",
      "Industrial, farm & layout plots",
      "Telangana motham andubatulo",
    ],
    seoTitle: "Compound Fence Services in Hyderabad & Telangana — Crux Group",
    seoDescription:
      "Book compound fence installation — RCC chain-link, MS sheet walls, precast compound walls, and UPVC wired fencing for industrial plots, farms, and layouts across Hyderabad and Telangana.",
    whatsappMessage:
      "Hi Crux Group, I need compound fence services for my plot. Please share availability and a site visit schedule.",
    relatedGuideSlugs: [
      "boundary-fencing-specifications",
      "compound-wall-types-compared",
      "boundary-post-spacing-foundations",
    ],
    searchTerms: [
      "compound fence",
      "compound wall",
      "boundary fencing",
      "perimeter fencing",
      "RCC chain link fence",
    ],
  },
  {
    slug: "ground-levelling",
    image: "/images/jcb-section.jpg",
    imageAlt: "JCB grading and ground levelling at a venture plot in Telangana",
    eyebrow_en: "SITE PREPARATION",
    eyebrow_te: "సైట్ సిద్ధం",
    title_en: "Ground Levelling Services",
    title_te: "గ్రౌండ్ లెవెల్లింగ్ సేవలు",
    body_en:
      "Cut-fill grading and platform formation for venture plots, factory sites, and layout developments — finished ground level (FGL) formation, drainage slopes, fill compaction, and JCB dozer grading. Ideal for raw land before survey pegging, compound wall construction, or foundation work across Telangana.",
    body_te:
      "Venture plots, factory sites, layout developments kosam cut-fill grading — FGL formation, drainage slopes, compaction, JCB dozer grading. Raw land nundi survey pegging, compound wall, foundations varaku — Telangana motham.",
    specs_en: [
      "Cut-fill & FGL platform formation",
      "Drainage slopes & compaction",
      "JCB dozer & grader operators",
      "Venture & industrial plots",
    ],
    specs_te: [
      "Cut-fill & FGL platform formation",
      "Drainage slopes & compaction",
      "JCB dozer operators",
      "Venture & industrial plots",
    ],
    seoTitle: "Ground Levelling Services in Hyderabad & Telangana — Crux Group",
    seoDescription:
      "Book ground levelling and site grading for venture plots, industrial platforms, and layout developments — cut-fill balance, FGL formation, and compaction across Hyderabad and Telangana.",
    whatsappMessage:
      "Hi Crux Group, I need ground levelling for my plot. Please share availability and an estimate after site visit.",
    relatedGuideSlugs: [
      "site-levelling-cut-fill-reference",
      "land-development-raw-to-survey-ready",
      "monsoon-earthworks-timing-telangana",
    ],
    searchTerms: [
      "ground levelling",
      "site levelling",
      "plot levelling",
      "cut fill grading",
      "FGL formation",
    ],
  },
  {
    slug: "debris-clearing",
    image: "/images/hero-excavator.jpg",
    imageAlt: "Site debris clearing with excavator and tipper at a construction plot in Telangana",
    eyebrow_en: "SITE CLEARING",
    eyebrow_te: "సైట్ క్లియరింగ్",
    title_en: "Debris Clearing Services",
    title_te: "డెబ్రిస్ క్లియరింగ్ సేవలు",
    body_en:
      "Vegetation removal, construction debris haul-off, stump clearing, and surface boulder disposal for raw venture plots and redevelopment sites. We mobilise JCB, dozer blades, and tippers to clear the net earthworks footprint before levelling or fencing — preventing organic matter burial and settlement issues downstream.",
    body_te:
      "Raw venture plots, redevelopment sites kosam vegetation removal, debris haul-off, stump clearing, boulder disposal. JCB, dozer, tippers — levelling or fencing mundu site clear cheyadam. Telangana motham.",
    specs_en: [
      "Vegetation & stump removal",
      "Construction debris haul-off",
      "JCB, dozer & tipper mobilisation",
      "Pre-levelling site clearing",
    ],
    specs_te: [
      "Vegetation & stump removal",
      "Construction debris haul-off",
      "JCB, dozer & tipper mobilisation",
      "Pre-levelling site clearing",
    ],
    seoTitle: "Debris Clearing Services in Hyderabad & Telangana — Crux Group",
    seoDescription:
      "Book debris clearing and site vegetation removal for venture plots and construction sites — haul-off, stump clearing, and surface boulder disposal across Hyderabad and Telangana.",
    whatsappMessage:
      "Hi Crux Group, I need debris clearing for my site. Please share crew availability and tipper mobilisation options.",
    relatedGuideSlugs: [
      "land-development-raw-to-survey-ready",
      "hmda-layout-venture-handover-checklist",
    ],
    searchTerms: [
      "debris clearing",
      "site clearing",
      "vegetation removal",
      "construction debris removal",
      "plot clearing",
    ],
  },
  {
    slug: "silent-rock-breaking",
    image: "/images/jcb-section.jpg",
    imageAlt: "JCB with hydraulic rock breaker for silent rock breaking on a Telangana venture plot",
    eyebrow_en: "HARD STRATA",
    eyebrow_te: "కఠిన నేల",
    title_en: "Silent Rock Breaking Services",
    title_te: "సైలెంట్ రాక్ బ్రేకింగ్ సేవలు",
    body_en:
      "Hydraulic rock breaking on granite and laterite hardpan without blasting — JCB-mounted silent breakers for venture plots, industrial sites, and layout earthworks where explosives are restricted. Sequences hard strata reduction before cut-fill levelling, with spoil management and boulder removal across Telangana.",
    body_te:
      "Granite, laterite hardpan lo blasting lekunda hydraulic rock breaking — JCB silent breakers venture plots, industrial sites kosam. Cut-fill levelling mundu hard strata reduce cheyadam — Telangana motham.",
    specs_en: [
      "Silent hydraulic rock breaker",
      "No blasting — urban & layout safe",
      "Granite & laterite hard strata",
      "Pre-levelling site preparation",
    ],
    specs_te: [
      "Silent hydraulic rock breaker",
      "Blasting lekunda — layout safe",
      "Granite & laterite hard strata",
      "Pre-levelling site prep",
    ],
    seoTitle: "Silent Rock Breaking Services in Hyderabad & Telangana — Crux Group",
    seoDescription:
      "Book silent hydraulic rock breaking for granite and hard strata on venture plots — JCB rock breaker without blasting, ideal for layouts and industrial sites across Hyderabad and Telangana.",
    whatsappMessage:
      "Hi Crux Group, I need silent rock breaking on my plot. Please share JCB rock breaker availability and site assessment options.",
    relatedGuideSlugs: [
      "rock-breaking-hard-strata-site-prep",
      "foundation-methods-rocky-terrain",
      "land-development-raw-to-survey-ready",
    ],
    searchTerms: [
      "rock breaking",
      "silent rock breaking",
      "hydraulic rock breaker",
      "hard strata excavation",
      "JCB rock breaker",
    ],
  },
];

export function getServiceBySlug(slug: string): SiteService | undefined {
  return SITE_SERVICES.find((s) => s.slug === slug);
}

export function getAllServiceSlugs(): ServicePageSlug[] {
  return SITE_SERVICES.map((s) => s.slug);
}

export function getServiceTitle(service: SiteService, locale: Locale): string {
  return locale === "te" ? service.title_te : service.title_en;
}

export function getServiceBody(service: SiteService, locale: Locale): string {
  return locale === "te" ? service.body_te : service.body_en;
}

export function getServiceSpecs(service: SiteService, locale: Locale): string[] {
  return [...(locale === "te" ? service.specs_te : service.specs_en)];
}

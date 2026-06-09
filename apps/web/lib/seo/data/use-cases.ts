export interface UseCase {
  slug: string;
  displayName: string;
  displayName_te: string;
  searchTerms: string[];
  equipment: string[];
  description: string;
  description_te: string;
  locations: string[];
  disclaimer?: string;
  isPartnerService?: boolean;
}

export const USE_CASES: UseCase[] = [
  {
    slug: "hole-digging",
    displayName: "Hole Digging",
    displayName_te: "గుంతలు తవ్వడం",
    searchTerms: [
      "hole digging",
      "hole digger hire",
      "hole digger near me",
      "manual hole digging machine",
      "auger hire",
    ],
    equipment: ["posthole"],
    description:
      "Our tractor-mounted post hole digger creates precise holes for fencing, compound walls, solar foundations, and telecom poles. We handle all depths from 3 feet to 12 feet across Telangana.",
    description_te:
      "మా ట్రాక్టర్ మౌంటెడ్ పోస్ట్ హోల్ డిగ్గర్ ఫెన్సింగ్, కాంపౌండ్ వాల్, సోలార్ ఫౌండేషన్ మరియు టెలికాం పోల్స్ కోసం ఖచ్చితమైన గుంతలు తవ్వుతుంది.",
    locations: [
      "kothur",
      "shadnagar",
      "shamshabad",
      "kokapet",
      "tukkuguda",
      "adibatla",
      "nallagandla",
      "narsingi",
    ],
    isPartnerService: false,
  },
  {
    slug: "earthing-rod-pits",
    displayName: "Earthing Rod Pits",
    displayName_te: "ఎర్తింగ్ పిట్స్",
    searchTerms: [
      "earthing rod pits",
      "earthing pit digging",
      "grounding pits",
      "electrical earthing holes",
      "earthing pit contractor",
    ],
    equipment: ["posthole"],
    description:
      "Earthing rod pits require precise depth and diameter — our post hole digger handles electrical earthing pit requirements for residential, commercial, and industrial projects across Hyderabad and Telangana.",
    description_te:
      "ఎర్తింగ్ రాడ్ పిట్స్‌కు ఖచ్చితమైన లోతు మరియు వ్యాసం అవసరం — మా పోస్ట్ హోల్ డిగ్గర్ Hyderabad మరియు Telangana అంతటా residential, commercial, industrial ప్రాజెక్టుల కోసం electrical earthing pit requirements ను నిర్వహిస్తుంది.",
    locations: [
      "kokapet",
      "tukkuguda",
      "adibatla",
      "patancheru",
      "sangareddy",
      "maheshwaram",
      "shadnagar",
      "ghatkesar",
    ],
    isPartnerService: false,
  },
  {
    slug: "foundation-holes",
    displayName: "Foundation Holes",
    displayName_te: "ఫౌండేషన్ హోల్స్",
    searchTerms: [
      "foundation holes",
      "column footing holes",
      "building foundation drilling",
      "pile holes",
      "foundation pit digging",
    ],
    equipment: ["posthole", "jcb"],
    description:
      "Column footing holes and pile foundations for residential and commercial construction — we operate across Hyderabad's growing peripheral corridors including Kokapet, Nallagandla, and Tukkuguda.",
    description_te:
      "Residential మరియు commercial construction కోసం column footing holes మరియు pile foundations — Kokapet, Nallagandla, Tukkuguda సహా Hyderabad peripheral corridors అంతటా మేము పని చేస్తాము.",
    locations: [
      "kokapet",
      "narsingi",
      "nallagandla",
      "tellapur",
      "bachupally",
      "ghatkesar",
      "shadnagar",
    ],
    isPartnerService: false,
  },
  {
    slug: "precast-wall-holes",
    displayName: "Compound Wall Pole Holes",
    displayName_te: "కాంపౌండ్ వాల్ హోల్స్",
    searchTerms: [
      "precast wall holes",
      "compound wall pole holes",
      "boundary wall drilling",
      "precast compound wall",
      "RCC wall poles",
    ],
    equipment: ["posthole"],
    description:
      "Plot boundary walls and precast compound walls require uniformly spaced pole holes — our post hole digger completes an entire plot boundary in hours, not days.",
    description_te:
      "Plot boundary walls మరియు precast compound walls కు samagaa spacing lo pole holes avasaram — ma post hole digger oka plot boundary ni rojula kadu, gantala lo poorthi chestundi.",
    locations: [
      "tukkuguda",
      "adibatla",
      "ibrahimpatnam",
      "turkayamjal",
      "ghatkesar",
      "maheshwaram",
      "kothur",
      "shadnagar",
    ],
    isPartnerService: false,
  },
  {
    slug: "excavation",
    displayName: "Site Excavation",
    displayName_te: "సైట్ తవ్వకం",
    searchTerms: [
      "excavation",
      "earth excavation",
      "site excavation",
      "basement excavation",
      "JCB excavation",
      "earthmoving Hyderabad",
    ],
    equipment: ["jcb"],
    description:
      "Site levelling, basement excavation, and earthmoving for residential plots and commercial construction — our JCB fleet covers the entire Hyderabad ORR corridor and NH44 belt.",
    description_te:
      "Residential plots మరియు commercial construction కోసం site levelling, basement excavation, earthmoving — ma JCB fleet Hyderabad ORR corridor మరియు NH44 belt motham cover chestundi.",
    locations: [
      "kokapet",
      "narsingi",
      "nallagandla",
      "adibatla",
      "maheshwaram",
      "ibrahimpatnam",
      "shadnagar",
      "jadcherla",
    ],
    isPartnerService: false,
  },
  {
    slug: "stone-breaking",
    displayName: "Rock and Stone Breaking",
    displayName_te: "రాయి పగులగొట్టడం",
    searchTerms: [
      "stone breaking",
      "rock breaking",
      "boulder breaking",
      "JCB rock breaker",
      "hard rock excavation",
      "rock breaker hire Hyderabad",
    ],
    equipment: ["jcb"],
    description:
      "Rock and boulder breaking for plots with hard strata — especially common in Chevella, Vikarabad, and Tandur corridors where granite outcrops slow construction.",
    description_te:
      "Hard strata unna plots lo rock and boulder breaking — Chevella, Vikarabad, Tandur corridors lo granite outcrops construction ni aalasyam chestayi, akkada idi chala common.",
    locations: [
      "chevella",
      "vikarabad",
      "tandur",
      "maheshwaram",
      "kongara-kalan",
      "ibrahimpatnam",
    ],
    isPartnerService: false,
  },
  {
    slug: "borewell-digging",
    displayName: "Borewell Drilling",
    displayName_te: "బోర్వెల్ తవ్వకం",
    searchTerms: [
      "borewell digging",
      "borewell drilling",
      "water bore holes",
      "borewell contractor Hyderabad",
      "borewell near me",
      "bore well drilling Telangana",
    ],
    equipment: ["borewell"],
    description:
      "Borewell drilling for residential plots, farms, and construction sites across Hyderabad and Telangana. We connect you with verified borewell contractors from our partner network — single point of contact, transparent pricing.",
    description_te:
      "Hyderabad మరియు Telangana lo residential plots, farms, construction sites kosam borewell drilling. Ma verified partner network nundi borewell contractors ni connect chestam — single point of contact, transparent pricing.",
    disclaimer:
      "Borewell drilling is fulfilled through our verified partner network. Availability subject to location and depth requirements. WhatsApp us for a quote.",
    isPartnerService: true,
    locations: [
      "kokapet",
      "tukkuguda",
      "nallagandla",
      "narsingi",
      "shadnagar",
      "maheshwaram",
      "adibatla",
      "kothur",
      "jadcherla",
      "mahbubnagar",
    ],
  },
];

export function getUseCaseBySlug(slug: string): UseCase | undefined {
  return USE_CASES.find((u) => u.slug === slug);
}

export function getUseCasesForLocation(locationSlug: string): UseCase[] {
  return USE_CASES.filter((u) => u.locations.includes(locationSlug));
}

export function getUseCasesForEquipment(equipmentSlug: string): UseCase[] {
  return USE_CASES.filter((u) => u.equipment.includes(equipmentSlug));
}

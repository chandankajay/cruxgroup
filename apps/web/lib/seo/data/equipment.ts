import type { Location } from "./locations";

export interface EquipmentSeoItem {
  slug: string;
  displayName: string;
  isPartnerService?: boolean;
  description: string;
  searchTerms: string[];
}

export const EQUIPMENT_SEO: EquipmentSeoItem[] = [
  {
    slug: "posthole",
    displayName: "Post Hole Digger",
    description:
      "Tractor-mounted auger for hole digging, earthing rod pits, foundation holes, and precast compound wall pole drilling across Hyderabad and Telangana.",
    searchTerms: [
      "hole digging",
      "auger hire",
      "earthing pit digging",
      "foundation holes",
      "precast wall holes",
    ],
  },
  {
    slug: "jcb",
    displayName: "JCB Backhoe Loader",
    description:
      "JCB backhoe for site excavation, stone breaking with rock breaker attachment, earthmoving, and site levelling across the ORR corridor and NH44 belt.",
    searchTerms: [
      "excavation",
      "stone breaking",
      "rock breaker hire",
      "earthmoving Hyderabad",
      "site levelling",
    ],
  },
  {
    slug: "borewell",
    displayName: "Borewell Drilling",
    isPartnerService: true,
    description:
      "Borewell drilling fulfilled through our verified partner network — residential plots, farms, and construction sites across Telangana with transparent pricing.",
    searchTerms: [
      "borewell digging",
      "borewell drilling",
      "water bore holes",
      "borewell contractor Hyderabad",
      "borewell near me",
    ],
  },
];

export function getEquipmentSeoBySlug(slug: string): EquipmentSeoItem | undefined {
  return EQUIPMENT_SEO.find((e) => e.slug === slug);
}

export interface EquipmentItem {
  name: string;
  useCase: string;
}

const BASE_EQUIPMENT: { name: string; defaultUseCase: string }[] = [
  {
    name: "JCB Backhoe Loader",
    defaultUseCase: "Site grading, trenching, and foundation digging",
  },
  {
    name: "Excavator",
    defaultUseCase: "Deep excavation, quarry work, and bulk earthmoving",
  },
  {
    name: "Mobile Crane",
    defaultUseCase: "Steel erection, heavy lifts, and building construction",
  },
  {
    name: "Post Hole Digger",
    defaultUseCase: "Fencing, solar foundations, and telecom pole holes",
  },
  {
    name: "Tractor",
    defaultUseCase: "Land preparation, agricultural work, and light hauling",
  },
  {
    name: "Tipper / Dumper",
    defaultUseCase: "Murram, aggregate, and construction material transport",
  },
];

const LOCATION_USE_CASES: Record<string, Partial<Record<string, string>>> = {
  shadnagar: {
    "JCB Backhoe Loader": "NIMZ industrial plot levelling and factory site grading",
    "Post Hole Digger": "Compound fencing for pharma and industrial layouts",
    Excavator: "Foundation excavation for factory buildings in the pharma corridor",
  },
  shamshabad: {
    "Mobile Crane": "Warehouse steel structure erection near the airport zone",
    "Tipper / Dumper": "Bulk material haul for logistics terminal construction",
    "JCB Backhoe Loader": "ORR-linked industrial park site preparation",
  },
  jadcherla: {
    Tractor: "Agricultural land conversion and plot boundary work",
    "JCB Backhoe Loader": "NH44 shoulder grading and highway service roads",
    "Post Hole Digger": "Farm fencing along converted layout plots",
  },
  mahbubnagar: {
    "JCB Backhoe Loader": "PMGSY rural road cutting and district road widening",
    "Tipper / Dumper": "Murram and aggregate haul for irrigation channel works",
    Tractor: "Agricultural fencing across the district belt",
  },
  nalgonda: {
    "JCB Backhoe Loader": "Residential layout grading along NH65",
    Excavator: "Drainage and canal-side earthwork",
    "Post Hole Digger": "Compound wall pole drilling for new layouts",
  },
  miryalaguda: {
    Tractor: "Sugarcane field access roads and agricultural prep",
    "Tipper / Dumper": "Cane haul support and murram transport for mill expansion",
    "JCB Backhoe Loader": "Market yard and irrigation canal maintenance",
  },
  suryapet: {
    "JCB Backhoe Loader": "District HQ complex site grading and road trenches",
    "Mobile Crane": "Multi-storey commercial building steel work on NH65",
    Excavator: "Foundation work for corridor commercial development",
  },
  vikarabad: {
    "JCB Backhoe Loader": "Hill-road grading for forest-area access routes",
    "Post Hole Digger": "Eco resort perimeter fencing and pole foundations",
    Tractor: "Resort site clearing on uneven terrain",
  },
  tandur: {
    Excavator: "Limestone quarry extraction and crusher feed operations",
    "Tipper / Dumper": "Bulk limestone and aggregate haul from quarry to plant",
    "JCB Backhoe Loader": "Cement plant civil works and stockyard grading",
  },
  warangal: {
    "Mobile Crane": "Smart City multi-storey building construction",
    "JCB Backhoe Loader": "Utility trenching for Smart City road upgrades",
    Excavator: "Industrial estate foundation and utility laying",
  },
  khammam: {
    Excavator: "Mining support earthwork and overburden removal",
    "Tipper / Dumper": "Coal belt haul road material transport",
    "JCB Backhoe Loader": "Industrial park grading on NH163",
  },
  nizamabad: {
    "JCB Backhoe Loader": "Canal modernisation and NH44 extension earthwork",
    Tractor: "Agricultural belt fencing and land preparation",
    "Tipper / Dumper": "Murram supply for market yard modernisation",
  },
  karimnagar: {
    "Mobile Crane": "TSSIDC industrial shed steel erection",
    "JCB Backhoe Loader": "Ring road and bypass grading",
    Excavator: "Factory foundation excavation in industrial corridor",
  },
  siddipet: {
    "JCB Backhoe Loader": "Mission Bhagiratha pipeline trenching",
    Excavator: "Reservoir and water infrastructure earthwork",
    "Tipper / Dumper": "Murram haul for government road upgradation",
  },
  kothur: {
    "JCB Backhoe Loader": "Warehouse plot grading along the ORR logistics belt",
    "Tipper / Dumper": "Material haul for highway-frontage industrial sites",
    "Mobile Crane": "Steel work for cold storage and warehouse builds",
  },
};

export function getEquipmentForLocation(location: Location): EquipmentItem[] {
  const overrides = LOCATION_USE_CASES[location.slug] ?? {};

  return BASE_EQUIPMENT.map((item) => ({
    name: item.name,
    useCase:
      overrides[item.name] ??
      `${item.defaultUseCase} — in demand for ${location.equipmentDemand.toLowerCase()}`,
  }));
}

export type LocationTier =
  | "hyderabad-prime"
  | "orr-corridor"
  | "district-hq"
  | "industrial-belt";

export interface Location {
  slug: string;
  displayName: string;
  district: string;
  description: string;
  nearbyAreas: string[];
  majorProjects: string[];
  equipmentDemand: string;
  distanceFromHyderabad: string;
  nhCorridor: string;
  localContext: string;
  tier: LocationTier;
  searchTerms: string[];
  useCaseSlugs: string[];
  priority: 1 | 2 | 3;
  needsTranslation?: boolean;
  description_te?: string;
  localContext_te?: string;
}

export function parseDistanceKm(distance: string): number {
  return parseInt(distance.replace(/[^\d]/g, ""), 10) || 999;
}

export function resolveNearbySlug(areaName: string): string | undefined {
  const asSlug = areaName.toLowerCase().replace(/\s+/g, "-");
  const bySlug = LOCATIONS.find((l) => l.slug === asSlug);
  if (bySlug) return bySlug.slug;
  return LOCATIONS.find(
    (l) => l.displayName.toLowerCase() === areaName.toLowerCase(),
  )?.slug;
}

export function getLocationsByTier(tier: LocationTier): Location[] {
  return LOCATIONS.filter((l) => l.tier === tier);
}

export const LOCATIONS: Location[] = [
  {
    slug: "kothur",
    displayName: "Kothur",
    district: "Ranga Reddy",
    description:
      "Kothur sits on the Hyderabad–Mumbai industrial corridor and has become a logistics and warehousing hub as ORR connectivity improved. Pharma SEZ activity and plot developments along the highway keep earthmoving and lifting equipment in steady demand.",
    nearbyAreas: ["Shamshabad", "Shadnagar", "Maheshwaram", "Chevella", "Tukkuguda"],
    majorProjects: [
      "ORR logistics warehousing belt",
      "Pharma and industrial plot developments",
      "Highway service road widening",
    ],
    equipmentDemand: "JCB for site grading, tippers for material haul, cranes for warehouse steel work",
    distanceFromHyderabad: "35km",
    nhCorridor: "NH44",
    localContext:
      "Contractors working Kothur's warehouse and industrial layouts need machines on short notice — hauling from Hyderabad adds cost and delays. Local verified operators through Crux cut mobilisation time and keep projects on schedule.",
    tier: "district-hq",
    searchTerms: ["JCB hire Kothur", "warehouse grading", "logistics equipment rental", "hole digging"],
    useCaseSlugs: ["excavation", "hole-digging", "precast-wall-holes", "borewell-digging"],
    priority: 2,
    description_te:
      "Kothur Hyderabad–Mumbai industrial corridor meeda undi — ORR connectivity improve avvadam tho logistics mariyu warehousing hub ga mariindi. Pharma SEZ activity mariyu highway plot developments earthmoving mariyu lifting equipment ki steady demand create chestunnayi.",
    localContext_te:
      "Kothur warehouse mariyu industrial layouts lo pani chesina contractors ki machines short notice lo avasaram — Hyderabad nundi haul cheyadam cost mariyu delays penchutundi. Crux dwara local verified operators mobilisation time tagginchi projects schedule lo unchutaru.",
  },
  {
    slug: "shadnagar",
    displayName: "Shadnagar",
    district: "Ranga Reddy",
    description:
      "Shadnagar anchors the NIMZ industrial zone and the pharma corridor south of Hyderabad. Major plotted developments and factory construction along NH44 have turned this into one of Telangana's fastest-growing equipment markets.",
    nearbyAreas: ["Kothur", "Shamshabad", "Jadcherla", "Balanagar", "Kongara Kalan"],
    majorProjects: [
      "NIMZ National Investment and Manufacturing Zone",
      "Pharma corridor factory builds",
      "Residential layout earthwork along NH44",
    ],
    equipmentDemand: "JCB for industrial plot levelling, post hole diggers for compound fencing, excavators for foundations",
    distanceFromHyderabad: "50km",
    nhCorridor: "NH44",
    localContext:
      "NIMZ and plotted industrial expansion mean continuous trenching, grading, and fencing work. Shadnagar contractors book JCBs and post hole diggers weekly — junction hiring cannot keep pace with the project pipeline.",
    tier: "district-hq",
    searchTerms: ["JCB hire Shadnagar", "NIMZ equipment", "foundation holes", "hole digging"],
    useCaseSlugs: ["foundation-holes", "excavation", "hole-digging", "precast-wall-holes", "borewell-digging"],
    priority: 2,
    description_te:
      "Shadnagar NIMZ industrial zone mariyu Hyderabad dakshinam pharma corridor ni anchor chestundi. NH44 along major plotted developments mariyu factory construction Telangana lo fastest-growing equipment markets lo okati ga marchindi.",
    localContext_te:
      "NIMZ mariyu plotted industrial expansion continuous trenching, grading, fencing work create chestundi. Shadnagar contractors weekly JCBs mariyu post hole diggers book chestaru — junction hiring project pipeline pace match cheyadam lo struggle avutundi.",
  },
  {
    slug: "shamshabad",
    displayName: "Shamshabad",
    district: "Ranga Reddy",
    description:
      "Shamshabad's airport proximity drives logistics warehouses, cold storage, and ORR-linked industrial parks. Highway frontage projects and airport expansion works keep cranes and earthmovers busy year-round.",
    nearbyAreas: ["Kothur", "Maheshwaram", "Rajendranagar", "Shadnagar", "Ibrahimpatnam"],
    majorProjects: [
      "RGIA airport logistics zone",
      "ORR industrial warehousing",
      "Cold chain and freight terminal construction",
    ],
    equipmentDemand: "Cranes for steel structures, JCB for site prep, tippers for bulk material movement",
    distanceFromHyderabad: "30km",
    nhCorridor: "NH44 and ORR",
    localContext:
      "Airport-linked logistics construction runs on tight timelines. Shamshabad sites need equipment that arrives the same morning — not after a half-day round trip from central Hyderabad.",
    tier: "district-hq",
    searchTerms: ["crane rental Shamshabad", "airport logistics equipment", "JCB hire"],
    useCaseSlugs: ["excavation", "hole-digging"],
    priority: 2,
    description_te:
      "Shamshabad airport proximity logistics warehouses, cold storage, ORR-linked industrial parks ni drive chestundi. Highway frontage projects mariyu airport expansion works cranes mariyu earthmovers ni year-round busy ga unchutayi.",
    localContext_te:
      "Airport-linked logistics construction tight timelines meeda run avutundi. Shamshabad sites ki same morning equipment ravali — central Hyderabad nundi half-day round trip tarvata kadu.",
  },
  {
    slug: "jadcherla",
    displayName: "Jadcherla",
    district: "Mahbubnagar",
    description:
      "Jadcherla is a highway town on NH44 with a mix of agricultural land conversion and infrastructure upgrades. AIIMS Bibinagar nearby and canal-road projects bring contractors who need reliable daily equipment hire.",
    nearbyAreas: ["Shadnagar", "Mahbubnagar", "Bibinagar", "Balanagar", "Kodangal"],
    majorProjects: [
      "NH44 service road and bypass works",
      "AIIMS Bibinagar allied infrastructure",
      "Agricultural plot-to-layout conversions",
    ],
    equipmentDemand: "JCB for road shoulders and grading, tractors for land prep, post hole diggers for fencing",
    distanceFromHyderabad: "80km",
    nhCorridor: "NH44",
    localContext:
      "Jadcherla sits where agricultural earthwork meets highway infrastructure — contractors need versatile machines without paying Hyderabad mobilisation charges on every job.",
    tier: "district-hq",
    searchTerms: ["JCB hire Jadcherla", "NH44 equipment rental", "borewell digging"],
    useCaseSlugs: ["excavation", "borewell-digging"],
    priority: 2,
    description_te:
      "Jadcherla NH44 meeda highway town — agricultural land conversion mariyu infrastructure upgrades mix undi. AIIMS Bibinagar nearby mariyu canal-road projects reliable daily equipment hire avasaram unna contractors ni techutayi.",
    localContext_te:
      "Jadcherla agricultural earthwork mariyu highway infrastructure kalisina chot — contractors versatile machines avasaram, prati job ki Hyderabad mobilisation charges kattakunda.",
  },
  {
    slug: "mahbubnagar",
    displayName: "Mahbubnagar",
    district: "Mahbubnagar",
    description:
      "As district headquarters, Mahbubnagar sees steady government road construction, irrigation channel works, and municipal infrastructure upgrades. Rural road projects under PMGSY keep JCBs and tippers in constant use.",
    nearbyAreas: ["Jadcherla", "Wanaparthy", "Gadwal", "Kodangal", "Narayanpet"],
    majorProjects: [
      "District road widening and PMGSY rural roads",
      "Irrigation channel desilting and lining",
      "Government building and market yard works",
    ],
    equipmentDemand: "JCB for road cutting, tippers for murram haul, tractors for agricultural fencing",
    distanceFromHyderabad: "100km",
    nhCorridor: "NH44",
    localContext:
      "Mahbubnagar's government and irrigation pipeline creates predictable equipment demand across the district. Local booking with GST invoices helps contractors claim ITC on project costs.",
    tier: "district-hq",
    searchTerms: ["JCB hire Mahbubnagar", "PMGSY equipment", "borewell contractor"],
    useCaseSlugs: ["borewell-digging"],
    priority: 2,
    description_te:
      "District headquarters ga Mahbubnagar lo government road construction, irrigation channel works, municipal infrastructure upgrades steady ga kanipistayi. PMGSY rural road projects JCBs mariyu tippers ni constant use lo unchutayi.",
    localContext_te:
      "Mahbubnagar government mariyu irrigation pipeline district lo predictable equipment demand create chestundi. GST invoices tho local booking contractors ki project costs meeda ITC claim cheyadaniki help avutundi.",
  },
  {
    slug: "nalgonda",
    displayName: "Nalgonda",
    district: "Nalgonda",
    description:
      "Nalgonda town is seeing real estate growth alongside NH65 road widening and irrigation canal projects. Layout developers and PWD contractors compete for the same pool of earthmoving machines.",
    nearbyAreas: ["Miryalaguda", "Suryapet", "Devarakonda", "Bhongir", "Choutuppal"],
    majorProjects: [
      "NH65 four-laning and bypass",
      "Irrigation canal modernisation",
      "Residential layout developments",
    ],
    equipmentDemand: "JCB for layout grading, excavators for drainage, post hole diggers for compound walls",
    distanceFromHyderabad: "80km",
    nhCorridor: "NH65",
    localContext:
      "NH65 widening and layout boom mean Nalgonda contractors book equipment days in advance during peak season. Digital booking through Crux surfaces verified operators already working in the district.",
    tier: "district-hq",
    searchTerms: ["JCB hire Nalgonda", "layout grading", "compound wall holes"],
    useCaseSlugs: ["precast-wall-holes", "foundation-holes"],
    priority: 2,
    description_te:
      "Nalgonda town lo NH65 road widening mariyu irrigation canal projects tho paatu real estate growth kanipistundi. Layout developers mariyu PWD contractors okate earthmoving machines pool kosam compete chestunnaru.",
    localContext_te:
      "NH65 widening mariyu layout boom valla Nalgonda contractors peak season lo equipment days advance lo book chestaru. Crux digital booking district lo already pani chesina verified operators ni surface chestundi.",
  },
  {
    slug: "miryalaguda",
    displayName: "Miryalaguda",
    district: "Nalgonda",
    description:
      "Miryalaguda's sugar industry and irrigation network drive demand for agricultural and civil equipment. Factory expansions and canal maintenance keep tippers and tractors busy alongside conventional earthmovers.",
    nearbyAreas: ["Nalgonda", "Suryapet", "Kodad", "Huzurnagar", "Devarakonda"],
    majorProjects: [
      "Sugar mill capacity expansion",
      "Irrigation canal desilting",
      "Market yard and road upgrades",
    ],
    equipmentDemand: "Tractors and JCB for agricultural work, tippers for cane and murram haul",
    distanceFromHyderabad: "120km",
    nhCorridor: "NH65",
    localContext:
      "Sugar season and irrigation cycles create spikes in equipment demand that junction hiring cannot reliably serve. Miryalaguda contractors benefit from operators who already know local site conditions.",
    tier: "district-hq",
    searchTerms: ["tractor hire Miryalaguda", "JCB rental", "sugar mill equipment"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Miryalaguda sugar industry mariyu irrigation network agricultural mariyu civil equipment demand ni drive chestayi. Factory expansions mariyu canal maintenance tippers mariyu tractors ni conventional earthmovers tho paatu busy ga unchutayi.",
    localContext_te:
      "Sugar season mariyu irrigation cycles equipment demand lo spikes create chestayi — junction hiring reliably serve cheyadam lo struggle avutundi. Miryalaguda contractors local site conditions telisina operators tho benefit avutaru.",
  },
  {
    slug: "suryapet",
    displayName: "Suryapet",
    district: "Suryapet",
    description:
      "Suryapet on NH65 is experiencing a construction boom driven by new district HQ development and highway corridor growth. Road projects and commercial building activity keep cranes and JCBs in high demand.",
    nearbyAreas: ["Nalgonda", "Miryalaguda", "Khammam", "Kodad", "Huzurnagar"],
    majorProjects: [
      "New district headquarters complex",
      "NH65 corridor commercial development",
      "Smart city road and drainage works",
    ],
    equipmentDemand: "JCB for road and drainage, cranes for multi-storey builds, excavators for foundations",
    distanceFromHyderabad: "130km",
    nhCorridor: "NH65",
    localContext:
      "Suryapet's elevation to district HQ status accelerated public and private construction simultaneously. Equipment booked locally avoids the mobilisation premium contractors pay when sourcing from Hyderabad.",
    tier: "district-hq",
    searchTerms: ["JCB hire Suryapet", "crane rental NH65", "district HQ construction"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "NH65 meeda Suryapet new district HQ development mariyu highway corridor growth valla construction boom experience chestondi. Road projects mariyu commercial building activity cranes mariyu JCBs ki high demand create chestunnayi.",
    localContext_te:
      "Suryapet district HQ status elevation public mariyu private construction ni okesari accelerate chesindi. Local ga book chesina equipment Hyderabad nundi source chesinappudu contractors pay chese mobilisation premium avoid chestundi.",
  },
  {
    slug: "vikarabad",
    displayName: "Vikarabad",
    district: "Vikarabad",
    description:
      "Vikarabad marks the western ORR endpoint with forest-area development and eco-resort construction picking up pace. Hill-road grading and resort site preparation need specialised earthmoving on uneven terrain.",
    nearbyAreas: ["Tandur", "Chevella", "Shankarpalle", "Mominpet", "Pargi"],
    majorProjects: [
      "ORR western connectivity works",
      "Eco resort and farmhouse developments",
      "Forest road and watershed projects",
    ],
    equipmentDemand: "JCB for hill grading, post hole diggers for resort fencing, tractors for land clearing",
    distanceFromHyderabad: "75km",
    nhCorridor: "ORR and SH4",
    localContext:
      "Vikarabad's terrain makes operator skill as important as machine availability. Crux connects contractors with verified operators who have worked forest-edge and resort sites in the district.",
    tier: "district-hq",
    searchTerms: ["JCB hire Vikarabad", "hill grading", "stone breaking", "rock breaker"],
    useCaseSlugs: ["stone-breaking"],
    priority: 2,
    description_te:
      "Vikarabad western ORR endpoint ni mark chestundi — forest-area development mariyu eco-resort construction pace pick up avutondi. Hill-road grading mariyu resort site preparation uneven terrain meeda specialised earthmoving avasaram.",
    localContext_te:
      "Vikarabad terrain lo operator skill machine availability laage important. Crux district lo forest-edge mariyu resort sites lo pani chesina verified operators ni contractors tho connect chestundi.",
  },
  {
    slug: "tandur",
    displayName: "Tandur",
    district: "Vikarabad",
    description:
      "Tandur is Telangana's cement and quarry belt — limestone extraction, crusher plants, and bulk material movement define the local equipment market. This is one of the most heavy-equipment-intensive towns in the state.",
    nearbyAreas: ["Vikarabad", "Pargi", "Kodangal", "Mahbubnagar", "Zaheerabad"],
    majorProjects: [
      "Cement plant expansion and quarry deepening",
      "Limestone conveyor and stockyard construction",
      "Quarry haul road maintenance",
    ],
    equipmentDemand: "Excavators and tippers for quarry operations, JCB for plant civil works, cranes for plant maintenance",
    distanceFromHyderabad: "110km",
    nhCorridor: "NH163",
    localContext:
      "Tandur's quarry and cement operations run 24-hour cycles — equipment downtime costs lakhs per day. Local tippers and excavators with experienced operators are essential, not optional.",
    tier: "district-hq",
    searchTerms: ["excavator hire Tandur", "quarry equipment", "stone breaking"],
    useCaseSlugs: ["stone-breaking"],
    priority: 2,
    description_te:
      "Tandur Telangana cement mariyu quarry belt — limestone extraction, crusher plants, bulk material movement local equipment market ni define chestayi. State lo most heavy-equipment-intensive towns lo okati.",
    localContext_te:
      "Tandur quarry mariyu cement operations 24-hour cycles lo run avutayi — equipment downtime roju lakhs cost avutundi. Experienced operators tho local tippers mariyu excavators essential, optional kadu.",
  },
  {
    slug: "warangal",
    displayName: "Warangal",
    district: "Warangal",
    description:
      "Warangal is Telangana's second-largest city with Smart City projects, industrial estate expansion, and NH163 corridor development. Multi-storey construction and road infrastructure create diverse equipment needs.",
    nearbyAreas: ["Hanamkonda", "Kazipet", "Jangaon", "Parkal", "Narsampet"],
    majorProjects: [
      "Smart City road and utility upgrades",
      "Kakatiya Industrial Estate expansion",
      "NH163 highway corridor development",
    ],
    equipmentDemand: "Cranes for building construction, JCB for Smart City trenches, excavators for utility laying",
    distanceFromHyderabad: "145km",
    nhCorridor: "NH163",
    localContext:
      "Warangal's Smart City pipeline runs parallel with private real estate — both need cranes and earthmovers on overlapping schedules. A verified local fleet reduces booking friction for PWD and private contractors alike.",
    tier: "district-hq",
    searchTerms: ["crane rental Warangal", "Smart City equipment", "JCB hire"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Warangal Telangana second-largest city — Smart City projects, industrial estate expansion, NH163 corridor development undi. Multi-storey construction mariyu road infrastructure diverse equipment needs create chestayi.",
    localContext_te:
      "Warangal Smart City pipeline private real estate tho parallel ga run avutundi — rendu ki cranes mariyu earthmovers overlapping schedules lo avasaram. Verified local fleet PWD mariyu private contractors rendu ki booking friction tagginchutundi.",
  },
  {
    slug: "khammam",
    displayName: "Khammam",
    district: "Khammam",
    description:
      "Khammam sits on NH163 in the coal belt with mining-adjacent infrastructure, industrial parks, and heavy haul roads. Quarry, mining support, and bulk material operations make this a heavy-equipment-intensive market.",
    nearbyAreas: ["Suryapet", "Bhadrachalam", "Wyra", "Kothagudem", "Madhira"],
    majorProjects: [
      "Coal belt haul road construction",
      "Industrial park earthwork",
      "NH163 bridge and embankment works",
    ],
    equipmentDemand: "Excavators and tippers for mining support, JCB for haul roads, cranes for industrial structures",
    distanceFromHyderabad: "195km",
    nhCorridor: "NH163",
    localContext:
      "Khammam's mining and industrial economy demands rugged equipment with operators who understand heavy-load sites. Bringing machines from Hyderabad adds freight cost that erodes contractor margins on already tight bids.",
    tier: "district-hq",
    searchTerms: ["excavator hire Khammam", "mining equipment", "tipper rental"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Khammam NH163 meeda coal belt lo undi — mining-adjacent infrastructure, industrial parks, heavy haul roads undi. Quarry, mining support, bulk material operations heavy-equipment-intensive market ga marchindi.",
    localContext_te:
      "Khammam mining mariyu industrial economy rugged equipment avasaram — heavy-load sites telisina operators tho. Hyderabad nundi machines techadam freight cost penchutundi, tight bids meeda contractor margins erode avutayi.",
  },
  {
    slug: "nizamabad",
    displayName: "Nizamabad",
    district: "Nizamabad",
    description:
      "Nizamabad anchors North Telangana with irrigation projects, NH44 extension works, and agricultural belt development. Canal modernisation and market infrastructure keep earthmovers busy across the district.",
    nearbyAreas: ["Kamareddy", "Armoor", "Bodhan", "Jagtial", "Basar"],
    majorProjects: [
      "NH44 extension and bypass works",
      "Mission Kakatiya tank restoration",
      "Agricultural market yard modernisation",
    ],
    equipmentDemand: "JCB for canal earthwork, tractors for agricultural fencing, tippers for murram and aggregate",
    distanceFromHyderabad: "175km",
    nhCorridor: "NH44",
    localContext:
      "North Telangana irrigation and highway projects create equipment demand far from Hyderabad's rental yards. Nizamabad contractors need local operators who can mobilise without a full-day lead time.",
    tier: "district-hq",
    searchTerms: ["JCB hire Nizamabad", "canal earthwork", "NH44 equipment"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Nizamabad North Telangana ni anchor chestundi — irrigation projects, NH44 extension works, agricultural belt development undi. Canal modernisation mariyu market infrastructure district lo earthmovers ni busy ga unchutayi.",
    localContext_te:
      "North Telangana irrigation mariyu highway projects Hyderabad rental yards nundi dooram equipment demand create chestayi. Nizamabad contractors full-day lead time lekunda mobilise ayye local operators avasaram.",
  },
  {
    slug: "karimnagar",
    displayName: "Karimnagar",
    district: "Karimnagar",
    description:
      "Karimnagar's industrial corridor includes TSSIDC estates, ongoing road projects, and residential real estate growth. Factory construction and highway upgrades sustain demand for cranes and earthmovers.",
    nearbyAreas: ["Jagtial", "Peddapalli", "Huzurabad", "Sircilla", "Manthani"],
    majorProjects: [
      "TSSIDC industrial estate expansion",
      "Karimnagar bypass and ring road",
      "Residential layout developments",
    ],
    equipmentDemand: "Cranes for industrial sheds, JCB for road projects, excavators for factory foundations",
    distanceFromHyderabad: "165km",
    nhCorridor: "NH563",
    localContext:
      "Karimnagar's TSSIDC pipeline and ring road project overlap in peak construction season. Verified operators with GST billing help contractors manage costs on fixed-price government tenders.",
    tier: "district-hq",
    searchTerms: ["crane rental Karimnagar", "TSSIDC equipment", "JCB hire"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Karimnagar industrial corridor lo TSSIDC estates, ongoing road projects, residential real estate growth undi. Factory construction mariyu highway upgrades cranes mariyu earthmovers demand ni sustain chestayi.",
    localContext_te:
      "Karimnagar TSSIDC pipeline mariyu ring road project peak construction season lo overlap avutayi. GST billing tho verified operators fixed-price government tenders meeda contractors costs manage cheyadaniki help avutaru.",
  },
  {
    slug: "siddipet",
    displayName: "Siddipet",
    district: "Siddipet",
    description:
      "Siddipet has seen massive infrastructure investment including Mission Bhagiratha water projects, district hospital complexes, and road network upgrades. Government-led construction keeps equipment demand consistently high.",
    nearbyAreas: ["Gajwel", "Husnabad", "Sircilla", "Jagdevpur", "Cheriyal"],
    majorProjects: [
      "Mission Bhagiratha pipeline and reservoir works",
      "District hospital and government complex construction",
      "Intra-district road upgradation",
    ],
    equipmentDemand: "JCB for pipeline trenches, excavators for reservoir earthwork, tippers for murram supply",
    distanceFromHyderabad: "100km",
    nhCorridor: "SH1",
    localContext:
      "Mission Bhagiratha and government building projects in Siddipet run on milestone schedules — equipment delays trigger penalty clauses. Local booking through Crux gives contractors same-day mobilisation options.",
    tier: "district-hq",
    searchTerms: ["JCB hire Siddipet", "pipeline trenching", "Mission Bhagiratha equipment"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Siddipet lo Mission Bhagiratha water projects, district hospital complexes, road network upgrades tho massive infrastructure investment kanipistundi. Government-led construction equipment demand ni consistently high ga unchutundi.",
    localContext_te:
      "Siddipet lo Mission Bhagiratha mariyu government building projects milestone schedules meeda run avutayi — equipment delays penalty clauses trigger chestayi. Crux local booking contractors ki same-day mobilisation options istundi.",
  },
  // ── Hyderabad Prime ──
  {
    slug: "kokapet",
    displayName: "Kokapet",
    district: "Ranga Reddy",
    description:
      "Kokapet and Neopolis have become Hyderabad's luxury high-rise frontier — skyscraper foundations, Financial District fringe towers, and premium villa layouts drive intense demand for post hole diggers and JCBs. Every new tower block needs earthing pits, column footing holes, and basement excavation before steel rises.",
    nearbyAreas: ["Narsingi", "Nallagandla", "Tellapur", "Gachibowli", "Manikonda"],
    majorProjects: [
      "Neopolis luxury high-rise cluster",
      "Financial District fringe commercial towers",
      "Premium gated community layouts",
    ],
    equipmentDemand: "Post hole diggers for foundation and earthing pits, JCB for basement excavation, cranes for high-rise steel",
    distanceFromHyderabad: "15km",
    nhCorridor: "ORR/SH1",
    localContext:
      "Kokapet contractors work on tight vertical timelines — a delayed auger machine blocks electrical earthing sign-off and pushes back entire floor cycles. Local operators who know Neopolis site access rules save hours on every mobilisation.",
    tier: "hyderabad-prime",
    searchTerms: ["hole digging Kokapet", "earthing pit digging", "foundation holes", "auger rental"],
    useCaseSlugs: ["hole-digging", "earthing-rod-pits", "foundation-holes", "excavation", "borewell-digging"],
    priority: 1,
    description_te:
      "Kokapet మరియు Neopolis Hyderabad luxury high-rise frontier ga mariindi — skyscraper foundations, Financial District fringe towers, premium villa layouts post hole diggers మరియు JCBs ki intense demand create chestunnayi.",
    localContext_te:
      "Kokapet contractors tight vertical timelines meeda pani chestaru — delayed auger machine electrical earthing sign-off ni apekshistundi. Neopolis site access rules telisina local operators prati mobilisation lo gantala save chestaru.",
  },
  {
    slug: "narsingi",
    displayName: "Narsingi",
    district: "Ranga Reddy",
    description:
      "Narsingi on ORR west is a villa and gated community hotspot — plotted layouts, compound walls, and foundation work for premium homes keep post hole diggers and JCBs booked through the week.",
    nearbyAreas: ["Kokapet", "Nallagandla", "Tellapur", "Gandipet", "Manikonda"],
    majorProjects: [
      "ORR west villa layout developments",
      "Gated community infrastructure",
      "Premium residential plotted layouts",
    ],
    equipmentDemand: "Post hole diggers for compound walls and foundations, JCB for site grading",
    distanceFromHyderabad: "20km",
    nhCorridor: "ORR",
    localContext:
      "Narsingi's villa layouts need uniform pole holes along long compound perimeters — manual digging cannot keep pace with layout handover deadlines that developers set quarter by quarter.",
    tier: "hyderabad-prime",
    searchTerms: ["foundation holes Narsingi", "compound wall holes", "JCB hire ORR west"],
    useCaseSlugs: ["foundation-holes", "hole-digging", "excavation"],
    priority: 2,
    description_te:
      "ORR west meeda Narsingi villa mariyu gated community hotspot — plotted layouts, compound walls, premium homes foundation work post hole diggers mariyu JCBs ni week motham booked ga unchutayi.",
    localContext_te:
      "Narsingi villa layouts long compound perimeters along uniform pole holes avasaram — manual digging layout handover deadlines quarter by quarter set chesina developers pace match cheyadam lo struggle avutundi.",
  },
  {
    slug: "tellapur",
    displayName: "Tellapur",
    district: "Sangareddy",
    description:
      "Tellapur sits on Hyderabad's western residential corridor with HMDA-approved layouts and IT-professional housing demand. Foundation holes, site excavation, and compound wall drilling are everyday contractor requirements.",
    nearbyAreas: ["Nallagandla", "Narsingi", "Patancheru", "Gachibowli", "Bachupally"],
    majorProjects: [
      "Western corridor residential boom",
      "HMDA approved plotted layouts",
      "IT corridor fringe housing projects",
    ],
    equipmentDemand: "Post hole diggers for foundations, JCB for layout grading",
    distanceFromHyderabad: "25km",
    nhCorridor: "ORR",
    localContext:
      "Tellapur's western corridor boom means contractors often run parallel layout sites — booking verified local auger and JCB operators avoids the ORR traffic penalty of hauling from central Hyderabad.",
    tier: "hyderabad-prime",
    searchTerms: ["foundation holes Tellapur", "layout excavation", "auger hire"],
    useCaseSlugs: ["foundation-holes", "excavation"],
    priority: 2,
    description_te:
      "Tellapur Hyderabad western residential corridor meeda undi — HMDA-approved layouts mariyu IT-professional housing demand undi. Foundation holes, site excavation, compound wall drilling everyday contractor requirements.",
    localContext_te:
      "Tellapur western corridor boom contractors parallel layout sites run chestaru — verified local auger mariyu JCB operators book chesina central Hyderabad nundi haul chese ORR traffic penalty avoid avutundi.",
  },
  {
    slug: "nallagandla",
    displayName: "Nallagandla",
    district: "Ranga Reddy",
    description:
      "Nallagandla's ORR west plotted layouts are among Hyderabad's fastest-selling — HMDA-approved ventures need compound wall pole holes, foundation drilling, and site levelling before buyers take possession.",
    nearbyAreas: ["Tellapur", "Narsingi", "Kokapet", "Bachupally", "Patancheru"],
    majorProjects: [
      "HMDA approved plotted layouts",
      "ORR west residential ventures",
      "Compound wall and infrastructure packages",
    ],
    equipmentDemand: "Post hole diggers for boundary walls and foundations, JCB for plot grading",
    distanceFromHyderabad: "22km",
    nhCorridor: "ORR",
    localContext:
      "Layout developers in Nallagandla schedule compound wall and foundation work in phases — a post hole digger that completes 200 poles in a day is worth more than a week of manual labour on tight handover timelines.",
    tier: "hyderabad-prime",
    searchTerms: ["hole digging Nallagandla", "foundation holes", "precast wall holes", "borewell digging"],
    useCaseSlugs: ["hole-digging", "foundation-holes", "borewell-digging"],
    priority: 2,
    description_te:
      "Nallagandla ORR west plotted layouts Hyderabad lo fastest-selling ventures lo okati — HMDA-approved ventures ki buyers possession teesukune mundu compound wall pole holes, foundation drilling, site levelling avasaram.",
    localContext_te:
      "Nallagandla layout developers compound wall mariyu foundation work phases lo schedule chestaru — oka roju lo 200 poles complete chese post hole digger tight handover timelines meeda week manual labour kante ekkuva value istundi.",
  },
  {
    slug: "tukkuguda",
    displayName: "Tukkuguda",
    district: "Ranga Reddy",
    description:
      "Tukkuguda anchors the data centre corridor and Fab City belt — warehouse construction, logistics sheds, and industrial plot fencing create year-round demand for auger machines, JCBs, and earthing pit digging.",
    nearbyAreas: ["Ghatkesar", "Kothur", "Adibatla", "Maheshwaram", "Ibrahimpatnam"],
    majorProjects: [
      "Data centre corridor construction",
      "Fab City industrial sheds",
      "Warehouse and logistics boom",
    ],
    equipmentDemand: "Post hole diggers for industrial fencing and earthing, JCB for warehouse grading",
    distanceFromHyderabad: "25km",
    nhCorridor: "ORR east",
    localContext:
      "Tukkuguda's data centre and warehouse pipeline runs 24/7 — contractors need auger and JCB operators who can mobilise at dawn before shift changes, not brokers who promise machines from Secunderabad.",
    tier: "hyderabad-prime",
    searchTerms: ["auger rental Tukkuguda", "earthing pit digging", "hole digging", "warehouse excavation"],
    useCaseSlugs: ["hole-digging", "earthing-rod-pits", "precast-wall-holes", "borewell-digging"],
    priority: 1,
    description_te:
      "Tukkuguda data centre corridor mariyu Fab City belt ni anchor chestundi — warehouse construction, logistics sheds, industrial plot fencing auger machines, JCBs, earthing pit digging ki year-round demand create chestundi.",
    localContext_te:
      "Tukkuguda data centre mariyu warehouse pipeline 24/7 run avutundi — contractors ki shift changes mundu break of dawn lo mobilise ayye auger mariyu JCB operators avasaram.",
  },
  {
    slug: "ghatkesar",
    displayName: "Ghatkesar",
    district: "Medchal-Malkajgiri",
    description:
      "Ghatkesar's east Hyderabad layout boom brings hundreds of plotted ventures online each year — foundation holes, compound wall drilling, and site excavation are the first machines on every new site.",
    nearbyAreas: ["Tukkuguda", "Turkayamjal", "Medchal", "Uppal", "Boduppal"],
    majorProjects: [
      "East Hyderabad layout boom",
      "Residential plotted developments",
      "ORR east connectivity projects",
    ],
    equipmentDemand: "Post hole diggers for layouts, JCB for grading, foundation drilling",
    distanceFromHyderabad: "30km",
    nhCorridor: "ORR east",
    localContext:
      "Ghatkesar layout promoters compete on handover speed — contractors who book local post hole diggers and JCBs through Crux finish boundary and grading work before monsoon windows close.",
    tier: "hyderabad-prime",
    searchTerms: ["foundation holes Ghatkesar", "earthing pit digging", "layout excavation"],
    useCaseSlugs: ["foundation-holes", "earthing-rod-pits", "precast-wall-holes"],
    priority: 2,
    description_te:
      "Ghatkesar east Hyderabad layout boom prati year hundreds plotted ventures online techutundi — foundation holes, compound wall drilling, site excavation prati new site meeda first machines.",
    localContext_te:
      "Ghatkesar layout promoters handover speed meeda compete chestaru — Crux dwara local post hole diggers mariyu JCBs book chesina contractors monsoon windows close avvakamunde boundary mariyu grading work complete chestaru.",
  },
  {
    slug: "bachupally",
    displayName: "Bachupally",
    district: "Medchal-Malkajgiri",
    description:
      "Bachupally's northwest residential boom and IT corridor proximity drive foundation work, basement excavation, and compound wall pole holes across premium villa and apartment projects.",
    nearbyAreas: ["Nallagandla", "Medchal", "Patancheru", "Miyapur", "Kompally"],
    majorProjects: [
      "Northwest residential boom",
      "IT corridor fringe housing",
      "Premium villa and apartment projects",
    ],
    equipmentDemand: "JCB for basement excavation, post hole diggers for foundations and fencing",
    distanceFromHyderabad: "22km",
    nhCorridor: "ORR north",
    localContext:
      "Bachupally contractors often split crews between apartment basements and villa compound walls — having a verified JCB and auger operator on call locally beats coordinating two separate brokers from Hyderabad.",
    tier: "hyderabad-prime",
    searchTerms: ["foundation holes Bachupally", "basement excavation", "JCB hire"],
    useCaseSlugs: ["foundation-holes", "excavation"],
    priority: 2,
    description_te:
      "Bachupally northwest residential boom mariyu IT corridor proximity premium villa mariyu apartment projects lo foundation work, basement excavation, compound wall pole holes drive chestayi.",
    localContext_te:
      "Bachupally contractors apartment basements mariyu villa compound walls madhya crews split chestaru — local ga on call unna verified JCB mariyu auger operator Hyderabad nundi rendu separate brokers coordinate cheyadam kante better.",
  },
  // ── ORR Corridor ──
  {
    slug: "adibatla",
    displayName: "Adibatla",
    district: "Ranga Reddy",
    description:
      "Adibatla's aerospace SEZ — home to Tata Boeing and multiple aviation suppliers — plus surrounding industrial sheds make it one of Telangana's most equipment-intensive ORR south corridors.",
    nearbyAreas: ["Maheshwaram", "Ibrahimpatnam", "Tukkuguda", "Shamshabad", "Kongara Kalan"],
    majorProjects: [
      "Aerospace SEZ and Tata Boeing campus",
      "Industrial shed construction",
      "Pharma and aviation supplier units",
    ],
    equipmentDemand: "JCB for industrial grading, post hole diggers for compound fencing and earthing pits",
    distanceFromHyderabad: "28km",
    nhCorridor: "ORR south",
    localContext:
      "Adibatla SEZ contractors face security and access protocols that delay outside operators — local verified fleet partners who already work inside the zone mobilise faster and pass gate checks without daily paperwork.",
    tier: "orr-corridor",
    searchTerms: ["earthing pit digging Adibatla", "industrial excavation", "compound wall holes"],
    useCaseSlugs: ["earthing-rod-pits", "excavation", "precast-wall-holes", "hole-digging", "borewell-digging"],
    priority: 1,
    description_te:
      "Adibatla aerospace SEZ — Tata Boeing mariyu aviation suppliers — surrounding industrial sheds tho Telangana lo most equipment-intensive ORR south corridors lo okati.",
    localContext_te:
      "Adibatla SEZ contractors security protocols face chestaru — zone lo already pani chesina local verified fleet partners fast ga mobilise avutaru.",
  },
  {
    slug: "maheshwaram",
    displayName: "Maheshwaram",
    district: "Ranga Reddy",
    description:
      "Maheshwaram on ORR south hosts pharma plots, industrial layouts, and stone-breaking work on hard strata sites — JCB rock breakers and post hole diggers are in constant demand.",
    nearbyAreas: ["Shamshabad", "Kongara Kalan", "Adibatla", "Shadnagar", "Ibrahimpatnam"],
    majorProjects: [
      "ORR south pharma and industrial plots",
      "Layout development earthwork",
      "Hard strata site preparation",
    ],
    equipmentDemand: "JCB with rock breaker, post hole diggers for industrial fencing",
    distanceFromHyderabad: "20km",
    nhCorridor: "ORR",
    localContext:
      "Maheshwaram's pharma plot developers often hit granite pockets that need rock breaking before standard excavation — contractors need JCB operators with breaker attachments, not just plain buckets.",
    tier: "orr-corridor",
    searchTerms: ["stone breaking Maheshwaram", "pharma plot excavation", "earthing pit digging"],
    useCaseSlugs: ["stone-breaking", "earthing-rod-pits", "precast-wall-holes", "borewell-digging"],
    priority: 2,
    description_te:
      "ORR south meeda Maheshwaram lo pharma plots, industrial layouts, hard strata sites meeda stone-breaking work undi — JCB rock breakers mariyu post hole diggers constant demand lo unnayi.",
    localContext_te:
      "Maheshwaram pharma plot developers granite pockets hit avutaru — standard excavation mundu rock breaking avasaram. Plain buckets kakunda breaker attachments unna JCB operators avasaram.",
  },
  {
    slug: "kongara-kalan",
    displayName: "Kongara Kalan",
    district: "Ranga Reddy",
    description:
      "Kongara Kalan's ORR south pharma plots and layout developments sit on mixed strata — rock breaking, compound wall holes, and industrial grading keep JCBs and auger machines busy year-round.",
    nearbyAreas: ["Maheshwaram", "Adibatla", "Shadnagar", "Ibrahimpatnam", "Shamshabad"],
    majorProjects: [
      "Pharma plots ORR south",
      "Layout development earthwork",
      "Industrial access road construction",
    ],
    equipmentDemand: "JCB rock breaker and grading, post hole diggers for plot fencing",
    distanceFromHyderabad: "30km",
    nhCorridor: "ORR",
    localContext:
      "Kongara Kalan contractors working multiple pharma plots along the ORR service road benefit from operators stationed south of the city — every hour saved on mobilisation is another hour of billable hole drilling or grading.",
    tier: "orr-corridor",
    searchTerms: ["rock breaking Kongara Kalan", "pharma plot holes", "JCB hire ORR south"],
    useCaseSlugs: ["stone-breaking", "precast-wall-holes"],
    priority: 2,
    description_te:
      "Kongara Kalan ORR south pharma plots mariyu layout developments mixed strata meeda unnayi — rock breaking, compound wall holes, industrial grading JCBs mariyu auger machines ni year-round busy ga unchutayi.",
    localContext_te:
      "ORR service road along multiple pharma plots lo pani chesina Kongara Kalan contractors city dakshinam stationed operators tho benefit avutaru — mobilisation lo save ayye prati hour hole drilling leda grading lo billable hour.",
  },
  {
    slug: "patancheru",
    displayName: "Patancheru",
    district: "Sangareddy",
    description:
      "Patancheru is Telangana's TS-iPASS industrial belt heartland — chemical plants, industrial estates, and earthing pit work for electrical infrastructure create specialised equipment demand.",
    nearbyAreas: ["Sangareddy", "Bachupally", "Tellapur", "Nallagandla", "Isnapur"],
    majorProjects: [
      "TS-iPASS industrial belt expansion",
      "Chemical industry civil works",
      "Industrial estate infrastructure",
    ],
    equipmentDemand: "Post hole diggers for earthing pits, JCB for industrial site grading",
    distanceFromHyderabad: "35km",
    nhCorridor: "NH65",
    localContext:
      "Patancheru industrial contractors need earthing pits that meet electrical inspector specs — depth and diameter matter, and a trained auger operator finishes compliant pits faster than manual crews in chemical belt heat.",
    tier: "orr-corridor",
    searchTerms: ["earthing pit digging Patancheru", "industrial excavation", "JCB hire"],
    useCaseSlugs: ["earthing-rod-pits"],
    priority: 2,
    description_te:
      "Patancheru Telangana TS-iPASS industrial belt heartland — chemical plants, industrial estates, electrical infrastructure earthing pit work specialised equipment demand create chestayi.",
    localContext_te:
      "Patancheru industrial contractors electrical inspector specs meet chese earthing pits avasaram — depth mariyu diameter matter avutayi. Trained auger operator chemical belt heat lo manual crews kante compliant pits fast ga complete chestadu.",
  },
  {
    slug: "sangareddy",
    displayName: "Sangareddy",
    district: "Sangareddy",
    description:
      "Sangareddy town and its TSIDC industrial estates anchor the NH65 western industrial belt — factory foundations, earthing work, and haul road grading sustain JCB and auger demand.",
    nearbyAreas: ["Patancheru", "Tellapur", "Sadashivpet", "Isnapur", "Zaheerabad"],
    majorProjects: [
      "TSIDC industrial estates",
      "NH65 industrial corridor",
      "Factory and warehouse construction",
    ],
    equipmentDemand: "JCB for factory sites, post hole diggers for earthing and fencing",
    distanceFromHyderabad: "45km",
    nhCorridor: "NH65",
    localContext:
      "Sangareddy's TSIDC estates run factory builds on parallel timelines — contractors who maintain relationships with local Crux operators get priority mobilisation when three projects need JCBs the same week.",
    tier: "orr-corridor",
    searchTerms: ["earthing rod pits Sangareddy", "factory excavation", "JCB hire NH65"],
    useCaseSlugs: ["earthing-rod-pits"],
    priority: 2,
    description_te:
      "Sangareddy town mariyu TSIDC industrial estates NH65 western industrial belt ni anchor chestayi — factory foundations, earthing work, haul road grading JCB mariyu auger demand ni sustain chestayi.",
    localContext_te:
      "Sangareddy TSIDC estates parallel timelines lo factory builds run chestayi — local Crux operators tho relationships maintain chesina contractors same week rendu projects JCBs avasaram unnapudu priority mobilisation vastundi.",
  },
  {
    slug: "ibrahimpatnam",
    displayName: "Ibrahimpatnam",
    district: "Ranga Reddy",
    description:
      "Ibrahimpatnam's south ORR plotted developments and industrial fringe sites need compound wall holes, site excavation, and occasional rock breaking on elevated terrain.",
    nearbyAreas: ["Adibatla", "Maheshwaram", "Turkayamjal", "Shamshabad", "Kongara Kalan"],
    majorProjects: [
      "South ORR plotted development",
      "Industrial fringe layout earthwork",
      "Highway service road projects",
    ],
    equipmentDemand: "Post hole diggers for layout fencing, JCB for grading and rock breaking",
    distanceFromHyderabad: "28km",
    nhCorridor: "ORR",
    localContext:
      "Ibrahimpatnam layout sites often sit on sloped ORR service terrain — JCB operators who know how to bench and grade without destabilising cut slopes save contractors rework costs on every plot.",
    tier: "orr-corridor",
    searchTerms: ["compound wall holes Ibrahimpatnam", "layout excavation", "rock breaking"],
    useCaseSlugs: ["precast-wall-holes", "excavation", "stone-breaking"],
    priority: 2,
    description_te:
      "Ibrahimpatnam south ORR plotted developments mariyu industrial fringe sites ki compound wall holes, site excavation, elevated terrain meeda occasional rock breaking avasaram.",
    localContext_te:
      "Ibrahimpatnam layout sites sloped ORR service terrain meeda untayi — cut slopes destabilise cheyakunda bench mariyu grade chese JCB operators prati plot meeda rework costs save chestaru.",
  },
  {
    slug: "medchal",
    displayName: "Medchal",
    district: "Medchal-Malkajgiri",
    description:
      "Medchal's north ORR logistics and warehousing belt needs site grading, warehouse foundations, and compound fencing — JCBs and post hole diggers mobilise daily from the northern corridor.",
    nearbyAreas: ["Bachupally", "Ghatkesar", "Pocharam", "Kompally", "Shamirpet"],
    majorProjects: [
      "North ORR logistics and warehousing",
      "Industrial shed construction",
      "Distribution centre earthwork",
    ],
    equipmentDemand: "JCB for warehouse grading, post hole diggers for industrial fencing",
    distanceFromHyderabad: "25km",
    nhCorridor: "ORR north",
    localContext:
      "Medchal warehouse developers work on slab-on-grade timelines — a JCB that finishes grading Monday morning keeps the concreting crew scheduled for Tuesday instead of idle waiting for a machine from Banjara Hills.",
    tier: "orr-corridor",
    searchTerms: ["JCB excavation Medchal", "warehouse grading", "logistics equipment hire"],
    useCaseSlugs: [],
    priority: 2,
    description_te:
      "Medchal north ORR logistics mariyu warehousing belt ki site grading, warehouse foundations, compound fencing avasaram — JCBs mariyu post hole diggers northern corridor nundi daily mobilise avutayi.",
    localContext_te:
      "Medchal warehouse developers slab-on-grade timelines meeda pani chestaru — Monday morning grading complete chesina JCB Tuesday concreting crew schedule lo unchutundi, Banjara Hills nundi machine wait cheyadam kadu.",
  },
  {
    slug: "pocharam",
    displayName: "Pocharam",
    district: "Medchal-Malkajgiri",
    description:
      "Pocharam sits in the Genome Valley biotech corridor — lab campuses, biotech parks, and supporting infrastructure drive civil equipment demand along the north ORR.",
    nearbyAreas: ["Medchal", "Ghatkesar", "Shamirpet", "Turkayamjal", "Uppal"],
    majorProjects: [
      "Genome Valley biotech corridor",
      "Lab campus construction",
      "Biotech park infrastructure",
    ],
    equipmentDemand: "JCB for site prep, post hole diggers for campus fencing",
    distanceFromHyderabad: "35km",
    nhCorridor: "ORR north",
    localContext:
      "Pocharam biotech campuses require clean, precise site prep — contractors prefer verified operators with track records on institutional projects over unknown junction hires.",
    tier: "orr-corridor",
    searchTerms: ["equipment rental Pocharam", "Genome Valley construction", "site excavation"],
    useCaseSlugs: [],
    priority: 3,
    description_te:
      "Pocharam Genome Valley biotech corridor lo undi — lab campuses, biotech parks, supporting infrastructure north ORR along civil equipment demand drive chestayi.",
    localContext_te:
      "Pocharam biotech campuses clean, precise site prep avasaram — contractors institutional projects track records unna verified operators ni unknown junction hires kante prefer chestaru.",
  },
  {
    slug: "turkayamjal",
    displayName: "Turkayamjal",
    district: "Ranga Reddy",
    description:
      "Turkayamjal's east ORR layouts are emerging plotted developments — compound wall pole holes and basic site grading are the primary equipment needs as ventures launch.",
    nearbyAreas: ["Ghatkesar", "Ibrahimpatnam", "Uppal", "Boduppal", "Pocharam"],
    majorProjects: [
      "East ORR layout developments",
      "Residential plotted ventures",
      "Infrastructure connectivity works",
    ],
    equipmentDemand: "Post hole diggers for compound walls, JCB for layout grading",
    distanceFromHyderabad: "22km",
    nhCorridor: "ORR east",
    localContext:
      "Turkayamjal is early in its layout cycle — contractors who establish local equipment relationships now will have priority access when the east ORR building boom accelerates over the next two years.",
    tier: "orr-corridor",
    searchTerms: ["compound wall holes Turkayamjal", "layout grading", "hole digging"],
    useCaseSlugs: ["precast-wall-holes"],
    priority: 3,
    description_te:
      "Turkayamjal east ORR layouts emerging plotted developments — ventures launch avvadam tho compound wall pole holes mariyu basic site grading primary equipment needs.",
    localContext_te:
      "Turkayamjal layout cycle early stage lo undi — ippudu local equipment relationships establish chesina contractors next two years east ORR building boom accelerate avvadam tho priority access vastundi.",
  },
  {
    slug: "chevella",
    displayName: "Chevella",
    district: "Ranga Reddy",
    description:
      "Chevella marks the ORR west exit into granite country — stone quarry operations, rock breaking, and farmhouse plot preparation define the local equipment market.",
    nearbyAreas: ["Vikarabad", "Shankarpalle", "Kothur", "Mominpet", "Pargi"],
    majorProjects: [
      "ORR west exit connectivity",
      "Stone quarry operations",
      "Farmhouse and resort plot development",
    ],
    equipmentDemand: "JCB rock breaker, post hole diggers for farmhouse fencing",
    distanceFromHyderabad: "40km",
    nhCorridor: "SH4",
    localContext:
      "Chevella plots routinely hit granite outcrops within the first few feet of excavation — contractors need rock breaker JCBs on standby, not machines that arrive without the right attachment.",
    tier: "orr-corridor",
    searchTerms: ["stone breaking Chevella", "rock breaker hire", "quarry excavation"],
    useCaseSlugs: ["stone-breaking"],
    priority: 3,
    description_te:
      "Chevella ORR west exit granite country loki mark chestundi — stone quarry operations, rock breaking, farmhouse plot preparation local equipment market ni define chestayi.",
    localContext_te:
      "Chevella plots excavation lo first few feet lo granite outcrops hit avutayi — right attachment lekunda arrive ayye machines kadu, rock breaker JCBs standby lo avasaram.",
  },
  {
    slug: "bhongir",
    displayName: "Bhongir",
    district: "Yadadri Bhuvanagiri",
    description:
      "Bhongir on the east corridor combines historic town infrastructure upgrades with new layout growth along NH163 — basic earthmoving and fencing equipment demand is rising.",
    nearbyAreas: ["Nalgonda", "Choutuppal", "Yadagirigutta", "Alair", "Bibinagar"],
    majorProjects: [
      "East corridor layout growth",
      "NH163 highway allied works",
      "Town infrastructure upgrades",
    ],
    equipmentDemand: "JCB for road and layout work, post hole diggers for fencing",
    distanceFromHyderabad: "50km",
    nhCorridor: "NH163",
    localContext:
      "Bhongir contractors bridge town municipal work and new layout earthwork — versatile JCB and auger operators who serve both segments are in short supply east of Hyderabad.",
    tier: "orr-corridor",
    searchTerms: ["JCB hire Bhongir", "layout excavation", "NH163 equipment"],
    useCaseSlugs: [],
    priority: 3,
    description_te:
      "East corridor meeda Bhongir historic town infrastructure upgrades mariyu NH163 along new layout growth kalipi — basic earthmoving mariyu fencing equipment demand penchutondi.",
    localContext_te:
      "Bhongir contractors town municipal work mariyu new layout earthwork madhya bridge chestaru — rendu segments serve chese versatile JCB mariyu auger operators Hyderabad east lo short supply lo unnaru.",
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return LOCATIONS.map((l) => l.slug);
}

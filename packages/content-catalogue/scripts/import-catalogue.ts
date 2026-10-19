import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const yamlPath = join(packageRoot, "data", "catalogue.yaml");
const outPath = join(packageRoot, "src", "catalogue.data.ts");

const PRICE_NOTE_EN = "Prices are indicative and exclude GST.";
const FARM_HOUSE_PRICE = "Starting from Rs 1,400 per sft";

const ILLUS_IMAGE_KEYS = new Set([
  "cover-hero",
  "dozer",
  "precast-handmade",
  "building-construction",
]);

type YamlImage = { own?: string; gen?: string };

type Localized = { en: string; te: string; teReviewed: false };

function pendingTe(en: string, te: string): Localized {
  return { en, te, teReviewed: false };
}

function imageKeyFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.[^.]+$/, "");
}

function parseImageRef(image: YamlImage): { key: string; kind: "own" | "design" | "illus" } {
  if (image.own) {
    return { key: imageKeyFromPath(image.own), kind: "own" };
  }
  if (image.gen) {
    const key = imageKeyFromPath(image.gen);
    const kind = ILLUS_IMAGE_KEYS.has(key) ? "illus" : "design";
    return { key, kind };
  }
  throw new Error("Image ref must have own or gen path");
}

function parseBookletImage(ref: { src: string; kind?: string }): {
  key: string;
  kind: "own" | "design" | "illus";
} {
  const key = imageKeyFromPath(ref.src);
  if (ref.kind === "own") {
    return { key, kind: "own" };
  }
  if (ref.kind === "illus") {
    return { key, kind: "illus" };
  }
  if (ref.kind === "design") {
    return { key, kind: "design" };
  }
  const kind = ILLUS_IMAGE_KEYS.has(key) ? "illus" : "design";
  return { key, kind };
}

function slugifyDesignName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Telugu copy — pending review by a Telugu reader (teReviewed: false on all localized fields). */
const te = {
  brand: pendingTe("Crux Group", "క్రక్స్ గ్రూప్"),
  tagline: pendingTe(
    "Equipment rentals and construction services",
    "యంత్రాల అద్దెలు మరియు నిర్మాణ సేవలు",
  ),
  address: pendingTe(
    "Fathimapur, Kothur, RR District 509325",
    "ఫతిమాపూర్, కోతూర్, RR జిల్లా 509325",
  ),
  catalogueTitle: pendingTe("Catalogue: Rentals and Services", "క్యాటలాగ్: అద్దెలు మరియు సేవలు"),
  priceNote: pendingTe(PRICE_NOTE_EN, "ధరలు సూచనాత్మకమైనవి మరియు GST కలిపి లేవు."),
  rentalsTitle: pendingTe("Equipment Rentals", "యంత్రాల అద్దెలు"),
  servicesTitle: pendingTe("Services", "సేవలు"),
  badgeOwn: pendingTe("Our site", "మా సైట్"),
  badgeDesign: pendingTe("Design option", "డిజైన్ ఎంపిక"),
  badgeIllus: pendingTe("Illustrative image", "దృష్టాంత చిత్రం"),
  designSectionLabel: pendingTe("Design options we build", "మేము నిర్మించే డిజైన్ ఎంపికలు"),
  bookletTitle: pendingTe(
    "Machinery. Earth works. Walls. Farm houses.",
    "యంత్రాలు. భూమి పనులు. గోడలు. ఫార్మ్ హౌసులు.",
  ),
  bookletSubtitle: pendingTe(
    "Rentals and construction services from Kothur, Rangareddy",
    "కోతూర్, రంగారెడ్డి నుండి అద్దెలు మరియు నిర్మాణ సేవలు",
  ),
} as const;

const itemTe: Record<
  string,
  {
    name: Localized;
    description: Localized;
    bestUse?: Localized[];
  }
> = {
  jcb: {
    name: pendingTe("JCB", "JCB"),
    description: pendingTe(
      "JCB backhoe loader on hourly hire for digging, trenching, loading and site clearing.",
      "కనిపెట్టడం, ట్రెంచింగ్, లోడింగ్ మరియు సైట్ క్లియరింగ్ కోసం గంటకు JCB బ్యాక్హో లోడర్ అద్దెకు.",
    ),
    bestUse: [
      pendingTe("Trenching and foundation digging", "ట్రెంచింగ్ మరియు ఫౌండేషన్ కనిపెట్టడం"),
      pendingTe("Loading and shifting earth", "మట్టి లోడ్ చేయడం మరియు మార్చడం"),
      pendingTe("Site clearing and backfilling", "సైట్ క్లియరింగ్ మరియు బ్యాక్‌ఫిల్లింగ్"),
    ],
  },
  excavator: {
    name: pendingTe("Excavator (Hitachi)", "ఎక్స్కవేటర్ (హిటాచి)"),
    description: pendingTe(
      "Hitachi excavator on hourly hire for bulk excavation, trenching and loading.",
      "బల్క్ ఎక్స్కవేషన్, ట్రెంచింగ్ మరియు లోడింగ్ కోసం గంటకు హిటాచి ఎక్స్కవేటర్ అద్దెకు.",
    ),
    bestUse: [
      pendingTe("Bulk excavation", "బల్క్ ఎక్స్కవేషన్"),
      pendingTe("Deep trenches, ponds and pits", "లోతైన ట్రెంచులు, చెరువులు మరియు గుంటలు"),
      pendingTe("Loading tippers", "టిప్పర్లు లోడ్ చేయడం"),
    ],
  },
  "hydra-crane": {
    name: pendingTe("Hydra Cranes", "హైడ్రా క్రేన్లు"),
    description: pendingTe(
      "Hydra mobile crane on hourly hire for lifting and placing materials and precast panels on site.",
      "సైట్‌లో పదార్థాలు మరియు ప్రీకాస్ట్ ప్యానెల్స్ ఎత్తడం మరియు ఉంచడం కోసం గంటకు హైడ్రా మొబైల్ క్రేన్ అద్దెకు.",
    ),
    bestUse: [
      pendingTe("Lifting precast panels and posts", "ప్రీకాస్ట్ ప్యానెల్స్ మరియు పోస్టులు ఎత్తడం"),
      pendingTe("Unloading and placing materials", "పదార్థాలు దించడం మరియు ఉంచడం"),
      pendingTe("Shifting heavy items on site", "సైట్‌లో భారీ వస్తువులు మార్చడం"),
    ],
  },
  dozer: {
    name: pendingTe("Dozer", "డోజర్"),
    description: pendingTe(
      "Dozer on hourly hire for pushing earth, land clearing and rough grading.",
      "మట్టి తోలడం, భూమి క్లియరింగ్ మరియు రఫ్ గ్రేడింగ్ కోసం గంటకు డోజర్ అద్దెకు.",
    ),
    bestUse: [
      pendingTe("Pushing and spreading earth", "మట్టి తోలడం మరియు వ్యాప్తి చేయడం"),
      pendingTe("Clearing bushes and rough land", "చెట్లు మరియు అసమమైన భూమి క్లియర్ చేయడం"),
      pendingTe("Rough grading of large plots", "పెద్ద ప్లాట్ల రఫ్ గ్రేడింగ్"),
    ],
  },
  "earth-works": {
    name: pendingTe("Earth Works, Excavation & Land Levelling", "భూమి పనులు, ఎక్స్కవేషన్ & ల్యాండ్ లెవల్లింగ్"),
    description: pendingTe(
      "Earth works, excavation and land levelling for plots, farms and building sites.",
      "ప్లాట్లు, పొలాలు మరియు బిల్డింగ్ సైట్ల కోసం భూమి పనులు, ఎక్స్కవేషన్ మరియు ల్యాండ్ లెవల్లింగ్.",
    ),
  },
  "post-hole-digging": {
    name: pendingTe("Post-hole Digging", "పోస్ట్-హోల్ కనిపెట్టడం"),
    description: pendingTe(
      "Post-hole digging for fencing and compound wall posts. Priced per hole.",
      "ఫెన్సింగ్ మరియు కాంపౌండ్ వాల్ పోస్టుల కోసం పోస్ట్-హోల్ కనిపెట్టడం. రంధ్రానికి ధర.",
    ),
    bestUse: [
      pendingTe("Fencing posts", "ఫెన్సింగ్ పోస్టులు"),
      pendingTe("Precast compound wall posts", "ప్రీకాస్ట్ కాంపౌండ్ వాల్ పోస్టులు"),
      pendingTe("Holes for pillars and footings", "స్తంభాలు మరియు ఫుటింగ్‌ల కోసం రంధ్రాలు"),
    ],
  },
  "precast-handmade": {
    name: pendingTe("Precast Compound Wall: Handmade", "ప్రీకాస్ట్ కాంపౌండ్ వాల్: చేతితో తయారు"),
    description: pendingTe(
      "Precast concrete compound wall with handmade panels. Rate per square foot of wall.",
      "చేతితో తయారు ప్యానెల్స్‌తో ప్రీకాస్ట్ కాంక్రీట్ కాంపౌండ్ వాల్. గోడ ప్రతి చదరపు అడుగుకు రేటు.",
    ),
  },
  "precast-machine-made": {
    name: pendingTe("Precast Compound Wall: Prestressed Machine-Made", "ప్రీకాస్ట్ కాంపౌండ్ వాల్: ప్రెస్ట్రెస్డ్ మెషిన్-మేడ్"),
    description: pendingTe(
      "Precast compound wall with prestressed, machine-made panels, 2 inch thick. Rate per square foot of wall.",
      "2 అంగుళాల మందం ప్రెస్ట్రెస్డ్, మెషిన్-మేడ్ ప్యానెల్స్‌తో ప్రీకాస్ట్ కాంపౌండ్ వాల్. గోడ ప్రతి చదరపు అడుగుకు రేటు.",
    ),
  },
  fencing: {
    name: pendingTe("Fencing Contracts", "ఫెన్సింగ్ కాంట్రాక్టులు"),
    description: pendingTe(
      "Fencing work for farms, plots and open land, taken up on contract.",
      "పొలాలు, ప్లాట్లు మరియు బహిరంగ భూమి కోసం ఫెన్సింగ్ పని, కాంట్రాక్ట్‌పై.",
    ),
  },
  "compound-wall": {
    name: pendingTe("Compound Wall", "కాంపౌండ్ వాల్"),
    description: pendingTe(
      "Compound wall construction on contract, to suit the site.",
      "సైట్‌కు సరిపడా కాంపౌండ్ వాల్ నిర్మాణం, కాంట్రాక్ట్‌పై.",
    ),
  },
  "farm-house": {
    name: pendingTe("Farm House Construction", "ఫార్మ్ హౌస్ నిర్మాణం"),
    description: pendingTe(
      "Construction of farm houses on contract.",
      "కాంట్రాక్ట్‌పై ఫార్మ్ హౌసుల నిర్మాణం.",
    ),
  },
  building: {
    name: pendingTe("Building Contracts", "బిల్డింగ్ కాంట్రాక్టులు"),
    description: pendingTe(
      "Building construction work taken up on contract.",
      "కాంట్రాక్ట్‌పై బిల్డింగ్ నిర్మాణ పని.",
    ),
  },
  civil: {
    name: pendingTe("Civil Contracts", "సివిల్ కాంట్రాక్టులు"),
    description: pendingTe(
      "General civil works taken up on contract.",
      "కాంట్రాక్ట్‌పై సాధారణ సివిల్ పనులు.",
    ),
  },
};

function pricesForSlug(slug: string, yamlPrices: { text: string }[]): { text: string }[] {
  if (slug === "farm-house") {
    return [{ text: FARM_HOUSE_PRICE }];
  }
  return yamlPrices.map((p) => ({ text: p.text }));
}

function contactForQuote(slug: string, yamlPrices: { text: string }[]): boolean {
  if (slug === "farm-house") {
    return false;
  }
  return yamlPrices.length === 0;
}

type YamlRoot = {
  company: {
    legal_name: string;
    brand: string;
    tagline: string;
    address: string;
    gstin: string;
    phone: string;
    phone_display: string;
    email: string;
    website: string;
    website_display: string;
  };
  catalogue: { title: string; price_note: string };
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      slug: string;
      name: string;
      description: string;
      best_use?: string[];
      prices: { text: string }[];
      image: YamlImage;
    }>;
  }>;
  booklet: {
    title: string;
    subtitle: string;
    cover: { src: string; kind: string };
    design_label: string;
    about: {
      heading: string;
      lead: string;
      body: string[];
      points: { h: string; t: string }[];
      image: { src: string; kind: string };
    };
    earthworks: {
      heading: string;
      lead: string;
      image: { src: string; kind: string };
      image2: { src: string; kind: string };
      process: { h: string; t: string }[];
    };
    precast: {
      heading: string;
      lead: string;
      handmade: { src: string; kind: string };
      machine: { src: string; kind: string };
      rows: string[][];
      note: string;
    };
    walls: {
      heading: string;
      lead: string;
      items: { name: string; text: string; src: string }[];
    };
    farmhouses: {
      heading: string;
      lead: string;
      items: { name: string; text: string; src: string }[];
    };
    fencing: {
      heading: string;
      lead: string;
      own: { src: string; kind: string };
      items: { name: string; text: string; src: string }[];
    };
    building: {
      heading: string;
      lead: string;
      image: { src: string; kind: string };
      blocks: { h: string; t: string }[];
    };
    process: {
      heading: string;
      steps: { h: string; t: string; pay?: number[] }[];
    };
  };
};

const raw = parse(readFileSync(yamlPath, "utf8")) as YamlRoot;

if (raw.catalogue.price_note !== PRICE_NOTE_EN) {
  throw new Error(`catalogue.price_note must be exactly: ${PRICE_NOTE_EN}`);
}

const sections = raw.sections.map((section) => {
  const title =
    section.id === "rentals"
      ? te.rentalsTitle
      : section.id === "services"
        ? te.servicesTitle
        : pendingTe(section.title, section.title);

  const items = section.items.map((item) => {
    const copy = itemTe[item.slug];
    if (!copy) {
      throw new Error(`Missing Telugu copy for item slug: ${item.slug}`);
    }
    const prices = pricesForSlug(item.slug, item.prices);
    return {
      slug: item.slug,
      name: copy.name,
      description: copy.description,
      ...(copy.bestUse ? { bestUse: copy.bestUse } : {}),
      prices,
      contactForQuote: contactForQuote(item.slug, item.prices),
      image: parseImageRef(item.image),
    };
  });

  return {
    id: section.id as "rentals" | "services",
    title,
    items,
  };
});

const wallTe: Record<string, { name: string; text: string }> = {
  "Natural granite wall": {
    name: "సహజ గ్రానైట్ గోడ",
    text: "ఫ్లాట్ స్టోన్ కోపింగ్‌తో ర్యాండమ్ రబుల్ గ్రానైట్ మేసన్రీ. బలంగా మరియు తక్కువ నిర్వహణ, పొలంలో సౌకర్యంగా ఉంటుంది.",
  },
  "Plastered and painted wall": {
    name: "ప్లాస్టర్ మరియు పెయింట్ గోడ",
    text: "మృదువైన ప్లాస్టర్, పెయింట్ ఫినిష్, పిలాస్టర్స్ మరియు ప్రొజెక్టింగ్ కోపింగ్‌తో కాంక్రీట్ లేదా బ్లాక్ గోడ.",
  },
  "Exposed brick wall": {
    name: "బయటకు కనిపించే ఇటుక గోడ",
    text: "ఇటుక పియర్స్ మరియు ఇటుక-ఆన్-ఎడ్జ్ కోపింగ్‌తో చక్కని బయటకు కనిపించే ఇటుక పని.",
  },
  "Precast panel wall for farmland": {
    name: "పొలం భూమికి ప్రీకాస్ట్ ప్యానెల్ గోడ",
    text: "వ్యవసాయ భూమి చుట్టూ పొడవైన రన్‌ల కోసం ప్యానెల్స్ మధ్య స్లాటెడ్ ప్రీకాస్ట్ పోస్టులు.",
  },
  "Wall with MS grille": {
    name: "MS గ్రిల్‌తో గోడ",
    text: "స్తంభాల మధ్య మైల్డ్ స్టీల్ గ్రిల్ ప్యానెల్స్‌తో తక్కువ ప్లాస్టర్ గోడ. సురక్షితం, వీక్షణ తెరిచి ఉంటుంది.",
  },
  "Gate pillars with cladding": {
    name: "క్లాడింగ్‌తో గేట్ స్తంభాలు",
    text: "ల్యాంప్ క్యాప్స్ మరియు స్టీల్ గేట్‌తో సహజ రాతి క్లాడింగ్‌తో ప్రవేశ స్తంభాలు.",
  },
};

const farmTe: Record<string, { name: string; text: string }> = {
  "Traditional Telangana": {
    name: "సాంప్రదాయ తెలంగాణ",
    text: "మట్టి టైల్ వాలు పైకప్పు, తెరిచి మధ్య కోర్ట్‌యార్డ్ మరియు చెక్క స్తంభాలపై లోతైన వరాండా. లైమ్-వాష్ గోడలు మరియు రెడ్-ఆక్సైడ్ ఫ్లోర్లు చల్లగా మరియు సరళంగా ఉంచుతాయి.",
  },
  "Heritage pillared": {
    name: "హెరిటేజ్ స్తంభాలు",
    text: "చెట్టినాడ్ ఇళ్ల నుండి ప్రేరణ: గుండ్రని స్తంభాల కాలనేడ్, చెక్క ప్రధాన ద్వారం మరియు టెరకోటా పైకప్పు కింద నమూనా టైల్డ్ ఫ్లోర్లు.",
  },
  "Kerala-style sloped roof": {
    name: "కేరళ శైలి వాలు పైకప్పు",
    text: "సూర్యుడు మరియు వర్షం కోసం విస్తృత ఓవర్‌హ్యాంగ్‌లతో పొరల పైకప్పులు, లాటరైట్ టోన్ గోడలు, చెక్క స్తంభాలు మరియు సిట్-అవుట్ వరాండా.",
  },
  "Contemporary stone and timber": {
    name: "ఆధునిక రాతి మరియు చెక్క",
    text: "నిలువు చెక్క లూవర్స్ మరియు పెద్ద కిటికీలతో సహజ రాతి క్లాడింగ్. శుభ్ర పైకప్పు రేఖలతో రెండు అంతస్తుల రూపం.",
  },
  "Modern minimal": {
    name: "ఆధునిక మినిమల్",
    text: "ఫ్లోర్-టు-సీలింగ్ గ్లాస్ మరియు సన్నని కాంటిలీవర్ స్లాబ్‌తో చురుకైన ఫ్లాట్-రూఫ్ బాక్స్, నేరుగా భూమికి తెరుచుకుంటుంది.",
  },
  "Tropical modern with pool": {
    name: "పూల్‌తో ట్రాపికల్ మోడర్న్",
    text: "డెక్ పై చెక్క పెర్గోలా, ముందు లాప్ పూల్, మరియు వీకెండ్ జీవనానికి రాతి మరియు చెక్క ఫినిష్‌లు.",
  },
};

const fenceTe: Record<string, { name: string; text: string }> = {
  "Barbed wire on concrete poles": {
    name: "కాంక్రీట్ స్తంభాలపై బార్బ్ వైర్",
    text: "బార్బ్ వైర్ స్ట్రాండ్‌లతో కాంక్రీట్ స్తంభాలు. పెద్ద పొలం భూమికి ఆచరణాత్మక సరిహద్దు.",
  },
  "Chain-link with concrete posts": {
    name: "కాంక్రీట్ పోస్టులతో చైన్-లింక్",
    text: "కాంక్రీట్ పోస్టుల మధ్య గాల్వనైజ్డ్ చైన్-లింక్ మెష్, ప్లాట్లు, తోటలు మరియు యార్డుల కోసం.",
  },
  "Solar fence for farmland": {
    name: "పొలం భూమికి సోలార్ ఫెన్స్",
    text: "పంటలను రక్షించడానికి సోలార్ ఎనర్జైజర్‌తో ఇన్సులేటెడ్ పోస్టులపై మల్టీ-వైర్ ఫెన్స్.",
  },
};

function designOption(item: { name: string; text: string; src: string }, map: Record<string, { name: string; text: string }>) {
  const t = map[item.name];
  if (!t) {
    throw new Error(`Missing design Telugu for: ${item.name}`);
  }
  return {
    slug: slugifyDesignName(item.name),
    name: pendingTe(item.name, t.name),
    description: pendingTe(item.text, t.text),
    image: { key: imageKeyFromPath(item.src), kind: "design" as const },
  };
}

const booklet = raw.booklet;

const document = {
  company: {
    legalName: raw.company.legal_name,
    brand: te.brand,
    tagline: te.tagline,
    address: te.address,
    gstin: raw.company.gstin,
    phone: raw.company.phone,
    phoneDisplay: raw.company.phone_display,
    email: raw.company.email,
    website: raw.company.website,
    websiteDisplay: raw.company.website_display,
  },
  catalogue: {
    title: te.catalogueTitle,
    priceNote: te.priceNote,
  },
  sections,
  booklet: {
    title: te.bookletTitle,
    subtitle: te.bookletSubtitle,
    coverImage: parseBookletImage(booklet.cover),
    designSectionLabel: te.designSectionLabel,
    about: {
      heading: pendingTe(booklet.about.heading, "మా స్వంత యంత్రాలపై నిర్మించబడింది"),
      lead: pendingTe(
        booklet.about.lead,
        "క్రక్స్ గ్రూప్ (CRUX AGRI & RURAL SERVICES LLP) తెలంగాణ రంగారెడ్డి జిల్లా కోతూర్‌లోని ఫతిమాపూర్‌లో పని చేస్తుంది.",
      ),
      body: booklet.about.body.map((p, i) =>
        pendingTe(
          p,
          i === 0
            ? "మేము మా స్వంత యంత్రాలు నడుపుతాము: JCB, హిటాచి ఎక్స్కవేటర్, హైడ్రా క్రేన్, డోజర్ మరియు ట్రాక్టర్-మౌంటెడ్ పోస్ట్-హోల్ డిగ్గర్."
            : "అది ఖాళీ భూమి నుండి పూర్తి ప్రాజెక్ట్‌కు: క్లియరింగ్ మరియు లెవల్లింగ్, కనిపెట్టడం, ప్రీకాస్ట్ లేదా నిర్మిత కాంపౌండ్ గోడలు, ఫెన్సింగ్, మరియు ఫార్మ్ హౌస్ లేదా బిల్డింగ్ నిర్మాణం.",
        ),
      ),
      points: booklet.about.points.map((pt) => ({
        heading: pendingTe(
          pt.h,
          pt.h === "Own machinery"
            ? "స్వంత యంత్రాలు"
            : pt.h === "End to end"
              ? "అంతం నుండి అంతం"
              : "స్పష్టమైన ధరలు",
        ),
        text: pendingTe(
          pt.t,
          pt.h === "Own machinery"
            ? "మా స్వంత ఫ్లీట్ నుండి JCB, ఎక్స్కవేటర్, హైడ్రా క్రేన్, డోజర్ మరియు పోస్ట్-హోల్ డిగ్గర్."
            : pt.h === "End to end"
              ? "ఒక కాంట్రాక్ట్‌లో భూమి పని, గోడలు, ఫెన్సింగ్ మరియు బిల్డింగ్‌లు, లేదా ఏదైనా ఒక భాగం."
              : "రాత పూర్వక ధరలు, మైల్‌స్టోన్ చెల్లింపులు.",
        ),
      })),
      image: parseBookletImage(booklet.about.image),
    },
    earthworks: {
      heading: pendingTe(booklet.earthworks.heading, "భూమి పనులు మరియు ల్యాండ్ లెవల్లింగ్"),
      lead: pendingTe(
        booklet.earthworks.lead,
        "పొలం భూమి, ప్లాట్లు మరియు బిల్డింగ్ సైట్ల కోసం క్లియరింగ్, కట్టింగ్, ఫిల్లింగ్ మరియు లెవల్లింగ్, మా స్వంత JCB, ఎక్స్కవేటర్ మరియు డోజర్‌తో.",
      ),
      image: parseBookletImage(booklet.earthworks.image),
      imageSecondary: parseBookletImage(booklet.earthworks.image2),
      process: booklet.earthworks.process.map((step) => ({
        heading: pendingTe(
          step.h,
          step.h === "Survey"
            ? "సర్వే"
            : step.h === "Clearing"
              ? "క్లియరింగ్"
              : step.h === "Cut and fill"
                ? "కట్ మరియు ఫిల్"
                : step.h === "Levelling"
                  ? "లెవల్లింగ్"
                  : "హ్యాండ్‌ఓవర్",
        ),
        text: pendingTe(step.t, `[te] ${step.t}`),
      })),
    },
    precast: {
      heading: pendingTe(booklet.precast.heading, "ప్రీకాస్ట్ కాంపౌండ్ గోడలు"),
      lead: pendingTe(
        booklet.precast.lead,
        "వేగంగా ఏర్పాటు, సరిగా లైన్ మరియు ఉపయోగానికి సిద్ధం. మీ బడ్జెట్‌కు సరిపడా ప్యానెల్ ఎంచుకోండి.",
      ),
      handmadeImage: parseBookletImage(booklet.precast.handmade),
      machineImage: parseBookletImage(booklet.precast.machine),
      comparisonRows: booklet.precast.rows.map((row) =>
        row.map((cell, col) => {
          if (col === 0 && cell === "Panels") {
            return pendingTe(cell, "ప్యానెల్స్");
          }
          if (col === 0 && cell === "Panel thickness") {
            return pendingTe(cell, "ప్యానెల్ మందం");
          }
          if (col === 0 && cell === "Rate") {
            return pendingTe(cell, "రేటు");
          }
          if (cell === "Hand-cast precast panels") {
            return pendingTe(cell, "చేతితో కాస్ట్ ప్రీకాస్ట్ ప్యానెల్స్");
          }
          if (cell === "Prestressed, machine-made panels") {
            return pendingTe(cell, "ప్రెస్ట్రెస్డ్, మెషిన్-మేడ్ ప్యానెల్స్");
          }
          if (cell === "On request") {
            return pendingTe(cell, "అభ్యర్థనపై");
          }
          if (cell === "2 inch") {
            return pendingTe(cell, "2 అంగుళాలు");
          }
          return pendingTe(cell, cell);
        }),
      ),
      note: pendingTe(
        booklet.precast.note,
        "రేట్లు గోడ ప్రతి చదరపు అడుగుకు. మా స్వంత పోస్ట్-హోల్ డిగ్గర్‌తో పోస్ట్ రంధ్రాలు కనిపెట్టవచ్చు.",
      ),
    },
    wallDesigns: {
      heading: pendingTe(booklet.walls.heading, "కాంపౌండ్ వాల్ డిజైన్లు"),
      lead: pendingTe(
        booklet.walls.lead,
        "ప్రీకాస్ట్ కాపీంగా, మేము రాతి, ఇటుక మరియు కాంక్రీట్‌లో కాంపౌండ్ గోడలు నిర్మిస్తాము, మీరు కోరిన ఫినిష్‌తో.",
      ),
      options: booklet.walls.items.map((item) => designOption(item, wallTe)),
    },
    farmHouseDesigns: {
      heading: pendingTe(booklet.farmhouses.heading, "ఫార్మ్ హౌస్ డిజైన్లు"),
      lead: pendingTe(
        booklet.farmhouses.lead,
        "మీ భూమిపై ఫార్మ్ హౌస్ కోసం సాంప్రదాయం నుండి ఆధునికత వరకు ఆరు దిశలు. ప్రతి డిజైన్ మీ ప్లాట్, లేఅవుట్ మరియు బడ్జెట్‌కు అనుకూలం చేయవచ్చు.",
      ),
      options: booklet.farmhouses.items.map((item) => designOption(item, farmTe)),
    },
    fencing: {
      heading: pendingTe(booklet.fencing.heading, "ఫెన్సింగ్"),
      lead: pendingTe(
        booklet.fencing.lead,
        "పొలాలు, ప్లాట్లు మరియు బహిరంగ భూమి కోసం ఫెన్సింగ్, కాంట్రాక్ట్‌పై, మా స్వంత యంత్రంతో పోస్ట్-హోల్ కనిపెట్టడం సహితం.",
      ),
      ownImage: parseBookletImage(booklet.fencing.own),
      options: booklet.fencing.items.map((item) => designOption(item, fenceTe)),
    },
    building: {
      heading: pendingTe(booklet.building.heading, "బిల్డింగ్ మరియు సివిల్ కాంట్రాక్టులు"),
      lead: pendingTe(
        booklet.building.lead,
        "ఫార్మ్ హౌసులు, బిల్డింగ్‌లు మరియు సాధారణ సివిల్ పనులు కాంట్రాక్ట్‌పై, భూమి పనికి మా స్వంత యంత్రాల మద్దతుతో.",
      ),
      image: parseBookletImage(booklet.building.image),
      blocks: booklet.building.blocks.map((block) => ({
        heading: pendingTe(
          block.h,
          block.h === "Building contracts"
            ? "బిల్డింగ్ కాంట్రాక్టులు"
            : block.h === "Farm house construction"
              ? "ఫార్మ్ హౌస్ నిర్మాణం"
              : "సివిల్ కాంట్రాక్టులు",
        ),
        text: pendingTe(block.t, `[te] ${block.t}`),
      })),
    },
    process: {
      heading: pendingTe(booklet.process.heading, "మేము ఎలా పని చేస్తాము"),
      steps: booklet.process.steps.map((step) => {
        const paymentTerms =
          step.pay && step.pay.length === 3
            ? {
                startPercent: 30 as const,
                midPercent: 50 as const,
                handoverPercent: 20 as const,
              }
            : undefined;
        return {
          heading: pendingTe(
            step.h,
            step.h === "Survey"
              ? "సర్వే"
              : step.h === "Quote"
                ? "కోట్"
                : step.h === "Milestone payments"
                  ? "మైల్‌స్టోన్ చెల్లింపులు"
                  : step.h === "Execution"
                    ? "అమలు"
                    : "హ్యాండ్‌ఓవర్",
          ),
          body: pendingTe(
            step.t,
            step.h === "Milestone payments"
              ? "ప్రారంభానికి 30%, అంగీకరించిన మధ్య మైల్‌స్టోన్‌లో 50%, హ్యాండ్‌ఓవర్‌లో 20%."
              : `[te] ${step.t}`,
          ),
          ...(paymentTerms ? { paymentTerms } : {}),
        };
      }),
    },
  },
  imageBadgeLabels: {
    own: te.badgeOwn,
    design: te.badgeDesign,
    illus: te.badgeIllus,
  },
};

// Fix earthworks process te placeholders with proper Telugu
const earthProcessTe: Record<string, string> = {
  "Site visit, levels and extent of work agreed with you.": "సైట్ సందర్శన, మీతో పని యొక్క స్థాయిలు మరియు వ్యాప్తి అంగీకరించబడతాయి.",
  "Bushes, roots, stones and debris removed.": "చెట్లు, మూలాలు, రాళ్లు మరియు శిధిలాలు తొలగించబడతాయి.",
  "High ground cut, low ground filled.": "ఎత్తైన భూమి కట్, తక్కువ భూమి నింపబడుతుంది.",
  "Spread and graded to the agreed levels and slopes.": "అంగీకరించిన స్థాయిలు మరియు వాలులకు వ్యాప్తి మరియు గ్రేడ్.",
  "Final levels checked with you on site.": "చివరి స్థాయిలు సైట్‌లో మీతో తనిఖీ చేయబడతాయి.",
};

for (const step of document.booklet.earthworks.process) {
  const mapped = earthProcessTe[step.text.en];
  if (mapped) {
    step.text = pendingTe(step.text.en, mapped);
  }
}

const buildingBlockTe: Record<string, string> = {
  "Building construction on contract, from foundations to finishing, to your drawings or general design options that can be adapted to your plot and budget.":
    "కాంట్రాక్ట్‌పై బిల్డింగ్ నిర్మాణం, ఫౌండేషన్ల నుండి ఫినిషింగ్ వరకు, మీ డ్రాయింగ్‌లకు లేదా మీ ప్లాట్ మరియు బడ్జెట్‌కు అనుకూలం చేయగల సాధారణ డిజైన్ ఎంపికలకు.",
  "Any of the farm house designs in this booklet, or your own, built on your land.":
    "ఈ బుక్‌లెట్‌లోని ఏదైనా ఫార్మ్ హౌస్ డిజైన్, లేదా మీ స్వంతం, మీ భూమిపై నిర్మించబడుతుంది.",
  "General civil works on contract, such as foundations, RCC, masonry and site works.":
    "కాంట్రాక్ట్‌పై సాధారణ సివిల్ పనులు, ఉదాహరణకు ఫౌండేషన్లు, RCC, మేసన్రీ మరియు సైట్ పనులు.",
};

for (const block of document.booklet.building.blocks) {
  const mapped = buildingBlockTe[block.text.en];
  if (mapped) {
    block.text = pendingTe(block.text.en, mapped);
  }
}

const processStepTe: Record<string, string> = {
  "We visit the site, take measurements and understand what you need.": "మేము సైట్‌ను సందర్శిస్తాము, కొలతలు తీసుకుంటాము మరియు మీ అవసరాలను అర్థం చేస్తాము.",
  "You get a written quote with scope and rates.": "మీకు పరిధి మరియు రేట్లతో రాత పూర్వక కోట్ అందుతుంది.",
  "Our own machines and team carry out the work to the agreed scope.": "మా స్వంత యంత్రాలు మరియు బృందం అంగీకరించిన పరిధికి పని చేస్తారు.",
  "We walk the finished work with you before closing.": "ముగింపు ముందు పూర్తయిన పనిని మీతో కలిసి చూస్తాము.",
};

for (const step of document.booklet.process.steps) {
  if (step.heading.en === "Milestone payments") {
    continue;
  }
  const mapped = processStepTe[step.body.en];
  if (mapped) {
    step.body = pendingTe(step.body.en, mapped);
  }
}

const fileBody = `// Generated by scripts/import-catalogue.ts — do not edit by hand.
// Re-generate: pnpm --filter @repo/content-catalogue import-catalogue

export const catalogueDocumentSource = ${JSON.stringify(document, null, 2)} as const;
`;

writeFileSync(outPath, fileBody, "utf8");
console.log(`Wrote ${outPath}`);

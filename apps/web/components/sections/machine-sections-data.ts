export const MACHINE_SLIDES = [
  {
    id: "jcb",
    image: "/images/jcb-section.jpg",
    imageAlt: "JCB backhoe loader at a construction site in Telangana",
    eyebrow: "EARTHMOVING",
    eyebrow_te: "మట్టి తవ్వకం",
    title_en: "JCB Backhoe Loader",
    title_te: "JCB బ్యాక్‌హో లోడర్",
    body_en:
      "The workhorse of every site — ready for excavation, stone breaking with rock breaker attachments, earthmoving, and site levelling across Hyderabad's ORR corridor and beyond.",
    body_te:
      "ప్రతి సైట్‌కూ అవసరమైన యంత్రం. తవ్వకానికి, లోడింగ్‌కు, గ్రేడింగ్‌కు — మీకు కావలసిన చోటికి.",
    specs: [
      { label_en: "Trained operator included", label_te: "శిక్షణ పొందిన ఆపరేటర్ అందుబాటులో" },
      { label_en: "Available across Telangana", label_te: "తెలంగాణలో అందుబాటులో" },
      { label_en: "Hourly & daily rates", label_te: "గంట & రోజు రేట్లు" },
    ],
    cta_en: "Book a JCB Now",
    cta_te: "ఇప్పుడే JCB బుక్ చేయండి",
  },
  {
    id: "posthole",
    image: "/images/posthole-section.png",
    imageAlt: "Post hole digger auger machine in a field in Telangana",
    eyebrow: "DRILLING & FENCING",
    eyebrow_te: "డ్రిల్లింగ్ & ఫెన్సింగ్",
    title_en: "Post Hole Digger",
    title_te: "పోస్ట్ హోల్ డిగ్గర్",
    body_en:
      "Precise auger drilling for hole digging, earthing rod pits, foundation holes, and precast compound wall pole work — fencing, solar, and telecom foundations across Telangana.",
    body_te:
      "కంచె, పునాది, సోలార్ ఫార్మ్ కోసం ఖచ్చితమైన డ్రిల్లింగ్. వేగంగా. నీట్‌గా. సమయానికి.",
    specs: [
      { label_en: "Multiple auger diameters", label_te: "వివిధ వ్యాసాల ఆగర్‌లు" },
      { label_en: "Rural & farm-ready", label_te: "గ్రామీణ & వ్యవసాయ సిద్ధంగా" },
      { label_en: "Per-hole or daily pricing", label_te: "రంధ్రం ప్రకారం లేదా రోజువారీ ధర" },
    ],
    cta_en: "Book a Post Hole Digger",
    cta_te: "పోస్ట్ హోల్ డిగ్గర్ బుక్ చేయండి",
  },
  {
    id: "crane",
    image: "/images/crane-section.jpg",
    imageAlt: "Heavy crane lifting steel beams at a construction site in Telangana",
    eyebrow: "HEAVY LIFTING",
    eyebrow_te: "భారీ ఎత్తడం",
    title_en: "Big Cranes",
    title_te: "పెద్ద క్రేన్లు",
    body_en:
      "16 to 100 ton capacity cranes for steel erection, heavy lifts, and large-scale infrastructure. On-demand across Telangana.",
    body_te:
      "16 నుండి 100 టన్నుల సామర్థ్యం గల క్రేన్లు — ఉక్కు నిర్మాణం, భారీ ఎత్తడం మరియు పెద్ద ఇన్‌ఫ్రా ప్రాజెక్టుల కోసం.",
    specs: [
      { label_en: "16–100 ton capacity", label_te: "16–100 టన్నుల సామర్థ్యం" },
      { label_en: "Certified operators", label_te: "ధృవీకరించిన ఆపరేటర్లు" },
      { label_en: "Hourly & daily rates", label_te: "గంట & రోజు రేట్లు" },
    ],
    cta_en: "Book a Crane Now",
    cta_te: "ఇప్పుడే క్రేన్ బుక్ చేయండి",
  },
  {
    id: "borewell",
    image: "/images/borewell-section.jpg",
    imageAlt: "Borewell drilling rig with crane and auger at a construction site in Telangana",
    eyebrow: "PARTNER NETWORK",
    eyebrow_te: "పార్ట్నర్ నెట్‌వర్క్",
    title_en: "Borewell Drilling",
    title_te: "బోర్వెల్ తవ్వకం",
    body_en:
      "Borewell digging for residential plots, farms, and construction sites — fulfilled through our verified partner network with transparent pricing and a single point of contact.",
    body_te:
      "Residential plots, farms, construction sites kosam borewell digging — ma verified partner network dwara transparent pricing mariyu single point of contact tho.",
    specs: [
      { label_en: "Verified partner contractors", label_te: "ధృవీకరించిన పార్ట్నర్ కాంట్రాక్టors" },
      { label_en: "Residential & farm borewells", label_te: "Residential & farm borewells" },
      { label_en: "WhatsApp inquiry — no self-serve booking", label_te: "WhatsApp inquiry" },
    ],
    cta_en: "Enquire on WhatsApp",
    cta_te: "WhatsApp lo adagandi",
  },
] as const;

export type MachineSlide = (typeof MACHINE_SLIDES)[number];

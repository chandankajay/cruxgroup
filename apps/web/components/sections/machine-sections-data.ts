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
      "The workhorse of every site. Ready for digging, loading, and grading — wherever you need it.",
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
      "Precise auger drilling for fencing, foundations, and solar farm installations. Fast. Clean. On time.",
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
] as const;

export type MachineSlide = (typeof MACHINE_SLIDES)[number];

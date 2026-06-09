import type { Prisma, PrismaClient } from "@prisma/client";

const SITE_CONFIG_ROWS: { key: string; value: string }[] = [
  { key: "phone", value: "9182054293" },
  { key: "email", value: "connect@cruxgroup.in" },
  { key: "address", value: "Kothur, Telangana, India" },
  { key: "instagram", value: "https://www.instagram.com/cruxgroup.in" },
  { key: "youtube", value: "https://www.youtube.com/@cruxgroup" },
  { key: "heroTagline_en", value: "Telangana's Heavy Equipment Network" },
  {
    key: "heroSubtitle_en",
    value: "JCBs, Cranes, Excavators, Dozers — on-demand. Built for builders.",
  },
  { key: "heroTagline_te", value: "తెలంగాణ హెవీ ఎక్విప్‌మెంట్ నెట్‌వర్క్" },
  {
    key: "heroSubtitle_te",
    value: "JCBలు, క్రేన్లు, ఎక్స్‌కవేటర్లు — అవసరమైనప్పుడు అందుబాటులో.",
  },
  { key: "partnerHook_en", value: "Your machines sit idle. Every hour costs you." },
  { key: "partnerHook_te", value: "మీ యంత్రాలు నిష్క్రియంగా ఉన్నాయి. ప్రతి గంట నష్టమే." },
  {
    key: "partnerSub_en",
    value: "List once. Get matched bookings across Telangana — without ad spend.",
  },
  {
    key: "partnerSub_te",
    value: "ఒకసారి జాబితా చేయండి. ప్రకటన ఖర్చు లేకుండా బుకింగ్‌లు పొందండి.",
  },
  {
    key: "footerTagline_en",
    value: "Heavy equipment, one platform — for contractors and fleet owners.",
  },
  {
    key: "footerTagline_te",
    value: "కాంట్రాక్టర్లు మరియు ఫ్లీట్ యజమానుల కోసం ఒకే వేదిక.",
  },
  {
    key: "fleetHeading_en",
    value: "Every Machine You Need. One Platform.",
  },
  {
    key: "fleetHeading_te",
    value: "మీకు కావలసిన ప్రతి యంత్రం. ఒకే వేదిక.",
  },
  {
    key: "fleetSub_en",
    value: "Verified categories available across the state — book when you need them.",
  },
  {
    key: "fleetSub_te",
    value: "రాష్ట్రవ్యాప్తంగా ధృవీకరించిన వర్గాలు — అవసరమైనప్పుడు బుక్ చేయండి.",
  },
  {
    key: "customersHeading_en",
    value: "Built for contractors, developers, and infra teams",
  },
  {
    key: "customersHeading_te",
    value: "కాంట్రాక్టర్లు, డెవలపర్లు మరియు ఇన్‌ఫ్రా బృందాల కోసం",
  },
  {
    key: "customersSub_en",
    value: "From short hires to long projects — one call, one platform.",
  },
  {
    key: "customersSub_te",
    value: "చిన్న అద్దెల నుండి పొడవైన ప్రాజెక్టుల వరకు.",
  },
  { key: "faqHeading_en", value: "Questions, answered" },
  { key: "faqHeading_te", value: "ప్రశ్నలు, సమాధానాలు" },
  { key: "ctaSecondaryLabel_en", value: "Become a Partner" },
  { key: "ctaSecondaryLabel_te", value: "భాగస్వామి అవ్వండి" },
];

type BlockSeed = {
  type: Prisma.SiteBlockType;
  order: number;
  heading_en?: string | null;
  heading_te?: string | null;
  body_en?: string | null;
  body_te?: string | null;
  cta_label_en?: string | null;
  cta_label_te?: string | null;
  cta_href?: string | null;
  imageUrl?: string | null;
  icon?: string | null;
};

type SectionSeed = {
  slug: string;
  order: number;
  blocks: BlockSeed[];
};

const SECTIONS: SectionSeed[] = [
  {
    slug: "hero",
    order: 1,
    blocks: [
      {
        type: "HERO",
        order: 1,
        heading_en: "Telangana's #1 Equipment Network",
        heading_te: "తెలంగాణ #1 ఎక్విప్‌మెంట్ నెట్‌వర్క్",
        body_en: "",
        body_te: "",
      },
    ],
  },
  {
    slug: "stats",
    order: 2,
    blocks: [
      {
        type: "STAT",
        order: 1,
        heading_en: "Machines on platform",
        heading_te: "వేదికపై యంత్రాలు",
        body_en: "10",
        body_te: "10",
      },
      {
        type: "STAT",
        order: 2,
        heading_en: "Partner fleet owners",
        heading_te: "భాగస్వామి ఫ్లీట్ యజమానులు",
        body_en: "4",
        body_te: "4",
      },
      {
        type: "STAT",
        order: 3,
        heading_en: "Districts covered",
        heading_te: "కవర్ చేసిన జిల్లాలు",
        body_en: "2",
        body_te: "2",
      },
      {
        type: "STAT",
        order: 4,
        heading_en: "Bookings completed",
        heading_te: "పూర్తి చేసిన బుకింగ్‌లు",
        body_en: "10",
        body_te: "10",
      },
    ],
  },
  {
    slug: "fleet",
    order: 3,
    blocks: [
      {
        type: "EQUIPMENT_CARD",
        order: 1,
        heading_en: "JCB",
        heading_te: "JCB",
        body_en: "Backhoe loaders for digging, loading, and site prep.",
        body_te: "తవ్వకం, లోడింగ్ కోసం.",
        icon: "Tractor",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 2,
        heading_en: "Crane",
        heading_te: "క్రేన్",
        body_en: "Lifting and placement for multi-storey builds.",
        body_te: "బహుళ అంతస్తు నిర్మాణాల కోసం.",
        icon: "Building2",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 3,
        heading_en: "Big Cranes",
        heading_te: "పెద్ద క్రేన్లు",
        body_en: "16–100 ton capacity for steel erection, heavy lifts, and large infrastructure.",
        body_te: "ఉక్కు నిర్మాణం మరియు భారీ ఇన్‌ఫ్రా కోసం 16–100 టన్నుల సామర్థ్యం.",
        icon: "Crane",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 4,
        heading_en: "Mini Crane",
        heading_te: "మినీ క్రేన్",
        body_en: "Tight sites and lane work with compact reach.",
        body_te: "ఇరుకైన ప్రదేశాలలో సౌకర్యవంతం.",
        icon: "ArrowBigUp",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 5,
        heading_en: "Excavator",
        heading_te: "ఎక్స్‌కవేటర్",
        body_en: "Bulk earthwork, trenches, and foundations.",
        body_te: "భూమి పనులు, ట్రెంచ్‌లు.",
        icon: "Pickaxe",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 6,
        heading_en: "Dozer",
        heading_te: "డోజర్",
        body_en: "Rough grading, push, and site clearing.",
        body_te: "గ్రేడింగ్ మరియు క్లియరింగ్.",
        icon: "Truck",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 7,
        heading_en: "Road Roller",
        heading_te: "రోడ్ రోలర్",
        body_en: "Compaction for roads and paved yards.",
        body_te: "రోడ్ల కోసం కంపాక్షన్.",
        icon: "CircleDot",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 8,
        heading_en: "Post Hole Digger",
        heading_te: "పోస్ట్ హోల్ డిగ్గర్",
        body_en: "Fence lines, poles, and agriculture footings.",
        body_te: "ఫెన్సింగ్ మరియు వ్యవసాయ పనులు.",
        icon: "Drill",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 9,
        heading_en: "Compactor",
        heading_te: "కంపాక్టర్",
        body_en: "Plate and trench compaction where rollers cannot go.",
        body_te: "ఇరుకు ప్రదేశాల కంపాక్షన్.",
        icon: "Layers",
      },
      {
        type: "EQUIPMENT_CARD",
        order: 10,
        heading_en: "Borewell Drilling",
        heading_te: "బోర్వెల్ తవ్వకం",
        body_en: "Residential and farm borewells via our verified partner network.",
        body_te: "Ma verified partner network dwara residential mariyu farm borewells.",
        icon: "Drill",
      },
    ],
  },
  {
    slug: "partners",
    order: 4,
    blocks: [
      {
        type: "FEATURE_CARD",
        order: 1,
        heading_en: "More Bookings",
        heading_te: "మరిన్ని బుకింగ్‌లు",
        body_en: "Demand routed to your idle hours — not random leads.",
        body_te: "అవసరమైన సమయంలో డిమాండ్.",
      },
      {
        type: "FEATURE_CARD",
        order: 2,
        heading_en: "Zero Marketing Cost",
        heading_te: "జీరో మార్కెటింగ్ ఖర్చు",
        body_en: "We match jobs to your fleet; you focus on uptime.",
        body_te: "మీ ఫ్లీట్‌పై దృష్టి పెట్టండి.",
      },
      {
        type: "FEATURE_CARD",
        order: 3,
        heading_en: "You Stay in Control",
        heading_te: "నియంత్రణ మీ చేతుల్లో",
        body_en: "Accept what fits your schedule and service radius.",
        body_te: "మీ షెడ్యూల్‌కు అనుగుణంగా.",
      },
    ],
  },
  {
    slug: "customers",
    order: 5,
    blocks: [
      {
        type: "FEATURE_CARD",
        order: 1,
        heading_en: "On-demand machines",
        heading_te: "ఆన్-డిమాండ్ యంత్రాలు",
        body_en: "Book the class you need for the window you have.",
        body_te: "మీకు కావలసిన విండోలో బుక్ చేయండి.",
      },
      {
        type: "FEATURE_CARD",
        order: 2,
        heading_en: "Verified operators",
        heading_te: "ధృవీకరించిన ఆపరేటర్లు",
        body_en: "Skilled operators aligned to equipment class.",
        body_te: "నైపుణ్యం కలిగిన ఆపరేటర్లు.",
      },
      {
        type: "FEATURE_CARD",
        order: 3,
        heading_en: "Track in real time",
        heading_te: "రియల్ టైమ్‌లో ట్రాక్",
        body_en: "Status updates from dispatch through job completion.",
        body_te: "డిస్పాచ్ నుండి పూర్తి వరకు అప్‌డేట్‌లు.",
      },
    ],
  },
  {
    slug: "faq",
    order: 6,
    blocks: [
      {
        type: "FAQ_ITEM",
        order: 1,
        heading_en: "How fast can I get a machine on site?",
        heading_te: "సైట్‌కు ఎంత త్వరగా యంత్రం వస్తుంది?",
        body_en:
          "Typical slots are matched within hours depending on equipment class, distance, and operator availability. Urgent requests go to the nearest verified fleet first.",
        body_te: "దూరం మరియు అందుబాటుపై ఆధారపడి గంటల్లోపు మ్యాచ్.",
      },
      {
        type: "FAQ_ITEM",
        order: 2,
        heading_en: "Do you cover all of Telangana?",
        heading_te: "మొత్తం తెలంగాణను కవర్ చేస్తారా?",
        body_en:
          "Our network spans major districts and expanding corridors. Enter your site pincode on the bookings app to confirm live coverage.",
        body_te: "బుకింగ్ యాప్‌లో పిన్‌కోడ్ నమోదు చేసి ధృవీకరించండి.",
      },
      {
        type: "FAQ_ITEM",
        order: 3,
        heading_en: "Are operators included?",
        heading_te: "ఆపరేటర్లు చేర్చబడ్డారా?",
        body_en:
          "Yes — bookings are fulfilled with qualified operators unless you explicitly request dry hire where policy allows.",
        body_te: "అర్హత కలిగిన ఆపరేటర్లతో పూర్తి చేయబడుతుంది.",
      },
      {
        type: "FAQ_ITEM",
        order: 4,
        heading_en: "How do fleet owners join?",
        heading_te: "ఫ్లీట్ యజమానులు ఎలా చేరగలరు?",
        body_en:
          "Use the partner portal to register machines, documents, and service areas. Our team verifies listings before they go live.",
        body_te: "భాగస్వామి పోర్టల్ ద్వారా నమోదు చేయండి.",
      },
      {
        type: "FAQ_ITEM",
        order: 5,
        heading_en: "Is pricing shown on the website?",
        heading_te: "వెబ్‌సైట్‌లో ధరలు చూపబడతాయా?",
        body_en:
          "Rates vary by duration, distance, and equipment condition. Final quotes are confirmed in the bookings flow after you share site details.",
        body_te: "బుకింగ్ ఫ్లోలో చివరి కోట్ ధృవీకరించబడుతుంది.",
      },
    ],
  },
  {
    slug: "cta",
    order: 7,
    blocks: [
      {
        type: "CTA_STRIP",
        order: 1,
        heading_en: "Ready when your site is.",
        heading_te: "మీ సైట్ సిద్ధంగా ఉన్నప్పుడు.",
        body_en: "Rent equipment or list your fleet — start in minutes.",
        body_te: "అద్దెకు తీసుకోండి లేదా ఫ్లీట్ జాబితా చేయండి.",
        cta_label_en: "Start Renting",
        cta_label_te: "అద్దె ప్రారంభించండి",
        cta_href: null,
      },
    ],
  },
];

export async function seedWebsiteContent(prisma: PrismaClient): Promise<void> {
  for (const row of SITE_CONFIG_ROWS) {
    await prisma.siteConfig.upsert({
      where: { key: row.key },
      update: { value: row.value },
      create: row,
    });
  }

  for (const sec of SECTIONS) {
    const section = await prisma.siteSection.upsert({
      where: { slug: sec.slug },
      update: { order: sec.order, published: true },
      create: { slug: sec.slug, order: sec.order, published: true },
    });

    await prisma.siteBlock.deleteMany({ where: { sectionId: section.id } });

    const data: Prisma.SiteBlockCreateManyInput[] = sec.blocks.map((b) => ({
      sectionId: section.id,
      type: b.type,
      order: b.order,
      heading_en: b.heading_en ?? null,
      heading_te: b.heading_te ?? null,
      body_en: b.body_en ?? null,
      body_te: b.body_te ?? null,
      cta_label_en: b.cta_label_en ?? null,
      cta_label_te: b.cta_label_te ?? null,
      cta_href: b.cta_href ?? null,
      imageUrl: b.imageUrl ?? null,
      videoUrl: null,
      icon: b.icon ?? null,
      published: true,
    }));

    await prisma.siteBlock.createMany({ data });
  }

  const samplePosts: Prisma.BlogPostCreateInput[] = [
    {
      slug: "dispatch-notes-from-the-field",
      title_en: "Dispatch notes from the field",
      title_te: "ఫీల్డ్ నుండి డిస్పాచ్ నోట్స్",
      excerpt_en: "How we match urgent bookings to the nearest verified fleet.",
      excerpt_te: "అత్యవసర బుకింగ్‌లను ఎలా మ్యాచ్ చేస్తాము.",
      body_en: "<p>Placeholder draft — publish from Website CMS when ready.</p>",
      body_te: "<p>డ్రాఫ్ట్.</p>",
      published: false,
      tags: ["operations", "dispatch"],
      authorName: "Crux Team",
    },
    {
      slug: "safety-checklist-before-first-shift",
      title_en: "Safety checklist before the first shift",
      title_te: "మొదటి షిఫ్ట్ ముందు భద్రతా చెక్‌లిస్ట్",
      excerpt_en: "A quick walkthrough we share with contractors and operators.",
      excerpt_te: "కాంట్రాక్టర్లు మరియు ఆపరేటర్లకు మా వాక్‌థ్రూ.",
      body_en: "<p>Placeholder draft — publish from Website CMS when ready.</p>",
      body_te: null,
      published: false,
      tags: ["safety"],
      authorName: "Crux Team",
    },
  ];

  for (const post of samplePosts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.blogPost.create({ data: post });
    }
  }
}

import type { Location } from "./locations";

export interface FaqItem {
  question: string;
  answer: string;
}

/** Location-specific FAQs for Hyderabad Prime and ORR Corridor (Priority 1 & 2 only). */
const LOCATION_FAQS: Record<string, FaqItem[]> = {
  kokapet: [
    {
      question: "Can you do earthing rod pit digging in Kokapet?",
      answer:
        "Yes — we provide earthing pit digging services in Kokapet and the Financial District fringe. Our post hole digger handles standard earthing pit depths. WhatsApp us your site address for availability and rates.",
    },
    {
      question: "What is the cost of foundation hole drilling near Kokapet?",
      answer:
        "Foundation hole costs depend on depth, diameter, and number of holes. We serve Kokapet, Narsingi, and Nallagandla with transparent per-hole pricing. Contact us on WhatsApp for a same-day quote.",
    },
  ],
  tukkuguda: [
    {
      question: "Do you offer auger rental for warehouse fencing in Tukkuguda?",
      answer:
        "Yes — auger rental and hole digging for industrial compound walls is one of our most booked services in Tukkuguda's data centre corridor. We handle earthing rod pits and precast wall pole holes too.",
    },
    {
      question: "Can I book a post hole digger for earthing pits in Tukkuguda?",
      answer:
        "Our post hole digger handles electrical earthing pit requirements for warehouse and logistics builds in Tukkuguda. WhatsApp your site pin and pit specifications for a quote.",
    },
  ],
  adibatla: [
    {
      question: "Do you serve Adibatla aerospace SEZ for earthing pit digging?",
      answer:
        "Yes — we provide earthing pit digging and compound wall pole holes for industrial units in Adibatla and the aerospace SEZ belt. Local verified operators know SEZ access procedures.",
    },
    {
      question: "What equipment is available for industrial excavation in Adibatla?",
      answer:
        "JCB backhoe loaders and post hole diggers are available for industrial grading, foundation holes, and fencing work in Adibatla. WhatsApp us with your project timeline.",
    },
  ],
  narsingi: [
    {
      question: "Can you drill foundation holes for villa layouts in Narsingi?",
      answer:
        "Yes — foundation holes and column footing drilling for ORR west villa layouts in Narsingi is a core service. Our post hole digger handles depths from 3 to 12 feet with consistent diameter.",
    },
    {
      question: "How do I book a JCB for site grading in Narsingi?",
      answer:
        "Message Crux on WhatsApp with your Narsingi site location and grading requirements. We match you with a verified JCB operator for excavation and site levelling along the ORR west corridor.",
    },
  ],
  tellapur: [
    {
      question: "Do you provide foundation hole drilling in Tellapur layouts?",
      answer:
        "Yes — foundation holes for HMDA-approved layouts in Tellapur and the western corridor are handled by our post hole digger fleet. Per-hole and daily rates available.",
    },
    {
      question: "Is auger hire available for compound walls near Tellapur?",
      answer:
        "Auger hire for compound wall pole holes and boundary wall drilling is available across Tellapur and neighbouring Nallagandla. WhatsApp us for same-week availability.",
    },
  ],
  nallagandla: [
    {
      question: "Can you do hole digging for plotted layouts in Nallagandla?",
      answer:
        "Yes — hole digging for HMDA plotted layouts in Nallagandla is one of our busiest ORR west services. We handle compound wall poles, foundation holes, and borewell contractor referrals.",
    },
    {
      question: "What is the rate for foundation holes in Nallagandla?",
      answer:
        "Foundation hole rates depend on depth and soil type. We serve Nallagandla, Tellapur, and Narsingi with transparent per-hole pricing — contact us on WhatsApp for a quote.",
    },
  ],
  ghatkesar: [
    {
      question: "Do you offer earthing pit digging in Ghatkesar?",
      answer:
        "Yes — earthing pit digging for residential and commercial layouts in Ghatkesar's east Hyderabad boom belt is available through our post hole digger service.",
    },
    {
      question: "Can I book excavation for a new layout in Ghatkesar?",
      answer:
        "JCB excavation and site levelling for plotted layouts in Ghatkesar is available with verified local operators. WhatsApp your layout name and acreage for rates.",
    },
  ],
  bachupally: [
    {
      question: "Do you handle basement excavation in Bachupally?",
      answer:
        "Yes — basement excavation and foundation holes for apartment and villa projects in Bachupally's northwest corridor are handled by our JCB and post hole digger fleet.",
    },
    {
      question: "Is auger hire available for compound walls in Bachupally?",
      answer:
        "Auger hire for compound wall pole holes and foundation drilling is available in Bachupally and nearby Medchal. Message us on WhatsApp with your plot details.",
    },
  ],
  maheshwaram: [
    {
      question: "Do you offer rock breaking JCBs in Maheshwaram?",
      answer:
        "Yes — stone breaking and rock breaker JCB hire for hard strata pharma plots in Maheshwaram is available. Operators with breaker attachments know local granite pockets.",
    },
    {
      question: "Can you dig earthing pits for industrial plots in Maheshwaram?",
      answer:
        "Earthing pit digging for ORR south industrial and pharma plots in Maheshwaram is handled by our post hole digger service. WhatsApp your site for availability.",
    },
  ],
  "kongara-kalan": [
    {
      question: "Do you provide rock breaking services in Kongara Kalan?",
      answer:
        "Yes — rock breaking and JCB rock breaker hire for pharma plots and hard strata sites in Kongara Kalan is a common booking along the ORR south corridor.",
    },
    {
      question: "Can you drill compound wall holes in Kongara Kalan layouts?",
      answer:
        "Precast wall holes and compound wall pole drilling for plotted developments in Kongara Kalan are handled by our auger fleet. Contact us on WhatsApp for rates.",
    },
  ],
  patancheru: [
    {
      question: "Do you handle earthing rod pit digging in Patancheru industrial belt?",
      answer:
        "Yes — earthing rod pits for TS-iPASS industrial units in Patancheru require precise depth and diameter. Our post hole digger meets electrical inspector specifications.",
    },
    {
      question: "Is JCB hire available for factory site grading in Patancheru?",
      answer:
        "JCB hire for industrial site grading and excavation in Patancheru and the chemical belt is available with verified operators. WhatsApp your factory location.",
    },
  ],
  sangareddy: [
    {
      question: "Can you dig earthing pits for TSIDC factories in Sangareddy?",
      answer:
        "Yes — earthing pit digging for TSIDC industrial estates in Sangareddy is handled by our post hole digger fleet along the NH65 belt.",
    },
    {
      question: "Do you offer JCB excavation for warehouse builds in Sangareddy?",
      answer:
        "JCB excavation and site levelling for factory and warehouse construction in Sangareddy is available. Message us on WhatsApp with your project dates.",
    },
  ],
  ibrahimpatnam: [
    {
      question: "Do you drill compound wall holes in Ibrahimpatnam layouts?",
      answer:
        "Yes — compound wall pole holes and precast wall drilling for south ORR plotted developments in Ibrahimpatnam are core auger services.",
    },
    {
      question: "Is rock breaking available for sloped plots in Ibrahimpatnam?",
      answer:
        "Rock breaking and JCB grading for sloped ORR service terrain in Ibrahimpatnam is available with operators experienced on elevated layout sites.",
    },
  ],
  medchal: [
    {
      question: "Do you offer JCB excavation for warehouses in Medchal?",
      answer:
        "Yes — JCB excavation and site grading for north ORR logistics and warehousing in Medchal is one of our most booked services. WhatsApp your warehouse site address.",
    },
    {
      question: "Can I book a post hole digger for industrial fencing in Medchal?",
      answer:
        "Post hole digger hire for industrial compound fencing along the north ORR corridor in Medchal is available with same-week mobilisation options.",
    },
  ],
};

function genericFaqs(location: Location): FaqItem[] {
  const { displayName, district, nhCorridor, distanceFromHyderabad } = location;

  return [
    {
      question: `How do I book heavy equipment in ${displayName}?`,
      answer: `Message Crux Group on WhatsApp with your site location in ${displayName}, equipment type, and dates. We match you with a verified operator in ${district} district and confirm rates before mobilisation. You can also sign in at bookings.cruxgroup.in to book online.`,
    },
    {
      question: `What equipment is available for hire near ${displayName}?`,
      answer: `Crux offers JCB backhoe loaders, excavators, mobile cranes, post hole diggers (auger machines), tractors, and tippers near ${displayName}. Availability depends on your dates — WhatsApp us for same-day options along ${nhCorridor}.`,
    },
    {
      question: `Does Crux Group serve all of ${district} district?`,
      answer: `Yes. We cover ${displayName} and surrounding areas including ${location.nearbyAreas.slice(0, 3).join(", ")}. Operators are matched based on your site pin and project requirements across ${district}.`,
    },
    {
      question: `How far is ${displayName} from Hyderabad and does that affect rates?`,
      answer: `${displayName} is approximately ${distanceFromHyderabad} from Hyderabad on ${nhCorridor}. Local operators in the area typically charge lower mobilisation fees than machines brought from central Hyderabad — we show you the best rate upfront.`,
    },
    {
      question: `Do equipment rentals in ${displayName} include GST invoices?`,
      answer: `Every Crux booking generates a proper GST invoice with SAC code 997319. Contractors working on ${district} government and private projects can claim input tax credit — something junction hiring rarely provides.`,
    },
  ];
}

export function getLocationFaqs(location: Location): FaqItem[] {
  const specific = LOCATION_FAQS[location.slug];
  if (specific) return specific;
  return genericFaqs(location);
}

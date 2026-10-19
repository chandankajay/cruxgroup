export type ServiceAreaPageLocale = "en" | "te";

/** Telugu strings pending review by a Telugu reader (CWA-37). */
const tePendingReview = true;

export const serviceAreaPageMessages: Record<
  ServiceAreaPageLocale,
  {
    distanceHomeBase: string;
    distanceStraightLine: (km: number) => string;
    distanceRoad: (km: number) => string;
    distanceUnknown: string;
    lastReviewed: (formattedDate: string) => string;
  }
> = {
  en: {
    distanceHomeBase: "Our base is in Fathimapur (Kothur).",
    distanceStraightLine: (km) =>
      `${km.toFixed(1)} km straight-line from our Fathimapur (Kothur) base.`,
    distanceRoad: (km) => `About ${km.toFixed(1)} km by road.`,
    distanceUnknown:
      "Distance from our Fathimapur (Kothur) base is being updated.",
    lastReviewed: (formattedDate) => `Last reviewed ${formattedDate}.`,
  },
  te: {
    // PENDING_TE_REVIEW — placeholder until Telugu copy is reviewed.
    distanceHomeBase: tePendingReview
      ? "మా బేస్ ఫతిమాపూర్ (కోతూర్)లో ఉంది."
      : "",
    distanceStraightLine: (km) =>
      `మా ఫతిమాపూర్ (కోతూర్) బేస్ నుండి ${km.toFixed(1)} కి.మీ. సరళ దూరం.`,
    distanceRoad: (km) => `రోడ్డు ద్వారా సుమారు ${km.toFixed(1)} కి.మీ.`,
    distanceUnknown:
      "మా ఫతిమాపూర్ (కోతూర్) బేస్ నుండి దూరం నవీకరించబడుతోంది.",
    lastReviewed: (formattedDate) => `చివరిగా సమీక్షించబడినది ${formattedDate}.`,
  },
};

export function formatServiceAreaDistanceParagraph(params: {
  locale: ServiceAreaPageLocale;
  areaSlug: string;
  straightLineKm: number | null;
  roadKm: number | null;
  lastReviewed: Date | null;
}): string {
  const m =
    serviceAreaPageMessages[params.locale] ?? serviceAreaPageMessages.en;
  const parts: string[] = [];

  if (params.areaSlug === "fatimapur-kothur") {
    parts.push(m.distanceHomeBase);
  } else if (params.straightLineKm != null && params.straightLineKm > 0) {
    parts.push(m.distanceStraightLine(params.straightLineKm));
  } else if (params.straightLineKm === 0) {
    parts.push(m.distanceHomeBase);
  } else {
    parts.push(m.distanceUnknown);
  }

  if (params.roadKm != null && params.roadKm > 0) {
    parts.push(m.distanceRoad(params.roadKm));
  }

  if (params.lastReviewed) {
    const formatted = params.lastReviewed.toLocaleDateString(
      params.locale === "te" ? "te-IN" : "en-IN",
    );
    parts.push(m.lastReviewed(formatted));
  }

  return parts.join(" ");
}

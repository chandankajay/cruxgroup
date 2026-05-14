import { getSiteConfigMap } from "../../lib/content";
import { SITE_URL } from "../../lib/env";

export async function OrgJsonLd(): Promise<React.ReactElement> {
  const cfg = await getSiteConfigMap(["phone", "instagram", "youtube"]);
  const phone = cfg["phone"] ?? "";
  const instagram = cfg["instagram"] ?? "";
  const youtube = cfg["youtube"] ?? "";
  const sameAs = [instagram, youtube].filter(Boolean);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Crux Group",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: phone ? `+${phone.replace(/\D/g, "")}` : undefined,
      contactType: "customer service",
    },
    areaServed: "Telangana, India",
    sameAs,
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Crux Group",
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    telephone: phone || undefined,
    areaServed: "Telangana, India",
    sameAs,
  };

  const json = JSON.stringify([organization, localBusiness]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

import type { Metadata } from "next";
import type { SiteBlock } from "@prisma/client";
import { Hero } from "../../components/sections/Hero";
import { MachineSections } from "../../components/sections/MachineSections";
import { StatsBar } from "../../components/sections/StatsBar";
import { Fleet } from "../../components/sections/Fleet";
import { ForPartners } from "../../components/sections/ForPartners";
import { ForCustomers } from "../../components/sections/ForCustomers";
import { FAQ } from "../../components/sections/FAQ";
import { WhatsAppOrder } from "../../components/sections/WhatsAppOrder";
import { CTAStrip } from "../../components/sections/CTAStrip";
import {
  getSiteConfig,
  getSiteConfigMap,
  getSiteSection,
} from "../../lib/content";
import { SITE_URL } from "../../lib/env";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Heavy Equipment Rental, Telangana",
  description:
    "Book JCBs, Cranes, Excavators, Dozers and more across Telangana. One platform for contractors and fleet owners.",
  keywords: [
    "equipment rental telangana",
    "JCB on rent hyderabad",
    "crane rental",
    "excavator hire telangana",
  ],
  openGraph: {
    title: "Crux Group — Heavy Equipment Rental, Telangana",
    description:
      "Book JCBs, Cranes, Excavators, Dozers and more across Telangana.",
    url: SITE_URL,
    siteName: "Crux Group",
    type: "website",
  },
};

export default async function HomePage(): Promise<React.ReactElement> {
  const [
    heroCfg,
    statsSection,
    fleetSection,
    partnersSection,
    customersSection,
    faqSection,
    ctaSection,
    phone,
    extraCfg,
  ] = await Promise.all([
    getSiteConfigMap([
      "heroTagline_en",
      "heroTagline_te",
      "heroSubtitle_en",
      "heroSubtitle_te",
      "partnerHook_en",
      "partnerHook_te",
      "partnerSub_en",
      "partnerSub_te",
      "fleetHeading_en",
      "fleetHeading_te",
      "fleetSub_en",
      "fleetSub_te",
      "customersHeading_en",
      "customersHeading_te",
      "customersSub_en",
      "customersSub_te",
      "faqHeading_en",
      "faqHeading_te",
      "ctaSecondaryLabel_en",
      "ctaSecondaryLabel_te",
    ]),
    getSiteSection("stats"),
    getSiteSection("fleet"),
    getSiteSection("partners"),
    getSiteSection("customers"),
    getSiteSection("faq"),
    getSiteSection("cta"),
    getSiteConfig("phone"),
    getSiteSection("hero"),
  ]);

  const heroBlock = extraCfg?.blocks.find((b: SiteBlock) => b.type === "HERO");

  const statsBlocks = statsSection?.blocks.filter((b: SiteBlock) => b.type === "STAT") ?? [];
  const fleetBlocks =
    fleetSection?.blocks.filter((b: SiteBlock) => b.type === "EQUIPMENT_CARD") ?? [];
  const partnerBlocks =
    partnersSection?.blocks.filter((b: SiteBlock) => b.type === "FEATURE_CARD") ?? [];
  const customerBlocks =
    customersSection?.blocks.filter((b: SiteBlock) => b.type === "FEATURE_CARD") ?? [];
  const faqBlocks =
    faqSection?.blocks.filter((b: SiteBlock) => b.type === "FAQ_ITEM") ?? [];
  const ctaBlock = ctaSection?.blocks.find((b: SiteBlock) => b.type === "CTA_STRIP");

  return (
    <>
      <Hero
        eyebrow={{
          en: heroBlock?.heading_en ?? "",
          te: heroBlock?.heading_te,
        }}
        tagline={{
          en: heroCfg["heroTagline_en"] ?? "",
          te: heroCfg["heroTagline_te"],
        }}
        subtitle={{
          en: heroCfg["heroSubtitle_en"] ?? "",
          te: heroCfg["heroSubtitle_te"],
        }}
      />
      <MachineSections />
      <StatsBar blocks={statsBlocks} />
      <Fleet
        heading={{
          en: heroCfg["fleetHeading_en"] ?? "",
          te: heroCfg["fleetHeading_te"],
        }}
        sub={{
          en: heroCfg["fleetSub_en"] ?? "",
          te: heroCfg["fleetSub_te"],
        }}
        blocks={fleetBlocks}
      />
      <ForPartners
        hook={{
          en: heroCfg["partnerHook_en"] ?? "",
          te: heroCfg["partnerHook_te"],
        }}
        sub={{
          en: heroCfg["partnerSub_en"] ?? "",
          te: heroCfg["partnerSub_te"],
        }}
        blocks={partnerBlocks}
      />
      <ForCustomers
        heading={{
          en: heroCfg["customersHeading_en"] ?? "",
          te: heroCfg["customersHeading_te"],
        }}
        sub={{
          en: heroCfg["customersSub_en"] ?? "",
          te: heroCfg["customersSub_te"],
        }}
        blocks={customerBlocks}
        phone={phone}
      />
      <WhatsAppOrder
        heading={{
          en: "Book Your JCB Through WhatsApp — Click or Scan",
          te: "WhatsApp ద్వారా మీ JCB బుక్ చేయండి — క్లిక్ చేయండి లేదా స్కాన్ చేయండి",
        }}
        sub={{
          en: "Skip the app — send us a message on WhatsApp and book your equipment in minutes.",
          te: "యాప్ అవసరం లేదు — WhatsApp లో మాకు మెసేజ్ పంపండి, నిమిషాల్లో మీ పరికరాన్ని బుక్ చేయండి.",
        }}
      />
      <FAQ
        heading={{
          en: heroCfg["faqHeading_en"] ?? "",
          te: heroCfg["faqHeading_te"],
        }}
        blocks={faqBlocks}
      />
      {ctaBlock ? (
        <CTAStrip
          block={ctaBlock}
          secondaryLabel={{
            en: heroCfg["ctaSecondaryLabel_en"] ?? "Become a Partner",
            te: heroCfg["ctaSecondaryLabel_te"],
          }}
        />
      ) : null}
    </>
  );
}

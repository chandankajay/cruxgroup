import type { Metadata } from "next";
import { InternalRoadFormationContent } from "../../../../components/articles/internal-road-formation-content";
import { SEO_LOCALES } from "../../../../lib/seo/constants";
import {
  buildTechnicalGuideMetadata,
  TechnicalGuideArticleShell,
} from "../../../../lib/seo/technical-guide-page";
import { parseLocale } from "../../../../lib/locale";

export const revalidate = 86400;

const SLUG = "internal-road-formation-layout-ventures";

export function generateStaticParams(): { locale: string }[] {
  return SEO_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  return buildTechnicalGuideMetadata(SLUG, parseLocale(raw));
}

export default async function InternalRoadFormationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  return (
    <TechnicalGuideArticleShell slug={SLUG} locale={locale}>
      <InternalRoadFormationContent locale={locale} />
    </TechnicalGuideArticleShell>
  );
}

import type { Metadata } from "next";
import { SiteLevellingCutFillContent } from "../../../../components/articles/site-levelling-cut-fill-content";
import { SEO_LOCALES } from "../../../../lib/seo/constants";
import {
  buildTechnicalGuideMetadata,
  TechnicalGuideArticleShell,
} from "../../../../lib/seo/technical-guide-page";
import { parseLocale } from "../../../../lib/locale";

export const revalidate = 86400;

const SLUG = "site-levelling-cut-fill-reference";

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

export default async function SiteLevellingCutFillPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  return (
    <TechnicalGuideArticleShell slug={SLUG} locale={locale}>
      <SiteLevellingCutFillContent locale={locale} />
    </TechnicalGuideArticleShell>
  );
}

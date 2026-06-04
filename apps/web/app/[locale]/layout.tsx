import type { Metadata } from "next";
import { Footer } from "../../components/layout/Footer";
import { Navbar } from "../../components/layout/Navbar";
import { ScrollProgress } from "../../components/ui/ScrollProgress";
import { LanguageProvider } from "../../components/ui/LanguageProvider";
import { getSiteConfigMap } from "../../lib/content";
import { parseLocale } from "../../lib/locale";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
  openGraph: {
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    siteName: "Crux Agri & Rural Services",
    type: "website",
  },
};

export function generateStaticParams(): { locale: string }[] {
  return [{ locale: "en" }, { locale: "te" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>): Promise<React.ReactElement> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);

  const footerData = await getSiteConfigMap([
    "footerTagline_en",
    "footerTagline_te",
    "phone",
    "email",
    "address",
    "instagram",
    "youtube",
  ]);

  return (
    <LanguageProvider initialLocale={locale}>
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-dark pt-16">
        <ScrollProgress />
        <Navbar locale={locale} />
        <main className="min-w-0 flex-1 overflow-x-clip">{children}</main>
        <Footer locale={locale} data={footerData} />
      </div>
    </LanguageProvider>
  );
}

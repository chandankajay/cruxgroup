import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { DictionaryProvider } from "@repo/ui/dictionary-provider";
import { ThemeProvider } from "../components/theme-provider";
import { getAdminLabels } from "./lib/get-labels";
import { AdminShell } from "./components/admin-shell";
import { AuthProvider } from "./providers/auth-provider";
import { auth } from "../lib/auth";
import { prisma } from "@repo/db";

const geist = Geist({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crux Group Admin",
  description: "Internal management dashboard for Crux Group",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [labels, session] = await Promise.all([
    getAdminLabels(),
    auth(),
  ]);

  const role = (session?.user as { role?: string } | undefined)?.role ?? "ADMIN";
  const userId = session?.user?.id;

  const partnerOnboarding =
    !session || role !== "PARTNER" || !userId
      ? { hasPartner: true, hasAcceptedTerms: true }
      : await prisma.partner.findUnique({
          where: { userId },
          select: { id: true, termsAcceptedAt: true },
        }).then((p) => ({
          hasPartner: !!p,
          hasAcceptedTerms: !!p?.termsAcceptedAt,
        }));

  const { hasPartner, hasAcceptedTerms } = partnerOnboarding;
  const onboardingComplete = hasPartner && hasAcceptedTerms;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={geist.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <DictionaryProvider labels={labels}>
            <AuthProvider>
              <AdminShell
              isAuthenticated={!!session}
              userName={session?.user?.name ?? null}
              userEmail={session?.user?.email ?? null}
              userImage={session?.user?.image ?? null}
              role={role}
              onboardingComplete={onboardingComplete}
            >
              {children}
            </AdminShell>
            </AuthProvider>
            <Toaster richColors position="top-right" />
          </DictionaryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

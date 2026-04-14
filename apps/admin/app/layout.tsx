import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { DictionaryProvider } from "@repo/ui/dictionary-provider";
import { getAdminLabels } from "./lib/get-labels";
import { AdminShell } from "./components/admin-shell";
import { auth } from "../lib/auth";

const geist = Geist({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crux Group Admin",
  description: "Internal management dashboard for Crux Group",
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

  return (
    <html lang="en">
      <body className={geist.className}>
        <DictionaryProvider labels={labels}>
          <AdminShell
            isAuthenticated={!!session}
            userName={session?.user?.name ?? null}
            userEmail={session?.user?.email ?? null}
            userImage={session?.user?.image ?? null}
          >
            {children}
          </AdminShell>
        </DictionaryProvider>
      </body>
    </html>
  );
}

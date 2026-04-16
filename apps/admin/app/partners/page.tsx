import { fetchPartners } from "./actions";
import { PartnersPageContent } from "./features/partners-page-content";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await fetchPartners();
  return <PartnersPageContent partners={partners} />;
}

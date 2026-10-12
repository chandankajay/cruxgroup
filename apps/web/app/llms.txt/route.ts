import { PHONE } from "../../lib/env";
import { LOCATIONS, getLocationsByTier } from "../../lib/seo/data/locations";

function formatLocationList(tier: Parameters<typeof getLocationsByTier>[0]): string {
  return getLocationsByTier(tier)
    .map((l) => l.displayName)
    .join(", ");
}

const CONTENT = `# Crux Agri & Rural Services

Heavy equipment rental platform in Telangana, India.
Website: https://www.cruxgroup.in
Bookings app: https://bookings.cruxgroup.in
Partner OS: https://admin.cruxgroup.in

## Summary

Crux Group operates heavy equipment rental across ${LOCATIONS.length} locations in Telangana. Services include JCB backhoe, excavator, crane, post hole digger (auger / hole digger), tractor, tipper, and borewell drilling via partner network. WhatsApp booking, verified operators, GST invoices.

## Service Locations (${LOCATIONS.length} total)

### Hyderabad Prime
${formatLocationList("hyderabad-prime")}

### ORR Corridor
${formatLocationList("orr-corridor")}

### District Towns
${formatLocationList("district-hq")}

## What We Do — Layman Terms

- Hole digging / hole digger hire
- Earthing rod pits / earthing pit digging / grounding pits
- Foundation holes / column footing holes / building foundation drilling
- Precast wall holes / compound wall pole holes / boundary wall drilling
- Site excavation / earth excavation / basement excavation / JCB excavation
- Rock breaking / stone breaking / boulder breaking / JCB rock breaker
- Borewell drilling / water bore holes (via verified partner network)

## Equipment

- Tractor mounted post hole digger (auger): hole digging, earthing pits, foundation holes
- JCB backhoe loader: excavation, earthmoving, stone breaking, site levelling
- Tractor crane: material lifting, small construction sites
- Tractor dozer blade: site levelling, debris clearing
- Borewell rig (partner network): residential and farm borewells across Telangana

## Equipment Landing Pages

- JCB: https://www.cruxgroup.in/en/equipment/jcb
- Post Hole Digger / Auger: https://www.cruxgroup.in/en/equipment/posthole
- Crane: https://www.cruxgroup.in/en/equipment/crane
- Borewell (partner network): https://www.cruxgroup.in/en/equipment/borewell

## Site Services Landing Pages

- Compound Fence Services: https://www.cruxgroup.in/en/services/compound-fence
- Ground Levelling: https://www.cruxgroup.in/en/services/ground-levelling
- Debris Clearing: https://www.cruxgroup.in/en/services/debris-clearing
- Silent Rock Breaking: https://www.cruxgroup.in/en/services/silent-rock-breaking
- All services hub: https://www.cruxgroup.in/en/services

## Guides & Articles

https://www.cruxgroup.in/en/articles

## Who We Serve

- Real estate developers and layout promoters
- Infrastructure and road contractors
- Telecom and solar EPC contractors
- Power utilities (TSECL, DISCOMS)
- Farmers and rural landowners

## Booking

WhatsApp: ${PHONE || "https://wa.aisensy.com/aabg08"} | Website: cruxgroup.in | GST invoices provided

## Pricing

Hourly and daily rates. Operator included. Transport charges may apply for remote sites.
`;

export function GET() {
  return new Response(CONTENT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

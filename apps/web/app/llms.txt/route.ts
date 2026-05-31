const CONTENT = `# Crux Agri & Rural Services

Heavy equipment rental platform in Telangana, India.
Website: https://www.cruxgroup.in
Bookings: https://bookings.cruxgroup.in

## What We Do
We rent heavy equipment with trained operators across all districts of Telangana.

## Equipment Available
- JCB Backhoe Loader — excavation, foundation digging, trenching
- Excavator — large earthmoving, mining, demolition
- Crane — 16 to 100 ton, steel erection, warehouse builds
- Post Hole Digger — farm fencing, solar poles, foundation pits
- Dozer — land clearing, road grading
- Road Roller / Compactor — road works, rural infrastructure

## Who We Serve
- Real estate developers and layout promoters
- Infrastructure and road contractors
- Telecom and solar EPC contractors
- Power utilities (TSECL, DISCOMS)
- Farmers and rural landowners

## Coverage
All districts of Telangana. Based in Kothur, near Hyderabad.

## Contact
Phone: +91 82054293
Email: connect@cruxgroup.in
WhatsApp: +91 82054293

## Pricing
Hourly and daily rates. Operator included. Transport charges applicable.
`;

export function GET() {
  return new Response(CONTENT, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

import { EquipmentCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedEntry {
  key: string;
  value: string;
  language: string;
  app: "BOOKING" | "ADMIN";
}

const bookingLabels: SeedEntry[] = [
  { key: "HOME_WELCOME", value: "Welcome to Crux Group", language: "en", app: "BOOKING" },
  { key: "HOME_SUBTITLE", value: "Book construction equipment in minutes", language: "en", app: "BOOKING" },
  { key: "BOOKING_TITLE", value: "Book Equipment", language: "en", app: "BOOKING" },
  { key: "LOGIN_BUTTON_TEXT", value: "Login", language: "en", app: "BOOKING" },
  { key: "LOGIN_TITLE", value: "Sign in to Crux Group", language: "en", app: "BOOKING" },
  { key: "LOGIN_PHONE_LABEL", value: "Phone Number", language: "en", app: "BOOKING" },
  { key: "LOGIN_PHONE_PLACEHOLDER", value: "Enter your phone number", language: "en", app: "BOOKING" },
  { key: "LOGIN_SEND_OTP", value: "Send OTP", language: "en", app: "BOOKING" },
  { key: "LOGIN_OTP_LABEL", value: "Verification Code", language: "en", app: "BOOKING" },
  { key: "LOGIN_OTP_SENT_TO", value: "OTP sent to", language: "en", app: "BOOKING" },
  { key: "LOGIN_VERIFY_OTP", value: "Verify & Sign In", language: "en", app: "BOOKING" },
  { key: "LOGIN_CHANGE_PHONE", value: "Change phone number", language: "en", app: "BOOKING" },
  { key: "LOGIN_ERROR_SEND", value: "Failed to send OTP. Please try again.", language: "en", app: "BOOKING" },
  { key: "LOGIN_ERROR_VERIFY", value: "Invalid or expired OTP. Please try again.", language: "en", app: "BOOKING" },
  { key: "SEARCH_PLACEHOLDER", value: "Search equipment...", language: "en", app: "BOOKING" },
  { key: "SERVICE_NOT_AVAILABLE", value: "Service is not available in your area yet.", language: "en", app: "BOOKING" },
  { key: "BOOKING_CONFIRM", value: "Confirm Booking", language: "en", app: "BOOKING" },
  { key: "BOOKING_CANCEL", value: "Cancel Booking", language: "en", app: "BOOKING" },
  { key: "NAV_HOME", value: "Home", language: "en", app: "BOOKING" },
  { key: "NAV_BOOKINGS", value: "My Bookings", language: "en", app: "BOOKING" },
  { key: "EQUIPMENT_GRID_TITLE", value: "Available Equipment", language: "en", app: "BOOKING" },
  { key: "EQUIPMENT_PER_DAY", value: "/day", language: "en", app: "BOOKING" },
  { key: "EQUIPMENT_BOOK_NOW", value: "Book Now", language: "en", app: "BOOKING" },
  { key: "DRAWER_TITLE", value: "Book Equipment", language: "en", app: "BOOKING" },
  { key: "DRAWER_SELECT_DATES", value: "Select Dates", language: "en", app: "BOOKING" },
  { key: "DRAWER_ADDRESS", value: "Site Address", language: "en", app: "BOOKING" },
  { key: "DRAWER_PINCODE", value: "Pincode", language: "en", app: "BOOKING" },
  { key: "DRAWER_DAILY_RATE", value: "Daily Rate", language: "en", app: "BOOKING" },
  { key: "DRAWER_DAYS", value: "Days", language: "en", app: "BOOKING" },
  { key: "DRAWER_TRANSPORT", value: "Transport Fee", language: "en", app: "BOOKING" },
  { key: "DRAWER_TOTAL", value: "Total", language: "en", app: "BOOKING" },
  { key: "DRAWER_SUBMIT", value: "Confirm Booking", language: "en", app: "BOOKING" },
  { key: "BOOKING_SUCCESS_TITLE", value: "Booking Requested!", language: "en", app: "BOOKING" },
  { key: "BOOKING_SUCCESS_MESSAGE", value: "We'll confirm your booking shortly.", language: "en", app: "BOOKING" },
  { key: "BOOKING_SUCCESS_BACK", value: "Back to Home", language: "en", app: "BOOKING" },
  { key: "NO_EQUIPMENT", value: "No equipment available at the moment.", language: "en", app: "BOOKING" },
];

const adminLabels: SeedEntry[] = [
  { key: "HOME_WELCOME", value: "Crux Group Admin Dashboard", language: "en", app: "ADMIN" },
  { key: "HOME_SUBTITLE", value: "Manage bookings, equipment, and partners", language: "en", app: "ADMIN" },
  { key: "LOGIN_BUTTON_TEXT", value: "Sign in with Google", language: "en", app: "ADMIN" },
  { key: "LOGIN_RESTRICTED", value: "Access restricted to @cruxgroup.in accounts", language: "en", app: "ADMIN" },
  { key: "NAV_DASHBOARD", value: "Dashboard", language: "en", app: "ADMIN" },
  { key: "NAV_BOOKINGS", value: "Bookings", language: "en", app: "ADMIN" },
  { key: "NAV_EQUIPMENT", value: "Equipment", language: "en", app: "ADMIN" },
  { key: "NAV_PARTNERS", value: "Partners", language: "en", app: "ADMIN" },
  { key: "NAV_AREAS", value: "Serviceable Areas", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_PAGE_TITLE", value: "Equipment", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_PAGE_DESC", value: "Manage your fleet of machines", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_ADD", value: "Add Equipment", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_EDIT", value: "Edit Equipment", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_DELETE", value: "Delete Equipment", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_DELETE_CONFIRM", value: "Are you sure you want to delete this equipment?", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_COL_NAME", value: "Name", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_COL_CATEGORY", value: "Category", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_COL_DAILY_RATE", value: "Daily Rate", language: "en", app: "ADMIN" },
  { key: "EQUIPMENT_COL_ACTIONS", value: "Actions", language: "en", app: "ADMIN" },
];

const sampleEquipment = [
  {
    name: "Mahindra Tractor with Auger",
    category: "JCB" as const,
    pricing: { hourly: 450, daily: 2500 },
    images: [
      "https://images.unsplash.com/photo-1592982537447-6f2a6a0dbe73?auto=format&fit=crop&w=1200&q=80",
    ],
    specifications: {
      description:
        "Farm-grade tractor with hydraulic auger attachment for fast borewell digging and foundation post work.",
      imageUrl:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0dbe73?auto=format&fit=crop&w=1200&q=80",
      power: "50 HP",
      augerDepth: "Up to 12 ft",
    },
  },
  {
    name: "JCB Backhoe Loader",
    category: "JCB" as const,
    pricing: { hourly: 800, daily: 4500 },
    images: [
      "https://images.unsplash.com/photo-1581093588401-16ecf2dca803?auto=format&fit=crop&w=1200&q=80",
    ],
    specifications: {
      description:
        "Versatile loader for trenching, earthmoving, and on-site material handling across small to mid-size projects.",
      imageUrl:
        "https://images.unsplash.com/photo-1581093588401-16ecf2dca803?auto=format&fit=crop&w=1200&q=80",
      weight: "8.5 tonnes",
      diggingDepth: "5.5 m",
    },
  },
  {
    name: "20-ton Crane",
    category: "Crane" as const,
    pricing: { hourly: 1400, daily: 8000 },
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    ],
    specifications: {
      description:
        "Hydraulic mobile crane suitable for steel lifting, machinery placement, and heavy material shifts on construction sites.",
      imageUrl:
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
      liftingCapacity: "20 tonnes",
      boomLength: "32 m",
    },
  },
];

interface ExternalEquipmentSeed {
  name: string;
  category: string;
  imageUrl: string;
  pricing: {
    daily: number;
  };
  specs: Record<string, string>;
}

const externalEquipmentSeed: ExternalEquipmentSeed[] = [
  {
    name: "Mini Excavator (3-Ton)",
    category: "Earthmoving",
    imageUrl:
      "https://images.unsplash.com/photo-1580982319985-0205845ce9b6?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 4500 },
    specs: { weight: "3 tonnes", diggingDepth: "2.5 m", bucketCapacity: "0.1 m3" },
  },
  {
    name: "Heavy Crawler Excavator (20-Ton)",
    category: "Earthmoving",
    imageUrl:
      "https://images.unsplash.com/photo-1621689698716-43b95a5fbc40?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 8500 },
    specs: { weight: "21 tonnes", diggingDepth: "6.7 m", power: "140 HP" },
  },
  {
    name: "Vibratory Soil Compactor (Road Roller)",
    category: "Compaction",
    imageUrl:
      "https://images.unsplash.com/photo-1585827552631-f1f4560ea517?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 5500 },
    specs: { weight: "11 tonnes", drumWidth: "2.1 m", type: "Single Drum" },
  },
  {
    name: "Bulldozer (D6 Equivalent)",
    category: "Earthmoving",
    imageUrl:
      "https://images.unsplash.com/photo-1584988782928-1b2067ed3a10?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 12000 },
    specs: { power: "200 HP", bladeCapacity: "4.2 m3", trackType: "Standard" },
  },
  {
    name: "Water Tanker (5000 Liters)",
    category: "Support",
    imageUrl:
      "https://images.unsplash.com/photo-1616432130768-450f681ab3dc?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 2500 },
    specs: { capacity: "5000 L", pumpType: "PTO Driven", application: "Dust Control/Curing" },
  },
  {
    name: "Combine Harvester (Paddy/Wheat)",
    category: "Agriculture",
    imageUrl:
      "https://images.unsplash.com/photo-1601662998634-8b64e03f0b2f?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 14000 },
    specs: { power: "100 HP", cutterBarWidth: "14 ft", grainTank: "2.5 m3" },
  },
  {
    name: "Tractor with Rotavator",
    category: "Agriculture",
    imageUrl:
      "https://images.unsplash.com/photo-1592982537443-d1e462ad5221?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 3500 },
    specs: { power: "55 HP", implement: "7 ft Rotary Tiller", blades: "42" },
  },
  {
    name: "Heavy Duty Cultivator (9-Tine)",
    category: "Agriculture",
    imageUrl:
      "https://images.unsplash.com/photo-1530558661601-52319aeb3e45?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 2800 },
    specs: { linkage: "3-Point", workingDepth: "9 inches", suitableFor: "Hard Soil" },
  },
  {
    name: "Tractor-Mounted Sprayer",
    category: "Agriculture",
    imageUrl:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
    pricing: { daily: 2000 },
    specs: { tankCapacity: "500 L", boomWidth: "12 m", pump: "Diaphragm" },
  },
];

function mapToEquipmentCategory(name: string, category: string): EquipmentCategory {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes("crane")) {
    return EquipmentCategory.Crane;
  }
  if (text.includes("excavator")) {
    return EquipmentCategory.Excavator;
  }
  return EquipmentCategory.JCB;
}

const normalizedExternalEquipment = externalEquipmentSeed.map((item) => ({
  name: item.name,
  category: mapToEquipmentCategory(item.name, item.category),
  subType: item.category,
  pricing: {
    daily: item.pricing.daily,
    hourly: Number((item.pricing.daily / 8).toFixed(2)),
  },
  images: [item.imageUrl],
  specifications: {
    description: `${item.name} from ${item.category} category.`,
    imageUrl: item.imageUrl,
    ...item.specs,
  },
}));

async function seed(): Promise<void> {
  const allLabels = [...bookingLabels, ...adminLabels];

  for (const label of allLabels) {
    await prisma.dictionary.upsert({
      where: {
        key_app_language: {
          key: label.key,
          app: label.app,
          language: label.language,
        },
      },
      update: { value: label.value },
      create: label,
    });
  }

  const allEquipment = [...sampleEquipment, ...normalizedExternalEquipment];

  for (const eq of allEquipment) {
    const exists = await prisma.equipment.findFirst({
      where: { name: eq.name },
    });
    if (!exists) {
      await prisma.equipment.create({ data: eq });
    }
  }
}

seed()
  .then(() => prisma.$disconnect())
  .catch(async (e: unknown) => {
    await prisma.$disconnect();
    throw e;
  });

export type UserRole = "USER" | "ADMIN" | "PARTNER";

export interface User {
  id: string;
  phoneNumber?: string;
  name: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
  role: UserRole;
  location?: GeoPoint;
  maxServiceRadius?: number;
  baseAddress?: string;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface Otp {
  id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export type EquipmentCategory = "JCB" | "Crane" | "Excavator";

/** Stored on `Equipment` JSON — amounts in paise (1 INR = 100 paise). */
export interface EquipmentPricing {
  hourly: number;
  daily: number;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  subType?: string;
  partnerId?: string;
  /** Paise per hour (mirrors `pricing.hourly`). */
  hourlyRate: number;
  minDaysForExtendedRadius: number;
  pricing: EquipmentPricing;
  images: string[];
  specifications: Record<string, unknown>;
}

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

export interface BookingLocation {
  address: string;
  coordinates: { lat: number; lng: number };
  pincode: string;
}

export interface BookingPricing {
  /** Quoted job total in paise */
  total: number;
  duration: number;
  unit: "hourly" | "daily";
}

export interface Booking {
  id: string;
  userId: string;
  equipmentId: string;
  partnerId?: string;
  status: BookingStatus;
  location: BookingLocation;
  pricing: BookingPricing;
}

export interface ServiceableArea {
  pincode: string;
  isActive: boolean;
  name: string;
}

export type DictionaryApp = "BOOKING" | "ADMIN";

export interface DictionaryEntry {
  key: string;
  value: string;
  language: string;
  app: DictionaryApp;
}

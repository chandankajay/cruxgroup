import { z } from "zod";

export type CatalogGuardRow = {
  readonly minHourlyRate: number;
  readonly maxHourlyRate: number;
  readonly minDailyRate: number;
  readonly maxDailyRate: number;
};

const currentYear = new Date().getFullYear();

export const editFleetEquipmentBaseSchema = z.object({
  hp: z.coerce.number().int().min(0),
  hourlyRate: z.coerce.number(),
  dailyRate: z.coerce.number(),
  freeRadiusKm: z.coerce.number().int().min(0),
  transportRatePerKm: z.coerce.number().min(0),
  maxRadiusKm: z.coerce
    .number()
    .int()
    .min(1, "Max service radius (km) must be at least 1"),
  minBookingHours: z.coerce.number().int().min(1).max(168),
  registrationNumber: z
    .string()
    .trim()
    .min(1, "Registration number is required")
    .max(32),
  operatorName: z.string().trim().min(1, "Operator name is required").max(120),
  operatorPhone: z.string().trim().min(10, "Enter operator phone").max(20),
  manufacturingYear: z.coerce
    .number()
    .int()
    .min(1980)
    .max(currentYear + 1),
  isActive: z.enum(["true", "false"]),
});

export type EditFleetEquipmentValues = z.infer<typeof editFleetEquipmentBaseSchema>;

export function buildEditFleetEquipmentSchema(catalog: CatalogGuardRow | null) {
  return editFleetEquipmentBaseSchema.superRefine((data, ctx) => {
    if (!catalog) return;
    const hourlyPaise = Math.round(data.hourlyRate * 100);
    const dailyPaise = Math.round(data.dailyRate * 100);
    if (hourlyPaise < catalog.minHourlyRate || hourlyPaise > catalog.maxHourlyRate) {
      ctx.addIssue({
        code: "custom",
        path: ["hourlyRate"],
        message: `Hourly rate must be between ₹${(catalog.minHourlyRate / 100).toLocaleString("en-IN")} and ₹${(catalog.maxHourlyRate / 100).toLocaleString("en-IN")}/hr`,
      });
    }
    if (dailyPaise < catalog.minDailyRate || dailyPaise > catalog.maxDailyRate) {
      ctx.addIssue({
        code: "custom",
        path: ["dailyRate"],
        message: `Daily rate must be between ₹${(catalog.minDailyRate / 100).toLocaleString("en-IN")} and ₹${(catalog.maxDailyRate / 100).toLocaleString("en-IN")}/day`,
      });
    }
    if (data.freeRadiusKm > data.maxRadiusKm) {
      ctx.addIssue({
        code: "custom",
        path: ["freeRadiusKm"],
        message: "Free delivery radius cannot exceed max service radius",
      });
    }
  });
}

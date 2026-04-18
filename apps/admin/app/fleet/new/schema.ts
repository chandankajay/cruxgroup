import { z } from "zod";

export type CatalogGuardRow = {
  readonly id: string;
  readonly minHourlyRate: number;
  readonly maxHourlyRate: number;
  readonly minDailyRate: number;
  readonly maxDailyRate: number;
};

const currentYear = new Date().getFullYear();

const addFleetEquipmentBaseSchema = z.object({
  catalogId: z.string().min(1, "Select an equipment type"),
  hp: z.coerce.number().int().min(0),
  hourlyRate: z.coerce.number(),
  dailyRate: z.coerce.number(),
  freeRadiusKm: z.coerce.number().int().min(0),
  transportRatePerKm: z.coerce.number().min(0),
  maxRadiusKm: z.coerce.number().int().min(1, "Max travel radius (km) is required"),
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

export type AddFleetEquipmentValues = z.infer<typeof addFleetEquipmentBaseSchema>;

export function buildAddFleetEquipmentSchema(catalog: readonly CatalogGuardRow[]) {
  const byId = new Map(catalog.map((c) => [c.id, c]));

  return addFleetEquipmentBaseSchema.superRefine((data, ctx) => {
    const row = byId.get(data.catalogId);
    if (!row) {
      ctx.addIssue({
        code: "custom",
        path: ["catalogId"],
        message: "Invalid equipment type",
      });
      return;
    }
    if (
      data.hourlyRate < row.minHourlyRate ||
      data.hourlyRate > row.maxHourlyRate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["hourlyRate"],
        message: `Hourly rate must be between ₹${row.minHourlyRate.toLocaleString("en-IN")} and ₹${row.maxHourlyRate.toLocaleString("en-IN")}`,
      });
    }
    if (
      data.dailyRate < row.minDailyRate ||
      data.dailyRate > row.maxDailyRate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dailyRate"],
        message: `Daily rate must be between ₹${row.minDailyRate.toLocaleString("en-IN")} and ₹${row.maxDailyRate.toLocaleString("en-IN")}`,
      });
    }
    if (data.freeRadiusKm > data.maxRadiusKm) {
      ctx.addIssue({
        code: "custom",
        path: ["freeRadiusKm"],
        message: "Free delivery radius cannot exceed max travel radius",
      });
    }
  });
}

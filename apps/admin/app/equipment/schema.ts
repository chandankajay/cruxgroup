import { z } from "zod";

export const equipmentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["JCB", "Crane", "Excavator"]),
  subType: z.string().optional(),
  dailyRate: z.coerce.number().positive("Must be greater than 0"),
  hourlyRate: z.coerce.number().positive("Must be greater than 0"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  specifications: z.string().refine(
    (val) => {
      if (!val.trim()) return true;
      try {
        JSON.parse(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be valid JSON" }
  ),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

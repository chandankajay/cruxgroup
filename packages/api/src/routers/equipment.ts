import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import {
  listEquipment,
  listEquipmentByPartner,
  getEquipmentById,
  searchEquipment,
  createEquipment,
  createPartnerFleetEquipment,
  updatePartnerFleetEquipment,
  updateEquipment,
} from "../services/equipment-service";

const categoryEnum = z.enum(["JCB", "Crane", "Excavator"]);

export const equipmentRouter = createRouter({
  list: publicProcedure.query(() => listEquipment()),

  listByPartner: publicProcedure
    .input(z.object({ partnerId: z.string().min(1) }))
    .query(({ input }) => listEquipmentByPartner(input.partnerId)),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => getEquipmentById(input.id)),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(({ input }) => searchEquipment(input.query)),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        category: categoryEnum,
        subType: z.string().optional(),
        hourlyRate: z.number().nonnegative(),
        dailyRate: z.number().nonnegative(),
        images: z.array(z.string().url()).default([]),
        specifications: z.record(z.unknown()).default({}),
        partnerId: z.string().nullable().optional(),
        catalogId: z.string().nullable().optional(),
        hp: z.number().int().nonnegative().optional(),
        freeRadiusKm: z.number().int().nonnegative().optional(),
        transportRatePerKm: z.number().nonnegative().optional(),
      })
    )
    .mutation(({ input }) => createEquipment(input)),

  createPartnerFleet: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        catalogId: z.string().min(1),
        hp: z.number().int().nonnegative(),
        hourlyRate: z.number().nonnegative(),
        dailyRate: z.number().nonnegative(),
        freeRadiusKm: z.number().int().nonnegative().default(5),
        transportRatePerKm: z.number().nonnegative(),
        maxRadiusKm: z.number().int().min(1),
        minBookingHours: z.number().int().min(1).max(168),
        registrationNumber: z.string().trim().min(1).max(32),
        operatorName: z.string().trim().min(1).max(120),
        operatorPhone: z.string().trim().min(10).max(20),
        manufacturingYear: z.number().int().min(1980).max(new Date().getFullYear() + 1),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await createPartnerFleetEquipment(input);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "PARTNER_NOT_FOUND") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Partner profile not found.",
          });
        }
        if (msg === "CATALOG_NOT_FOUND") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Equipment type not found.",
          });
        }
        if (msg === "RATES_OUT_OF_RANGE") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Rates are outside allowed platform limits for this equipment type.",
          });
        }
        if (msg === "RADIUS_INVALID") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Free delivery radius cannot exceed max travel radius.",
          });
        }
        if (msg === "REGISTRATION_DUPLICATE") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This registration number is already in your fleet.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create equipment.",
        });
      }
    }),

  updatePartnerFleet: publicProcedure
    .input(
      z.object({
        userId: z.string().min(1),
        equipmentId: z.string().min(1),
        hp: z.number().int().nonnegative(),
        hourlyRate: z.number().nonnegative(),
        dailyRate: z.number().nonnegative(),
        freeRadiusKm: z.number().int().nonnegative().default(5),
        transportRatePerKm: z.number().nonnegative(),
        maxRadiusKm: z.number().int().min(1),
        minBookingHours: z.number().int().min(1).max(168),
        registrationNumber: z.string().trim().min(1).max(32),
        operatorName: z.string().trim().min(1).max(120),
        operatorPhone: z.string().trim().min(10).max(20),
        manufacturingYear: z.number().int().min(1980).max(new Date().getFullYear() + 1),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updatePartnerFleetEquipment({
          userId: input.userId,
          equipmentId: input.equipmentId,
          hp: input.hp,
          hourlyRate: input.hourlyRate,
          dailyRate: input.dailyRate,
          freeRadiusKm: input.freeRadiusKm,
          transportRatePerKm: input.transportRatePerKm,
          maxRadiusKm: input.maxRadiusKm,
          minBookingHours: input.minBookingHours,
          registrationNumber: input.registrationNumber,
          operatorName: input.operatorName,
          operatorPhone: input.operatorPhone,
          manufacturingYear: input.manufacturingYear,
          isActive: input.isActive,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg === "PARTNER_NOT_FOUND") {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Partner profile not found.",
          });
        }
        if (msg === "EQUIPMENT_NOT_FOUND") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Equipment not found.",
          });
        }
        if (msg === "CATALOG_NOT_FOUND") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Equipment type not found.",
          });
        }
        if (msg === "RATES_OUT_OF_RANGE") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Rates are outside allowed platform limits for this equipment type.",
          });
        }
        if (msg === "RADIUS_INVALID") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Free delivery radius cannot exceed max travel radius.",
          });
        }
        if (msg === "REGISTRATION_DUPLICATE") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This registration number is already in your fleet.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update equipment.",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        category: categoryEnum.optional(),
        subType: z.string().nullable().optional(),
        hourlyRate: z.number().nonnegative().optional(),
        dailyRate: z.number().nonnegative().optional(),
        images: z.array(z.string().url()).optional(),
        specifications: z.record(z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateEquipment(input);
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipment not found",
        });
      }
    }),

  /**
   * @deprecated Unsafe with `publicProcedure` (no session). Use authenticated server actions
   * in `apps/admin` that delete with `getAuthorizedWhereClause`.
   */
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(() => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Equipment deletion must go through authenticated server actions.",
      });
    }),
});

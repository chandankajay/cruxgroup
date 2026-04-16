import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import {
  listEquipment,
  listEquipmentByPartner,
  getEquipmentById,
  searchEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
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
        hourlyRate: z.number().positive(),
        dailyRate: z.number().positive(),
        images: z.array(z.string().url()).default([]),
        specifications: z.record(z.unknown()).default({}),
      })
    )
    .mutation(({ input }) => createEquipment(input)),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        category: categoryEnum.optional(),
        subType: z.string().nullable().optional(),
        hourlyRate: z.number().positive().optional(),
        dailyRate: z.number().positive().optional(),
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

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await deleteEquipment(input.id);
        return { success: true };
      } catch {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Equipment not found",
        });
      }
    }),
});

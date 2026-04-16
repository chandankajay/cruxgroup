import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicProcedure } from "../trpc";
import {
  listPartners,
  getPartnerById,
  updatePartnerServiceArea,
} from "../services/partner-service";

export const partnerRouter = createRouter({
  list: publicProcedure.query(() => listPartners()),

  byId: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      const partner = await getPartnerById(input.id);
      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found" });
      }
      return partner;
    }),

  updateServiceArea: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        maxServiceRadius: z.number().int().min(1).max(500),
        baseAddress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const partner = await getPartnerById(input.id);
      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Partner not found" });
      }
      return updatePartnerServiceArea(input);
    }),
});

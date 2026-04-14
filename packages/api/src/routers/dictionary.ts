import { z } from "zod";
import { createRouter, publicProcedure } from "../trpc";
import { getLabelsForApp } from "../services/dictionary-service";

const dictionaryAppSchema = z.enum(["BOOKING", "ADMIN"]);

export const dictionaryRouter = createRouter({
  getLabels: publicProcedure
    .input(
      z.object({
        app: dictionaryAppSchema,
        language: z.string().default("en"),
      })
    )
    .query(async ({ input }) => {
      return getLabelsForApp(input.app, input.language);
    }),
});

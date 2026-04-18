import { createRouter, publicProcedure } from "../trpc";
import { listMasterCatalog } from "../services/master-catalog-service";

export const masterCatalogRouter = createRouter({
  list: publicProcedure.query(() => listMasterCatalog()),
});

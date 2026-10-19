import "server-only";

import { catalogueDocumentSource } from "./catalogue.data";
import { catalogueDocumentSchema, type CatalogueDocument } from "./catalogue.schema";

export const catalogueDocument: CatalogueDocument = catalogueDocumentSchema.parse(
  catalogueDocumentSource,
);

export type { CatalogueDocument };
export { catalogueDocumentSchema } from "./catalogue.schema";

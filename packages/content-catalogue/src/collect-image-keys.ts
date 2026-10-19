import type { CatalogueDocument, ImageRef } from "./catalogue.schema";

export function collectCatalogueImageKeys(doc: CatalogueDocument): ImageRef[] {
  const refs: ImageRef[] = [];

  const push = (ref: ImageRef): void => {
    refs.push(ref);
  };

  push(doc.booklet.coverImage);
  push(doc.booklet.about.image);
  push(doc.booklet.earthworks.image);
  push(doc.booklet.earthworks.imageSecondary);
  push(doc.booklet.precast.handmadeImage);
  push(doc.booklet.precast.machineImage);
  push(doc.booklet.fencing.ownImage);
  push(doc.booklet.building.image);

  for (const section of doc.sections) {
    for (const item of section.items) {
      push(item.image);
    }
  }
  for (const option of doc.booklet.wallDesigns.options) {
    push(option.image);
  }
  for (const option of doc.booklet.farmHouseDesigns.options) {
    push(option.image);
  }
  for (const option of doc.booklet.fencing.options) {
    push(option.image);
  }

  return refs;
}

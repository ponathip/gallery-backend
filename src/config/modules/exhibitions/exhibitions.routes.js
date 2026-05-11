import {
  listExhibitions,
  getExhibitionById,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  updateExhibitionPublish,
  reorderExhibition,
  listPublicExhibitions,
  getPublicExhibitionBySlug,
} from "./exhibitions.controller.js";

export default async function exhibitionRoutes(app) {
  app.get("/exhibitions", listExhibitions);
  app.get("/exhibitions/:id", getExhibitionById);
  app.post("/exhibitions", createExhibition);
  app.put("/exhibitions/:id", updateExhibition);
  app.delete("/exhibitions/:id", deleteExhibition);
  app.patch("/exhibitions/:id/publish", updateExhibitionPublish);
  app.put("/exhibitions/reorder",  reorderExhibition);

  app.get("/public/exhibitions", listPublicExhibitions);
  app.get("/public/exhibitions/:slug", getPublicExhibitionBySlug);
}
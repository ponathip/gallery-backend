import {
  createArtwork,
  listArtworks,
  getArtworkBySlug,
  getArtworkById,
  updateArtwork,
  addArtworkImages,
  deleteArtworkImage,
  deleteArtwork,
  sortArtworkImages,
  listPublicArtworks,
  getPublicArtworkBySlug,
  addArtworkView,
  addArtworkLike,
} from "./artworks.controller.js";

export default async function artworkRoutes(app) {
  app.get("/public/artworks", listPublicArtworks);
  app.get("/public/artworks/:slug", getPublicArtworkBySlug);
  app.post("/public/artworks/:slug/view", addArtworkView);
  app.post("/public/artworks/:slug/like", addArtworkLike);

  app.get("/artworks", listArtworks);
  app.get("/artworks/id/:id", getArtworkById);
  app.get("/artworks/:slug", getArtworkBySlug);
  app.post("/artworks", createArtwork);
  app.put("/artworks/:id", updateArtwork);
  app.post("/artworks/:id/images", addArtworkImages);
  app.delete("/artworks/:id/images/:imageId", deleteArtworkImage);
  app.delete("/artworks/:id", deleteArtwork);
  app.put("/artworks/:id/images/sort", sortArtworkImages);
}
import {
  listWallProjects,
  listPublicWallProjects,
  getPublicWallProjectBySlug,
  createWallProject,
  getWallProjectById,
  updateWallProject,
  deleteWallProject,
  sortWallProjectImages,
  updateWallProjectPublish,
  addWallProjectView,
  addWallProjectLike,
  reorderWallProject,
} from "./wall-projects.controller.js";

export default async function wallProjectRoutes(app) {
  // admin
  app.get("/wall-projects", listWallProjects);

  // public
  app.get("/public/wall-projects", listPublicWallProjects);
  app.get(
    "/public/wall-projects/:slug",
    getPublicWallProjectBySlug
  );
  app.post("/public/wall-projects/:slug/view", addWallProjectView);
  app.post("/public/wall-projects/:slug/like", addWallProjectLike);
  app.post("/wall-projects", createWallProject);
  app.get("/wall-projects/:id", getWallProjectById);
  app.put("/wall-projects/:id", updateWallProject);
  app.delete("/wall-projects/:id", deleteWallProject);
  app.put("/wall-projects/:id/images/sort", sortWallProjectImages);
  app.patch("/wall-projects/:id/publish", updateWallProjectPublish);
  app.put("/wall-projects/reorder",  reorderWallProject);
}
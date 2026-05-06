import {
  getSettings,
  updateSettings,
  getPublicSettings,
} from "./settings.controller.js";

export default async function settingsRoutes(app) {
  app.get("/settings", getSettings);
  app.put("/settings", updateSettings);

  app.get("/public/settings", getPublicSettings);
}
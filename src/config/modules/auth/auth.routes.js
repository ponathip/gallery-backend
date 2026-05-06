import { login, logout, me } from "./auth.controller.js";

export default async function authRoutes(app) {
  app.post("/auth/login", login);
  app.post("/auth/logout", logout);

  app.get(
    "/auth/me",
    {
      preHandler: [app.authenticateAdmin],
    },
    me
  );
}
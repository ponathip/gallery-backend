import Fastify from "fastify";
import cors from "@fastify/cors";
import pool from "./config/db.js";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import authRoutes from "./config/modules/auth/auth.routes.js";
import artworkRoutes from "./config/modules/artworks/artworks.routes.js";
import inquiryRoutes from "./config/modules/inquiries/inquiries.routes.js";
import wallProjectRoutes from "./config/modules/wall-projects/wall-projects.routes.js";
import exhibitionRoutes from "./config/modules/exhibitions/exhibitions.routes.js";
import settingsRoutes from "./config/modules/settings/settings.routes.js";
import dashboardRoutes from "./config/modules/dashboard/dashboard.routes.js";


const app = Fastify({ logger: true });
await app.register(cors, {
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.decorate("db", pool);
app.register(cookie);
app.register(cors, {
  origin: [
    process.env.FRONTEND_ORIGIN,
    process.env.ADMIN_ORIGIN,
  ],
  credentials: true,
});
app.register(jwt, {
  secret: process.env.JWT_SECRET,
});
app.decorate("authenticateAdmin", async function (req, reply) {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    const decoded = await req.server.jwt.verify(token);

    req.admin = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
});
app.register(authRoutes);
app.register(artworkRoutes);
app.register(inquiryRoutes);
app.register(wallProjectRoutes);
app.register(exhibitionRoutes);
app.register(settingsRoutes);
app.register(dashboardRoutes);

// test route
app.get("/", async () => {
  return { message: "API running 🚀" };
});

const start = async () => {
  try {
    await app.listen({ port: 3001 });
    console.log("Server running on http://localhost:3001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
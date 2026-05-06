import * as service from "./auth.service.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24,
};

export async function login(req, reply) {
  const { email, password } = req.body;

  if (!email || !password) {
    return reply.code(400).send({ message: "Email and password required" });
  }

  const user = await service.findAdminByEmail(req.server.db, email);

  if (!user || !user.isActive) {
    return reply.code(401).send({ message: "Invalid email or password" });
  }

  const valid = await service.verifyPassword(password, user.passwordHash);

  if (!valid) {
    return reply.code(401).send({ message: "Invalid email or password" });
  }

  const token = req.server.jwt.sign({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  reply.setCookie("adminToken", token, cookieOptions);

  return reply.send({
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function logout(req, reply) {
  reply.clearCookie("adminToken", {
    path: "/",
  });

  return reply.send({ message: "Logged out" });
}

export async function me(req, reply) {
  return reply.send({
    data: req.admin,
  });
}
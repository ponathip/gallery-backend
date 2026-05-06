import bcrypt from "bcryptjs";

export async function findAdminByEmail(db, email) {
  const [[user]] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash AS passwordHash,
      role,
      is_active AS isActive
    FROM admin_users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return user ?? null;
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
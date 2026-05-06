import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import "dotenv/config";

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const hash = await bcrypt.hash("123456", 10);

await db.query(
  `
  INSERT INTO admin_users (name, email, password_hash, role)
  VALUES (?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
  `,
  ["Admin", "admin@example.com", hash, "owner"]
);

await db.end();
console.log("Admin created");
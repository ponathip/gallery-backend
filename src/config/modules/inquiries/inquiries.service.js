import { sendMail } from "../../../services/mail.service.js";
import { inquiryReplyTemplate, newInquiryAdminTemplate } from "../../../services/mail.template.js";

export async function createInquiry(db, payload) {
  const {
    name,
    email,
    inquiryType = "artwork",
    artworkId = null,
    wallProjectId = null,
    exhibitionId = null,
    message,
  } = payload;

  const [result] = await db.query(
    `
    INSERT INTO inquiries (
      name,
      email,
      inquiry_type,
      artwork_id,
      wall_project_id,
      exhibition_id,
      message,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `,
    [
      name,
      email,
      inquiryType,
      artworkId,
      wallProjectId,
      exhibitionId,
      message,
    ]
  );

  const inquiry = {
    id: result.insertId,
    name,
    email,
    inquiryType,
    artworkId,
    wallProjectId,
    exhibitionId,
    message,
    status: "new",
  };

  if (process.env.ADMIN_EMAIL) {
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `New inquiry from ${name}`,
        html: newInquiryAdminTemplate({ inquiry }),
      });
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }
  }

return inquiry;

  return {
    id: result.insertId,
    name,
    email,
    inquiryType,
    artworkId,
    wallProjectId,
    exhibitionId,
    message,
    status: "new",
  };
}

export async function listInquiries(db, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const offset = (page - 1) * limit;

  const q = `%${query.q || ""}%`;
  const status = query.status || "all";

  const where = [];
  const params = [];

  if (query.q) {
    where.push(`(name LIKE ? OR email LIKE ? OR message LIKE ?)`);
    params.push(q, q, q);
  }

  if (status !== "all") {
    where.push(`status = ?`);
    params.push(status);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      inquiry_type AS inquiryType,
      artwork_id AS artworkId,
      wall_project_id AS wallProjectId,
      exhibition_id AS exhibitionId,
      message,
      status,
      created_at AS createdAt
    FROM inquiries
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  const [[count]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM inquiries
    ${whereSql}
    `,
    params
  );

  const [countsRows] = await db.query(`
    SELECT status, COUNT(*) AS total
    FROM inquiries
    GROUP BY status
  `);

  const counts = {
    all: count.total,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0,
  };

  countsRows.forEach((row) => {
    counts[row.status] = row.total;
  });

  return {
    data: rows,
    total: count.total,
    page,
    limit,
    counts,
  };
}

export async function updateInquiryStatus(db, id, status) {
  await db.query(
    `
    UPDATE inquiries
    SET status = ?
    WHERE id = ?
    `,
    [status, id]
  );

  const [[row]] = await db.query(
    `
    SELECT *
    FROM inquiries
    WHERE id = ?
    `,
    [id]
  );

  return row;
}

export async function getInquiryById(db, id) {
  const [[row]] = await db.query(
    `
    SELECT
      i.id,
      i.name,
      i.email,
      i.inquiry_type AS inquiryType,
      i.artwork_id AS artworkId,
      a.title AS artworkTitle,
      i.wall_project_id AS wallProjectId,
      i.exhibition_id AS exhibitionId,
      i.message,
      i.status,
      i.created_at AS createdAt
    FROM inquiries i
    LEFT JOIN artworks a ON a.id = i.artwork_id
    WHERE i.id = ?
    LIMIT 1
    `,
    [id]
  );

  return row ?? null;
}

export async function replyInquiry(db, id, message) {
  const [[inquiry]] = await db.query(
    `SELECT * FROM inquiries WHERE id = ?`,
    [id]
  );

  if (!inquiry) throw new Error("Inquiry not found");

  await sendMail({
    to: inquiry.email,
    subject: "Reply to your inquiry",
    html: inquiryReplyTemplate({
      name: inquiry.name,
      message,
      artworkTitle: inquiry.artworkTitle,
    }),
  });

  await db.query(
    `UPDATE inquiries SET status = 'replied' WHERE id = ?`,
    [id]
  );

  return true;
}

export async function getInquiryCount(db, status) {
  let query = `SELECT COUNT(*) as count FROM inquiries`;
  const params = [];

  if (status && status !== "all") {
    query += ` WHERE status = ?`;
    params.push(status);
  }

  const [[row]] = await db.query(query, params);

  return row.count;
}
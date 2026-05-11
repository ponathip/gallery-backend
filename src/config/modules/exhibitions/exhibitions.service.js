import { deleteFromS3 } from "../../../services/s3.service.js";

export async function listExhibitions(db, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const offset = (page - 1) * limit;
  const q = `%${query.q || ""}%`;

  const [rows] = await db.query(`
    SELECT
      id,
      slug,
      title,
      year,
      type,
      venue,
      exhibition_date AS exhibitionDate,
      artist,
      cover_image_url AS coverImageUrl,
      cover_thumb_url AS coverThumbUrl,
      is_published AS isPublished,
      sort_order AS sortOrder,
      created_at AS createdAt
    FROM exhibitions
    WHERE title LIKE ?
       OR type LIKE ?
       OR venue LIKE ?
    ORDER BY sort_order ASC, created_at DESC
    LIMIT ? OFFSET ?
  `,
    [q, q, q, limit, offset]);

        const [[count]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM exhibitions
    WHERE title LIKE ?
       OR type LIKE ?
       OR venue LIKE ?
    `,
    [q, q, q]
  );

   return {
    data: rows,
    total: count.total,
    page,
    limit,
  };
}

export async function getExhibitionById(db, id) {
  const [[exhibition]] = await db.query(
    `
    SELECT
      id,
      slug,
      title,
      year,
      type,
      venue,
      exhibition_date AS exhibitionDate,
      artist,
      cover_image_url AS coverImageUrl,
      cover_s3_key AS coverS3Key,
      cover_thumb_url AS coverThumbUrl,
      cover_thumb_s3_key AS coverThumbS3Key,
      description,
      description_th AS descriptionTh,
      statement,
      statement_th AS statementTh,
      sort_order AS sortOrder,
      is_published AS isPublished,
      created_at AS createdAt
    FROM exhibitions
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!exhibition) return null;

  const [images] = await db.query(
    `
    SELECT
      id,
      image_url AS imageUrl,
      s3_key AS s3Key,
      thumb_url AS thumbUrl,
      thumb_s3_key AS thumbS3Key,
      alt_text AS altText,
      sort_order AS sortOrder
    FROM exhibition_images
    WHERE exhibition_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [id]
  );

  const [artworks] = await db.query(
    `
    SELECT
        a.id,
        a.slug,
        a.title,
        a.year,
        a.category,
        a.cover_image_url AS coverImageUrl,
        a.cover_thumb_url AS coverThumbUrl,
        ea.sort_order AS sortOrder
    FROM exhibition_artworks ea
    JOIN artworks a ON a.id = ea.artwork_id
    WHERE ea.exhibition_id = ?
    ORDER BY ea.sort_order ASC
    `,
    [id]
    );

  return {
    ...exhibition,
    images,
    artworks,
  };
}

export async function createExhibition(db, payload) {
  const {
    slug,
    title,
    year,
    type,
    venue,
    exhibitionDate,
    artist = "PhanatchaNuch",
    coverImageUrl,
    coverS3Key,
    coverThumbUrl,
    coverThumbS3Key,
    description,
    descriptionTh,
    statement,
    statementTh,
    sortOrder = 0,
    isPublished = true,
    images = [],
    artworkIds = [],
  } = payload;

  const [result] = await db.query(
    `
    INSERT INTO exhibitions (
      slug,
      title,
      year,
      type,
      venue,
      exhibition_date,
      artist,
      cover_image_url,
      cover_s3_key,
      cover_thumb_url,
      cover_thumb_s3_key,
      description,
      description_th,
      statement,
      statement_th,
      sort_order,
      is_published
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      slug,
      title,
      year,
      type,
      venue,
      exhibitionDate,
      artist,
      coverImageUrl,
      coverS3Key,
      coverThumbUrl,
      coverThumbS3Key,
      description,
      descriptionTh,
      statement,
      statementTh,
      sortOrder,
      isPublished ? 1 : 0,
    ]
  );

  const exhibitionId = result.insertId;

  for (const img of images) {
    await db.query(
      `
      INSERT INTO exhibition_images (
        exhibition_id,
        image_url,
        s3_key,
        thumb_url,
        thumb_s3_key,
        alt_text,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        exhibitionId,
        img.imageUrl,
        img.s3Key ?? null,
        img.thumbUrl ?? null,
        img.thumbS3Key ?? null,
        img.altText ?? null,
        img.sortOrder ?? 0,
      ]
    );
  }

  for (let i = 0; i < artworkIds.length; i++) {
    await db.query(
        `
        INSERT INTO exhibition_artworks (
        exhibition_id,
        artwork_id,
        sort_order
        )
        VALUES (?, ?, ?)
        `,
        [exhibitionId, artworkIds[i], i + 1]
    );
    }

  return exhibitionId;
}

export async function updateExhibition(db, id, payload) {
  const {
    slug,
    title,
    year,
    type,
    venue,
    exhibitionDate,
    artist,
    coverImageUrl,
    coverS3Key,
    coverThumbUrl,
    coverThumbS3Key,
    description,
    descriptionTh,
    statement,
    statementTh,
    sortOrder = 0,
    isPublished = true,
    images = [],
    deletedImages = [],
    deletedFiles = [],
    artworkIds = [],
  } = payload;

  for (const key of deletedFiles) {
    await deleteFromS3(key);
  }

  for (const img of deletedImages) {
    await deleteFromS3(img.s3Key);
    await deleteFromS3(img.thumbS3Key);
  }

  await db.query(
    `
    UPDATE exhibitions
    SET
      slug = ?,
      title = ?,
      year = ?,
      type = ?,
      venue = ?,
      exhibition_date = ?,
      artist = ?,
      cover_image_url = ?,
      cover_s3_key = ?,
      cover_thumb_url = ?,
      cover_thumb_s3_key = ?,
      description = ?,
      description_th = ?,
      statement = ?,
      statement_th = ?,
      sort_order = ?,
      is_published = ?,
      updated_at = NOW()
    WHERE id = ?
    `,
    [
      slug,
      title,
      year,
      type,
      venue,
      exhibitionDate,
      artist,
      coverImageUrl,
      coverS3Key,
      coverThumbUrl,
      coverThumbS3Key,
      description,
      descriptionTh,
      statement,
      statementTh,
      sortOrder,
      isPublished ? 1 : 0,
      id,
    ]
  );

  await db.query(`DELETE FROM exhibition_images WHERE exhibition_id = ?`, [id]);

  for (const img of images) {
    await db.query(
      `
      INSERT INTO exhibition_images (
        exhibition_id,
        image_url,
        s3_key,
        thumb_url,
        thumb_s3_key,
        alt_text,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        img.imageUrl,
        img.s3Key ?? null,
        img.thumbUrl ?? null,
        img.thumbS3Key ?? null,
        img.altText ?? null,
        img.sortOrder ?? 0,
      ]
    );
  }

  await db.query(
    `DELETE FROM exhibition_artworks WHERE exhibition_id = ?`,
    [id]
    );

    for (let i = 0; i < artworkIds.length; i++) {
    await db.query(
        `
        INSERT INTO exhibition_artworks (
        exhibition_id,
        artwork_id,
        sort_order
        )
        VALUES (?, ?, ?)
        `,
        [id, artworkIds[i], i + 1]
    );
    }

  return true;
}

export async function deleteExhibition(db, id) {
  const [[exhibition]] = await db.query(
    `
    SELECT
      cover_s3_key,
      cover_thumb_s3_key
    FROM exhibitions
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!exhibition) return false;

  const [images] = await db.query(
    `
    SELECT s3_key, thumb_s3_key
    FROM exhibition_images
    WHERE exhibition_id = ?
    `,
    [id]
  );

  await Promise.all([
    deleteFromS3(exhibition.cover_s3_key),
    deleteFromS3(exhibition.cover_thumb_s3_key),
    ...images.flatMap((img) => [
      deleteFromS3(img.s3_key),
      deleteFromS3(img.thumb_s3_key),
    ]),
  ]);

  await db.query(`DELETE FROM exhibition_images WHERE exhibition_id = ?`, [id]);
  await db.query(`DELETE FROM exhibitions WHERE id = ?`, [id]);

  return true;
}

export async function updateExhibitionPublish(db, id, isPublished) {
  await db.query(
    `
    UPDATE exhibitions
    SET is_published = ?, updated_at = NOW()
    WHERE id = ?
    `,
    [isPublished ? 1 : 0, id]
  );
}

export async function listPublicExhibitions(db) {
  const [rows] = await db.query(`
    SELECT
      id,
      slug,
      title,
      year,
      type,
      venue,
      exhibition_date AS exhibitionDate,
      artist,
      cover_image_url AS coverImageUrl,
      cover_thumb_url AS coverThumbUrl,
      description
    FROM exhibitions
    WHERE is_published = 1
    ORDER BY sort_order ASC, created_at DESC
  `);

  return rows;
}

export async function getPublicExhibitionBySlug(db, slug) {
  const [[exhibition]] = await db.query(
    `
    SELECT
      id,
      slug,
      title,
      year,
      type,
      venue,
      exhibition_date AS exhibitionDate,
      artist,
      cover_image_url AS coverImageUrl,
      cover_thumb_url AS coverThumbUrl,
      description,
      description_th AS descriptionTh,
      statement,
      statement_th AS statementTh
    FROM exhibitions
    WHERE slug = ?
      AND is_published = 1
    LIMIT 1
    `,
    [slug]
  );

  if (!exhibition) return null;

  const [images] = await db.query(
    `
    SELECT
      id,
      image_url AS imageUrl,
      thumb_url AS thumbUrl,
      alt_text AS altText,
      sort_order AS sortOrder
    FROM exhibition_images
    WHERE exhibition_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [exhibition.id]
  );

  const [artworks] = await db.query(
  `
  SELECT
    a.id,
    a.slug,
    a.title,
    a.year,
    a.category,
    a.cover_image_url AS coverImageUrl,
    a.cover_thumb_url AS coverThumbUrl,
    ea.sort_order AS sortOrder
  FROM exhibition_artworks ea
  JOIN artworks a ON a.id = ea.artwork_id
  WHERE ea.exhibition_id = ?
  ORDER BY ea.sort_order ASC
  `,
  [exhibition.id]
);

  return {
    ...exhibition,
    images,
    artworks,
  };
}

export async function sortExhibition(db, items) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of items) {
      await conn.query(
        `
        UPDATE exhibitions
        SET sort_order = ?
        WHERE id = ?
        `,
        [Number(item.sort_order), Number(item.id)]
      );
    }

    await conn.commit();

    return items;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

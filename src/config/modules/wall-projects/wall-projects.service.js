import { deleteFromS3 } from "../../../services/s3.service.js";
import { parseVideoEmbed } from "../../../utils/videoEmbed.js";

export async function listWallProjects(db, query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);
  const offset = (page - 1) * limit;
  const q = `%${query.q || ""}%`;

  const [rows] = await db.query(
    `
    SELECT
      id,
      slug,
      title,
      location,
      year,
      space_type AS spaceType,
      status,
      cover_image_url AS coverImageUrl,
      cover_thumb_url AS coverThumbUrl,
      is_published AS isPublished,
      created_at AS createdAt,
      view_count AS views,
      like_count AS likes
    FROM wall_projects
    WHERE title LIKE ?
       OR location LIKE ?
       OR year LIKE ?
       OR space_type LIKE ?
    ORDER BY sort_order ASC, created_at DESC
    LIMIT ? OFFSET ?
    `,
    [q, q, q, q, limit, offset]
  );

  const [[count]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM wall_projects
    WHERE title LIKE ?
       OR location LIKE ?
       OR year LIKE ?
       OR space_type LIKE ?
    `,
    [q, q, q, q]
  );

  return {
    data: rows,
    total: count.total,
    page,
    limit,
  };
}

export async function listPublicWallProjects(db) {
  const [rows] = await db.query(`
    SELECT
      id,
      slug,
      title,
      location,
      year,
      space_type AS spaceType,
      status,
      cover_image_url AS coverImageUrl,
      before_image_url AS beforeImageUrl,
      after_image_url AS afterImageUrl
    FROM wall_projects
    WHERE is_published = 1
    ORDER BY sort_order ASC, created_at DESC
  `);

  return rows;
}

export async function getPublicWallProjectBySlug(db, slug) {
  const [[project]] = await db.query(
    `
    SELECT
      id,
      slug,
      title,
      location,
      year,
      space_type AS spaceType,
      status,
      cover_image_url AS coverImageUrl,
      before_image_url AS beforeImageUrl,
      after_image_url AS afterImageUrl,
      description,
      description_th AS descriptionTh,
      concept,
      concept_th AS conceptTh,
      video_embed_url AS videoEmbedUrl,
      video_platform AS videoPlatform,
      view_count AS viewCount,
      like_count AS likeCount
    FROM wall_projects
    WHERE slug = ?
      AND is_published = 1
    LIMIT 1
    `,
    [slug]
  );

  if (!project) return null;

  const [images] = await db.query(
    `
    SELECT
      image_url AS imageUrl,
      alt_text AS altText
    FROM wall_project_images
    WHERE wall_project_id = ?
    ORDER BY sort_order ASC
    `,
    [project.id]
  );

  return {
    ...project,
    images,
  };
}

export async function createWallProject(db, payload) {
  const {
    slug,
    title,
    location,
    year,
    spaceType,
    status,
    coverImageUrl,
    coverS3Key,
    coverThumbUrl,
    coverThumbS3Key,
    beforeImageUrl,
    beforeS3Key,
    beforeThumbUrl,
    beforeThumbS3Key,
    afterImageUrl,
    afterS3Key,
    afterThumbUrl,
    afterThumbS3Key,
    description,
    descriptionTh,
    concept,
    conceptTh,
    isPublished,
  } = payload;

  const video = parseVideoEmbed(payload.videoUrl);

  const [result] = await db.query(
    `
    INSERT INTO wall_projects (
      slug,
      title,
      location,
      year,
      space_type,
      status,
      cover_image_url,
      cover_s3_key,
      cover_thumb_url,
      cover_thumb_s3_key,
      before_image_url,
      before_s3_key,
      before_thumb_url,
      before_thumb_s3_key,
      after_image_url,
      after_s3_key,
      after_thumb_url,
      after_thumb_s3_key,
      description,
      description_th,
      concept,
      concept_th,
      video_url,
      video_embed_url,
      video_platform,
      is_published
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      slug,
      title,
      location,
      year,
      spaceType,
      status,
      coverImageUrl,
      coverS3Key,
      coverThumbUrl,
      coverThumbS3Key,
      beforeImageUrl,
      beforeS3Key,
      beforeThumbUrl,
      beforeThumbS3Key,
      afterImageUrl,
      afterS3Key,
      afterThumbUrl,
      afterThumbS3Key,
      description,
      descriptionTh,
      concept,
      conceptTh,
      video.video_url,
      video.video_embed_url,
      video.platform,
      isPublished ? 1 : 0,
    ]
  );

  // หลัง insert project
    for (const img of payload.images) {
    await db.query(
        `
        INSERT INTO wall_project_images
        (wall_project_id, image_url, s3_key, thumb_url, thumb_s3_key, alt_text, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
        result.insertId,
        img.imageUrl,
        img.s3Key,
        img.thumbUrl,
        img.thumbS3Key,
        slug,
        img.sortOrder,
        ]
    );
    }

  return result.insertId;
}

export async function getWallProjectById(db, id) {
  const [[project]] = await db.query(
    `SELECT * FROM wall_projects WHERE id = ?`,
    [id]
  );

  const [images] = await db.query(
    `SELECT * FROM wall_project_images WHERE wall_project_id = ? ORDER BY sort_order ASC`,
    [id]
  );

  return { ...project, images };
}

export async function updateWallProject(db, id, payload) {
  const video = parseVideoEmbed(payload.videoUrl);
  await db.query(
    `
    UPDATE wall_projects
    SET
      title = ?,
      location = ?,
      year = ?,
      space_type = ?,
      status = ?,
      description = ?,
      description_th = ?,
      cover_image_url = ?,
      cover_s3_key = ?,
      cover_thumb_url = ?,
      cover_thumb_s3_key = ?,
      before_image_url = ?,
      before_s3_key = ?,
      before_thumb_url = ?,
      before_thumb_s3_key = ?,
      after_image_url = ?,
      after_s3_key = ?,
      after_thumb_url = ?,
      after_thumb_s3_key = ?,
      concept = ?,
      concept_th = ?,
      video_url = ?,
      video_embed_url = ?,
      video_platform = ?,
      is_published = ?
    WHERE id = ?
    `,
    [
      payload.title,
      payload.location,
      payload.year,
      payload.spaceType,
      payload.status,
      payload.description,
      payload.descriptionTh,
      payload.coverImageUrl,
      payload.coverS3Key,
      payload.coverThumbUrl,
      payload.coverThumbS3Key,
      payload.beforeImageUrl,
      payload.beforeS3Key,
      payload.beforeThumbUrl,
      payload.beforeThumbS3Key,
      payload.afterImageUrl,
      payload.afterS3Key,
      payload.afterThumbUrl,
      payload.afterThumbS3Key,
      payload.concept,
      payload.conceptTh,
      video.video_url,
      video.video_embed_url,
      video.platform,
      payload.isPublished ? 1 : 0,
      id,
    ]
  );

  const { deletedFiles = [] } = payload;

  for (const key of deletedFiles) {
    await deleteFromS3(key);
  }

  // 🔥 reset images (ง่ายสุดก่อน)
  await db.query(
    `DELETE FROM wall_project_images WHERE wall_project_id = ?`,
    [id]
  );

  for (const img of payload.images || []) {
    await db.query(
      `
      INSERT INTO wall_project_images
      (wall_project_id, image_url, s3_key, thumb_url, thumb_s3_key, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, img.imageUrl,
        img.s3Key,
        img.thumbUrl,
        img.thumbS3Key,
        img.sortOrder]
    );
  }

  return true;
}

export async function deleteWallProject(db, id) {
  const [[project]] = await db.query(
    `
    SELECT
      cover_s3_key,
      cover_thumb_s3_key,
      before_s3_key,
      before_thumb_s3_key,
      after_s3_key,
      after_thumb_s3_key
    FROM wall_projects
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!project) return false;

  const [images] = await db.query(
    `
    SELECT
      s3_key,
      thumb_s3_key
    FROM wall_project_images
    WHERE wall_project_id = ?
    `,
    [id]
  );

  await Promise.all([
    deleteFromS3(project.cover_s3_key),
    deleteFromS3(project.cover_thumb_s3_key),
    deleteFromS3(project.before_s3_key),
    deleteFromS3(project.before_thumb_s3_key),
    deleteFromS3(project.after_s3_key),
    deleteFromS3(project.after_thumb_s3_key),
    ...images.flatMap((img) => [
      deleteFromS3(img.s3_key),
      deleteFromS3(img.thumb_s3_key),
    ]),
  ]);

  await db.query(
    `DELETE FROM wall_project_images WHERE wall_project_id = ?`,
    [id]
  );

  await db.query(
    `DELETE FROM wall_projects WHERE id = ?`,
    [id]
  );

  return true;
}

export async function sortWallProjectImages(db, wallProjectId, images = []) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const image of images) {
      await conn.query(
        `
          UPDATE wall_project_images
          SET sort_order = ?
          WHERE id = ?
            AND wall_project_id = ?
        `,
        [image.sortOrder, image.id, wallProjectId]
      );
    }

    await conn.commit();

    const [rows] = await db.query(
      `
        SELECT
          id,
          image_url AS imageUrl,
          s3_key AS s3Key,
          thumb_url AS thumbUrl,
          thumb_s3_key AS thumbS3Key,
          alt_text AS altText,
          sort_order AS sortOrder
        FROM wall_project_images
        WHERE wall_project_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
      [wallProjectId]
    );

    return rows;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function updateWallProjectPublish(db, id, isPublished) {
  await db.query(
    `
    UPDATE wall_projects
    SET is_published = ?, updated_at = NOW()
    WHERE id = ?
    `,
    [isPublished ? 1 : 0, id]
  );
}

export async function incrementWallProjectView(db, slug) {
  await db.query(
    `
    UPDATE wall_projects
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE slug = ?
      AND is_published = 1
    `,
    [slug]
  );

  const [[row]] = await db.query(
    `
    SELECT view_count AS viewCount
    FROM wall_projects
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return row;
}

export async function incrementWallProjectLike(db, slug) {
  await db.query(
    `
    UPDATE wall_projects
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE slug = ?
      AND is_published = 1
    `,
    [slug]
  );

  const [[row]] = await db.query(
    `
    SELECT like_count AS likeCount
    FROM wall_projects
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return row;
}

export async function sortWallProject(db, items) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const item of items) {
      await conn.query(
        `
        UPDATE wall_projects
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
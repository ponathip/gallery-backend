export async function createArtwork(db, payload) {
  const {
    title,
    slug,
    year,
    medium,
    size,
    category,
    status = "available",
    coverImageUrl,
    coverS3Key,
    coverThumbUrl,
    coverThumbS3Key,
    description,
    descriptionTh,
    images = [],
    isPublished = true,
  } = payload;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `
        INSERT INTO artworks (
          title,
          slug,
          year,
          medium,
          size,
          category,
          status,
          cover_image_url,
          cover_s3_key,
          cover_thumb_url,
          cover_thumb_s3_key,
          description,
          description_th,
          is_published,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        title,
        slug,
        year,
        medium,
        size,
        category,
        status,
        coverImageUrl,
        coverS3Key,
        coverThumbUrl,
        coverThumbS3Key,
        description,
        descriptionTh,
        isPublished ? 1 : 0,
      ]
    );

    const artworkId = result.insertId;

    if (images.length > 0) {
      const values = images.map((image, index) => [
        artworkId,
        image.imageUrl,
        image.s3Key ?? null,
        image.thumbUrl ?? null,
        image.thumbS3Key ?? null,
        image.altText ?? title,
        image.sortOrder ?? index + 1,
      ]);

      await conn.query(
        `
          INSERT INTO artwork_images (
            artwork_id,
            image_url,
            s3_key,
            thumb_url,
            thumb_s3_key,
            alt_text,
            sort_order
          )
          VALUES ?
        `,
        [values]
      );
    }

    await conn.commit();

    return {
      id: artworkId,
      ...payload,
    };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function listArtworks(db, query) {
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
      medium,
      size,
      category,
      status,
      cover_image_url AS coverImageUrl,
      cover_s3_key AS coverS3Key,
      cover_thumb_url AS coverThumbUrl,
      cover_thumb_s3_key AS coverThumbS3Key,
      description,
      description_th AS descriptionTh,
      view_count AS viewCount,
      like_count AS likeCount,
      is_published AS isPublished,
      created_at AS createdAt
    FROM artworks
    WHERE title LIKE ?
       OR size LIKE ?
       OR year LIKE ?
       OR category LIKE ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `,
  [q, q, q, q, limit, offset]
  );

    const [[count]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM artworks
    WHERE title LIKE ?
       OR size LIKE ?
       OR year LIKE ?
       OR category LIKE ?
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

export async function getArtworkBySlug(db, slug) {
  const [[artwork]] = await db.query(
    `
      SELECT
        id,
        slug,
        title,
        year,
        medium,
        size,
        category,
        status,
        cover_image_url AS coverImageUrl,
        cover_s3_key AS coverS3Key,
        cover_thumb_url AS coverThumbUrl,
        cover_thumb_s3_key AS coverThumbS3Key,
        description,
        description_th AS descriptionTh,
        view_count AS viewCount,
        like_count AS likeCount,
        is_published AS isPublished,
        created_at AS createdAt
      FROM artworks
      WHERE slug = ?
      LIMIT 1
    `,
    [slug]
  );

  if (!artwork) return null;

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
      FROM artwork_images
      WHERE artwork_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [artwork.id]
  );

  return {
    ...artwork,
    images,
  };
}

export async function getArtworkById(db, id) {
  const [[artwork]] = await db.query(
    `
      SELECT
        id,
        slug,
        title,
        year,
        medium,
        size,
        category,
        status,
        cover_image_url AS coverImageUrl,
        cover_s3_key AS coverS3Key,
        cover_thumb_url AS coverThumbUrl,
        cover_thumb_s3_key AS coverThumbS3Key,
        description,
        description_th AS descriptionTh,
        view_count AS viewCount,
        like_count AS likeCount,
        is_published AS isPublished,
        created_at AS createdAt
      FROM artworks
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  if (!artwork) return null;

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
      FROM artwork_images
      WHERE artwork_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [artwork.id]
  );

  return {
    ...artwork,
    images,
  };
}

export async function updateArtwork(db, id, payload) {
  const {
    title,
    slug,
    year,
    medium,
    size,
    category,
    status,
    coverImageUrl,
    coverS3Key,
    coverThumbUrl,
    coverThumbS3Key,
    description,
    descriptionTh,
    isPublished = true,
  } = payload;

  await db.query(
    `
      UPDATE artworks
      SET
        title = ?,
        slug = ?,
        year = ?,
        medium = ?,
        size = ?,
        category = ?,
        status = ?,
        cover_image_url = ?,
        cover_s3_key = ?,
        cover_thumb_url = ?,
        cover_thumb_s3_key = ?,
        description = ?,
        description_th = ?,
        is_published = ?,
        updated_at = NOW()
      WHERE id = ?
    `,
    [
      title,
      slug,
      year,
      medium,
      size,
      category,
      status,
      coverImageUrl,
      coverS3Key,
      coverThumbUrl,
      coverThumbS3Key,
      description,
      descriptionTh,
      isPublished ? 1 : 0,
      id,
    ]
  );

  return getArtworkById(db, id);
}

export async function addArtworkImages(db, artworkId, images = []) {
  const cleanImages = images.filter((image) => image.imageUrl);

  if (cleanImages.length === 0) {
    return [];
  }

  const values = cleanImages.map((image, index) => [
    artworkId,
    image.imageUrl,
    image.s3Key ?? null,
    image.thumbUrl ?? null,
    image.thumbS3Key ?? null,
    image.altText ?? null,
    image.sortOrder ?? index + 1,
  ]);

  await db.query(
    `
      INSERT INTO artwork_images (
        artwork_id,
        image_url,
        s3_key,
        thumb_url,
        thumb_s3_key,
        alt_text,
        sort_order
      )
      VALUES ?
    `,
    [values]
  );

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
      FROM artwork_images
      WHERE artwork_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [artworkId]
  );

  return rows;
}

export async function deleteArtworkImage(db, imageId) {
  await db.query(
    `
      DELETE FROM artwork_images
      WHERE id = ?
    `,
    [imageId]
  );
}

export async function deleteArtwork(db, id) {
  await db.query(
    `
      DELETE FROM artworks
      WHERE id = ?
    `,
    [id]
  );
}

export async function sortArtworkImages(db, artworkId, images = []) {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    for (const image of images) {
      await conn.query(
        `
          UPDATE artwork_images
          SET sort_order = ?
          WHERE id = ?
            AND artwork_id = ?
        `,
        [image.sortOrder, image.id, artworkId]
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
        FROM artwork_images
        WHERE artwork_id = ?
        ORDER BY sort_order ASC, id ASC
      `,
      [artworkId]
    );

    return rows;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function listPublicArtworks(db) {
  const [rows] = await db.query(`
    SELECT
      id,
      slug,
      title,
      year,
      medium,
      size,
      category,
      status,
      cover_image_url AS coverImageUrl,
      cover_thumb_url AS coverThumbUrl,
      description,
      description_th AS descriptionTh,
      created_at AS createdAt
    FROM artworks
    WHERE is_published = 1
    ORDER BY created_at DESC
  `);

  return rows;
}

export async function getPublicArtworkBySlug(db, slug) {
  const [[artwork]] = await db.query(
    `
      SELECT
        id,
        slug,
        title,
        year,
        medium,
        size,
        category,
        status,
        cover_image_url AS coverImageUrl,
        cover_thumb_url AS coverThumbUrl,
        description,
        description_th AS descriptionTh,
        view_count AS viewCount,
        like_count AS likeCount,
        created_at AS createdAt
      FROM artworks
      WHERE slug = ?
        AND is_published = 1
      LIMIT 1
    `,
    [slug]
  );

  if (!artwork) return null;

  const [images] = await db.query(
    `
      SELECT
        id,
        image_url AS imageUrl,
        thumb_url AS thumbUrl,
        alt_text AS altText,
        sort_order AS sortOrder
      FROM artwork_images
      WHERE artwork_id = ?
      ORDER BY sort_order ASC, id ASC
    `,
    [artwork.id]
  );

  return {
    ...artwork,
    images,
  };
}

export async function incrementArtworkView(db, slug) {
  await db.query(
    `
    UPDATE artworks
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE slug = ?
      AND is_published = 1
    `,
    [slug]
  );

  const [[row]] = await db.query(
    `
    SELECT view_count AS viewCount
    FROM artworks
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return row;
}

export async function incrementArtworkLike(db, slug) {
  await db.query(
    `
    UPDATE artworks
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE slug = ?
      AND is_published = 1
    `,
    [slug]
  );

  const [[row]] = await db.query(
    `
    SELECT like_count AS likeCount
    FROM artworks
    WHERE slug = ?
    LIMIT 1
    `,
    [slug]
  );

  return row;
}
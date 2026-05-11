import * as artworkService from "./artworks.service.js";

export async function createArtwork(req, reply) {
  try {
    const artwork = await artworkService.createArtwork(req.server.db, req.body);

    return reply.code(201).send({
      message: "Artwork created",
      data: artwork,
    });
  } catch (error) {
    req.log.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({
        message: "Slug already exists",
      });
    }

    return reply.code(500).send({
      message: "Failed to create artwork",
    });
  }
}

export async function listArtworks(req, reply) {
  const result = await artworkService.listArtworks(req.server.db, req.query);
  return reply.send(result);
}

export async function getArtworkBySlug(req, reply) {
  const { slug } = req.params;
  const artwork = await artworkService.getArtworkBySlug(req.server.db, slug);

  if (!artwork) {
    return reply.code(404).send({ message: "Artwork not found" });
  }

  return reply.send({ data: artwork });
}

export async function getArtworkById(req, reply) {
  const { id } = req.params;

  const artwork = await artworkService.getArtworkById(req.server.db, id);

  if (!artwork) {
    return reply.code(404).send({ message: "Artwork not found" });
  }

  return reply.send({ data: artwork });
}

export async function updateArtwork(req, reply) {
  try {
    const { id } = req.params;

    const artwork = await artworkService.updateArtwork(
      req.server.db,
      id,
      req.body
    );

    return reply.send({
      message: "Artwork updated",
      data: artwork,
    });
  } catch (error) {
    req.log.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return reply.code(409).send({
        message: "Slug already exists",
      });
    }

    return reply.code(500).send({
      message: "Failed to update artwork",
    });
  }
}

export async function addArtworkImages(req, reply) {
  try {
    const { id } = req.params;

    const images = await artworkService.addArtworkImages(
      req.server.db,
      id,
      req.body.images || []
    );

    return reply.code(201).send({
      message: "Images added",
      data: images,
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to add images",
    });
  }
}

export async function deleteArtworkImage(req, reply) {
  try {
    const { imageId } = req.params;

    await artworkService.deleteArtworkImage(req.server.db, imageId);

    return reply.send({
      message: "Image deleted",
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to delete image",
    });
  }
}

export async function deleteArtwork(req, reply) {
  try {
    const { id } = req.params;

    await artworkService.deleteArtwork(req.server.db, id);

    return reply.send({
      message: "Artwork deleted",
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to delete artwork",
    });
  }
}

export async function sortArtworkImages(req, reply) {
  try {
    const { id } = req.params;
    const { images = [] } = req.body;

    const rows = await artworkService.sortArtworkImages(
      req.server.db,
      id,
      images
    );

    return reply.send({
      message: "Images sorted",
      data: rows,
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to sort images",
    });
  }
}

export async function listPublicArtworks(req, reply) {
  const artworks = await artworkService.listPublicArtworks(req.server.db);

  return reply.send({
    data: artworks,
  });
}

export async function getPublicArtworkBySlug(req, reply) {
  const { slug } = req.params;

  const artwork = await artworkService.getPublicArtworkBySlug(
    req.server.db,
    slug
  );

  if (!artwork) {
    return reply.code(404).send({
      message: "Artwork not found",
    });
  }

  return reply.send({
    data: artwork,
  });
}

export async function addArtworkView(req, reply) {
  try {
    const { slug } = req.params;

    const result = await artworkService.incrementArtworkView(
      req.server.db,
      slug
    );

    return reply.send({
      data: result,
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to update view count",
    });
  }
}

export async function addArtworkLike(req, reply) {
  try {
    const { slug } = req.params;

    const result = await artworkService.incrementArtworkLike(
      req.server.db,
      slug
    );

    return reply.send({
      data: result,
    });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({
      message: "Failed to update like count",
    });
  }
}

export async function reorderArtworks(req, reply) {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return reply.code(400).send({ message: "items ต้องเป็น array" });
    }

    const rows = await artworkService.sortArtwork(
      req.server.db,
      items
    );

    return reply.send({
      message: "อัปเดตลำดับสำเร็จ",
      data: rows,
    });

  } catch (err) {
    console.error(err);
    return reply.code(500).send({ message: "อัปเดตลำดับไม่สำเร็จ" });
  }
}
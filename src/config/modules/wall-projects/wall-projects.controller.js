import * as service from "./wall-projects.service.js";

export async function listWallProjects(req, reply) {
  const result = await service.listWallProjects(req.server.db, req.query);
  return reply.send(result);
}

export async function listPublicWallProjects(req, reply) {
  const data = await service.listPublicWallProjects(req.server.db);
  return reply.send({ data });
}

export async function getPublicWallProjectBySlug(req, reply) {
  const { slug } = req.params;

  const project = await service.getPublicWallProjectBySlug(
    req.server.db,
    slug
  );

  if (!project) {
    return reply.code(404).send({ message: "Not found" });
  }

  return reply.send({ data: project });
}

export async function createWallProject(req, reply) {
  try {
    const id = await service.createWallProject(
      req.server.db,
      req.body
    );

    return reply.code(201).send({ id });
  } catch (e) {
    req.log.error(e);
    return reply.code(500).send({ message: "Create failed" });
  }
}

export async function getWallProjectById(req, reply) {
  const { id } = req.params;

  const data = await service.getWallProjectById(req.server.db, id);

  if (!data) {
    return reply.code(404).send({ message: "Not found" });
  }

  return reply.send({ data });
}

export async function updateWallProject(req, reply) {
  const { id } = req.params;

  await service.updateWallProject(req.server.db, id, req.body);

  return reply.send({ message: "Updated" });
}

export async function deleteWallProject(req, reply) {
  try {
    const { id } = req.params;

    await service.deleteWallProject(req.server.db, id);

    return reply.send({ message: "Deleted" });
  } catch (e) {
    req.log.error(e);
    return reply.code(500).send({ message: "Delete failed" });
  }
}

export async function sortWallProjectImages(req, reply) {
  try {
    const { id } = req.params;
    const { images = [] } = req.body;

    const rows = await service.sortWallProjectImages(
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

export async function updateWallProjectPublish(req, reply) {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    await service.updateWallProjectPublish(
      req.server.db,
      id,
      isPublished
    );

    return reply.send({ message: "Publish updated" });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Update failed" });
  }
}

export async function addWallProjectView(req, reply) {
  try {
    const { slug } = req.params;
    const data = await service.incrementWallProjectView(req.server.db, slug);
    return reply.send({ data });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Failed to update view count" });
  }
}

export async function addWallProjectLike(req, reply) {
  try {
    const { slug } = req.params;
    const data = await service.incrementWallProjectLike(req.server.db, slug);
    return reply.send({ data });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Failed to update like count" });
  }
}
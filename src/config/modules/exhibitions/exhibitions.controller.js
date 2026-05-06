import * as service from "./exhibitions.service.js";

export async function listExhibitions(req, reply) {
  const result = await service.listExhibitions(req.server.db, req.query);
  return reply.send(result);
}

export async function getExhibitionById(req, reply) {
  const { id } = req.params;
  const data = await service.getExhibitionById(req.server.db, id);

  if (!data) {
    return reply.code(404).send({ message: "Exhibition not found" });
  }

  return reply.send({ data });
}

export async function createExhibition(req, reply) {
  try {
    const id = await service.createExhibition(req.server.db, req.body);
    return reply.code(201).send({ data: { id } });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Create exhibition failed" });
  }
}

export async function updateExhibition(req, reply) {
  try {
    const { id } = req.params;
    await service.updateExhibition(req.server.db, id, req.body);
    return reply.send({ message: "Exhibition updated" });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Update exhibition failed" });
  }
}

export async function deleteExhibition(req, reply) {
  try {
    const { id } = req.params;
    const deleted = await service.deleteExhibition(req.server.db, id);

    if (!deleted) {
      return reply.code(404).send({ message: "Exhibition not found" });
    }

    return reply.send({ message: "Exhibition deleted" });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Delete exhibition failed" });
  }
}

export async function updateExhibitionPublish(req, reply) {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    await service.updateExhibitionPublish(
      req.server.db,
      id,
      isPublished
    );

    return reply.send({ message: "Publish updated" });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Update publish failed" });
  }
}

export async function listPublicExhibitions(req, reply) {
  const data = await service.listPublicExhibitions(req.server.db);
  return reply.send({ data });
}

export async function getPublicExhibitionBySlug(req, reply) {
  const { slug } = req.params;

  const data = await service.getPublicExhibitionBySlug(
    req.server.db,
    slug
  );

  if (!data) {
    return reply.code(404).send({ message: "Exhibition not found" });
  }

  return reply.send({ data });
}
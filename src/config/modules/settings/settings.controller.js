import * as service from "./settings.service.js";

export async function getSettings(req, reply) {
  const data = await service.getSettings(req.server.db);
  return reply.send({ data });
}

export async function updateSettings(req, reply) {
  const data = await service.updateSettings(req.server.db, req.body);
  return reply.send({ data });
}

export async function getPublicSettings(req, reply) {
  const data = await service.getSettings(req.server.db);

  return reply.send({
    data: {
      siteName: data.site_name,
      email: data.email,
      instagram: data.instagram,
      facebook: data.facebook,
      line: data.line,
      locationEn: data.location_en,
      locationTh: data.location_th,
      defaultTitle: data.default_title,
      defaultDescription: data.default_description,
      defaultOgImage: data.default_og_image,
      profileImageUrl: data.profile_image_url,
      aboutTitleEn: data.about_title_en,
      aboutTitleTh: data.about_title_th,
      bioEn: data.bio_en,
      bioTh: data.bio_th,
      artistStatementEn: data.artist_statement_en,
      artistStatementTh: data.artist_statement_th,
    },
  });
}
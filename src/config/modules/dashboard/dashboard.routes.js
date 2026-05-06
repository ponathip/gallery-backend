
export default async function artworkRoutes(app) {
    app.get("/dashboard/summary", async (req, reply) => {
    const [[artworks]] = await req.server.db.query(
        `SELECT COUNT(*) AS total FROM artworks`
    );

    const [[wallProjects]] = await req.server.db.query(
        `SELECT COUNT(*) AS total FROM wall_projects`
    );

    const [[exhibitions]] = await req.server.db.query(
        `SELECT COUNT(*) AS total FROM exhibitions`
    );

    const [[inquiries]] = await req.server.db.query(
        `SELECT COUNT(*) AS total FROM inquiries`
    );

    const [[newInquiries]] = await req.server.db.query(
        `SELECT COUNT(*) AS total FROM inquiries WHERE status = 'new'`
    );

    const [recentInquiries] = await req.server.db.query(`
        SELECT
        id,
        name,
        email,
        inquiry_type AS inquiryType,
        status,
        created_at AS createdAt
        FROM inquiries
        ORDER BY created_at DESC
        LIMIT 5
    `);

    return reply.send({
        data: {
        totalArtworks: artworks.total,
        totalWallProjects: wallProjects.total,
        totalExhibitions: exhibitions.total,
        totalInquiries: inquiries.total,
        newInquiries: newInquiries.total,
        recentInquiries,
        },
    });
    });
}
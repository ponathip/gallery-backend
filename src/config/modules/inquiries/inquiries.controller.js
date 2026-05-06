import * as inquiryService from "./inquiries.service.js";

export async function createPublicInquiry(req, reply) {
  try {
    const { name, email, inquiryType, message } = req.body;

    if (!name || !email || !message) {
      return reply.code(400).send({
        message: "name, email and message are required",
      });
    }

    const inquiry = await inquiryService.createInquiry(req.server.db, req.body);

    return reply.code(201).send({
      message: "Inquiry created",
      data: inquiry,
    });
  } catch (error) {
    req.log.error(error);

    return reply.code(500).send({
      message: "Failed to create inquiry",
    });
  }
}

export async function listInquiries(req, reply) {
  const rows = await inquiryService.listInquiries(req.server.db, req.query);
  return reply.send(rows);
}

export async function updateInquiryStatus(req, reply) {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["new", "read", "replied", "archived"];

  if (!allowed.includes(status)) {
    return reply.code(400).send({ message: "Invalid status" });
  }

  const row = await inquiryService.updateInquiryStatus(
    req.server.db,
    id,
    status
  );

  return reply.send({ data: row });
}

export async function getInquiryById(req, reply) {
  const { id } = req.params;

  const inquiry = await inquiryService.getInquiryById(req.server.db, id);

  if (!inquiry) {
    return reply.code(404).send({ message: "Inquiry not found" });
  }

  // ✅ ถ้าเป็น new → เปลี่ยนเป็น read อัตโนมัติ
  if (inquiry.status === "new") {
    await inquiryService.updateInquiryStatus(
      req.server.db,
      id,
      "read"
    );

    inquiry.status = "read"; // update response ด้วย
  }

  return reply.send({ data: inquiry });
}

export async function replyInquiry(req, reply) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return reply.code(400).send({ message: "Message required" });
    }

    await inquiryService.replyInquiry(req.server.db, id, message);

    return reply.send({ message: "Email sent" });
  } catch (error) {
    req.log.error(error);
    return reply.code(500).send({ message: "Failed to send email" });
  }
}

export async function getInquiryCount(req, reply) {
  try {
    const { status } = req.query;

    const count = await inquiryService.getInquiryCount(
      req.server.db,
      status
    );

    return reply.send({ count });
  } catch (error) {
    req.log.error(error);

    return reply.code(500).send({
      message: "Failed to get inquiry count",
    });
  }
}
import { 
    createPublicInquiry,
    listInquiries,
    getInquiryById,
    updateInquiryStatus,
    replyInquiry,
    getInquiryCount,
} from "./inquiries.controller.js";

export default async function inquiryRoutes(app) {
  app.post("/public/inquiries", createPublicInquiry);

  app.get("/inquiries", listInquiries);
  app.get("/inquiries/:id", getInquiryById);
  app.put("/inquiries/:id/status", updateInquiryStatus);
  app.post("/inquiries/:id/reply", replyInquiry);
  app.get("/inquiries/count", getInquiryCount);
}
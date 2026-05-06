export function inquiryReplyTemplate({
  name,
  message,
  artworkTitle,
}) {
  return `
  <div style="background:#f5f5f3;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#000000;padding:24px;text-align:center;">
                <img 
                    src="https://yourdomain.com/logo.png" 
                    width="120"
                    style="display:block;margin:0 auto;"
                />
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px;color:#222;">
                <p style="font-size:14px;color:#888;">Dear ${name},</p>

                <h2 style="margin-top:10px;font-weight:normal;">
                  Thank you for your inquiry
                </h2>

                <p style="margin-top:20px;font-size:14px;line-height:1.7;color:#444;">
                  ${message}
                </p>
                <p style="font-size:12px;color:#999;">
                    Regarding: ${artworkTitle ?? "-"}
                </p>
                <a 
                    href="https://yourdomain.com/en/gallery"
                    style="
                        display:inline-block;
                        margin-top:24px;
                        padding:12px 20px;
                        background:#000;
                        color:#fff;
                        text-decoration:none;
                        font-size:12px;
                        letter-spacing:1px;
                    "
                    >
                    VIEW MORE ARTWORKS
                </a>

                <p style="margin-top:30px;font-size:14px;color:#444;">
                  If you have any further questions, feel free to reply directly to this email.
                </p>

                <p style="margin-top:30px;font-size:14px;">
                  Best regards,<br/>
                  <strong>PhanatchaNuch</strong>
                </p>
              </td>
            </tr>

            <tr>
                <td style="padding:16px;text-align:center;">
                    <a href="https://instagram.com/yourpage" style="margin:0 6px;">Instagram</a>
                    <a href="https://facebook.com/yourpage" style="margin:0 6px;">Facebook</a>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#fafafa;padding:20px;text-align:center;font-size:12px;color:#888;">
                <p style="margin-top:30px;font-size:14px;">
                    Best regards,<br/>
                    <strong>PhanatchaNuch</strong><br/>
                    <span style="font-size:12px;color:#888;">
                        Contemporary Artist
                    </span>
                </p>
                © ${new Date().getFullYear()} PhanatchaNuch<br/>
                All rights reserved
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;
}

export function newInquiryAdminTemplate({ inquiry }) {
  return `
    <div style="background:#f5f5f3;padding:40px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;">
        <h2 style="margin:0 0 20px;">New Inquiry Received</h2>

        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Type:</strong> ${inquiry.inquiryType}</p>

        ${
          inquiry.artworkId
            ? `<p><strong>Artwork ID:</strong> ${inquiry.artworkId}</p>`
            : ""
        }

        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />

        <p style="white-space:pre-line;line-height:1.7;">
          ${inquiry.message}
        </p>

        <a
          href="${process.env.ADMIN_URL ?? "http://localhost:3008"}/inquiries/${inquiry.id}"
          style="display:inline-block;margin-top:24px;background:#000;color:#fff;padding:12px 18px;text-decoration:none;font-size:12px;letter-spacing:1px;"
        >
          OPEN IN ADMIN
        </a>
      </div>
    </div>
  `;
}
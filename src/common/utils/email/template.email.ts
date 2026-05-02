import { FACEBOOK, INSTAGRAM, TWITTER } from "../../../config/config"

export const emailTemplate = ({ title, code }: { title: string, code: number }): string => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media App</title>
  </head>

  <body style="margin:0; padding:0; background:#0b0f1a; font-family:'Segoe UI', Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:50px 0;">
      <tr>
        <td align="center">

          <!-- Outer Frame -->
          <table width="620" cellpadding="0" cellspacing="0"
            style="
              background:linear-gradient(135deg,#0b0f1a,#111827);
              padding:12px;
              border-radius:20px;
            ">

            <!-- Card -->
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="
                    background:#111827;
                    border-radius:16px;
                    overflow:hidden;
                    box-shadow:0 0 40px rgba(59,130,246,0.15);
                  ">

                  <!-- Header -->
                  <tr>
                    <td style="
                      padding:30px;
                      text-align:center;
                      background:linear-gradient(135deg,#0f172a,#1e3a8a);
                      color:#ffffff;
                    ">
                      <h1 style="margin:0; font-size:22px; letter-spacing:1px;">
                        Social Media App
                      </h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding:40px; text-align:center;">

                      <h2 style="margin:0 0 10px; color:#e5e7eb;">
                        ${title || "Verify Your Account"}
                      </h2>

                      <p style="color:#9ca3af; font-size:15px; line-height:1.6;">
                        Enter the verification code below to continue securely.
                      </p>

                      <!-- Code Box -->
                      <div style="
                        margin:30px auto;
                        padding:18px 35px;
                        font-size:34px;
                        font-weight:bold;
                        letter-spacing:8px;
                        color:#60a5fa;
                        background:#0b1220;
                        border-radius:12px;
                        display:inline-block;
                        border:1px solid #1d4ed8;
                        box-shadow:0 0 15px rgba(59,130,246,0.3);
                      ">
                        ${code || "000000"}
                      </div>

                      <p style="font-size:13px; color:#6b7280;">
                        This code will expire in 10 minutes.
                      </p>

                      <!-- Button -->
                      <a href="http://localhost:4200/#/" 
                        style="
                          display:inline-block;
                          margin-top:25px;
                          padding:14px 34px;
                          background:linear-gradient(135deg,#2563eb,#3b82f6);
                          color:#ffffff;
                          text-decoration:none;
                          border-radius:30px;
                          font-weight:600;
                          font-size:14px;
                          box-shadow:0 0 15px rgba(59,130,246,0.5);
                        ">
                        Continue
                      </a>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="
                      background:#0b0f1a;
                      padding:25px;
                      text-align:center;
                      font-size:13px;
                      color:#6b7280;
                    ">

                      <p style="margin-bottom:10px; color:#9ca3af;">Stay Connected</p>

                      <p>
                        <a href="${FACEBOOK}" style="margin:0 10px; color:#60a5fa; text-decoration:none;">Facebook</a>
                        <a href="${INSTAGRAM}" style="margin:0 10px; color:#60a5fa; text-decoration:none;">Instagram</a>
                        <a href="${TWITTER}" style="margin:0 10px; color:#60a5fa; text-decoration:none;">Twitter</a>
                      </p>

                      <p style="margin-top:15px; font-size:12px; color:#4b5563;">
                        © 2026 Social Media App. All rights reserved.
                      </p>

                    </td>
                  </tr>

                </table>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>`;
}
import nodemailer from "nodemailer";

function getSMTPConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from =
    process.env.SMTP_FROM ||
    `"Aegis Trading Academy" <${user || "noreply@aegistrading.com"}>`;

  return { host, port, user, pass, from };
}

export function logSMTPDiagnostics() {
  const { host, port, user, pass, from } = getSMTPConfig();

  console.log("[SMTP_DIAGNOSTICS]", {
    hostConfigured: Boolean(host),
    port,
    userConfigured: Boolean(user),
    passConfigured: Boolean(pass),
    fromConfigured: Boolean(from),
    environment: process.env.NODE_ENV || "development",
  });
}

function createTransporter() {
  const { host, port, user, pass } = getSMTPConfig();

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendRegistrationVerificationCode(
  to: string,
  code: string,
): Promise<{ success: boolean; error?: string }> {
  logSMTPDiagnostics();

  const { from, user, pass } = getSMTPConfig();

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Aegis Trading Academy</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #050505;
        color: #ffffff;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }
      .container {
        max-width: 560px;
        margin: 40px auto;
        background-color: #111113;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      }
      .header {
        padding: 32px 32px 24px 32px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(180deg, rgba(201, 162, 39, 0.1) 0%, rgba(17, 17, 19, 0) 100%);
      }
      .logo-text {
        font-size: 20px;
        font-weight: 900;
        letter-spacing: 2px;
        color: #ffffff;
        margin: 0;
        text-transform: uppercase;
      }
      .logo-sub {
        font-size: 11px;
        font-family: monospace;
        color: #C9A227;
        letter-spacing: 3px;
        text-transform: uppercase;
        display: block;
        margin-top: 4px;
      }
      .content {
        padding: 32px;
      }
      h1 {
        font-size: 22px;
        font-weight: 800;
        margin-top: 0;
        margin-bottom: 12px;
        color: #ffffff;
      }
      p {
        font-size: 14px;
        line-height: 1.6;
        color: #a1a1aa;
        margin-top: 0;
        margin-bottom: 24px;
      }
      .code-box {
        background-color: #09090b;
        border: 1px solid rgba(201, 162, 39, 0.3);
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        margin-bottom: 24px;
      }
      .otp-code {
        font-family: 'Courier New', Courier, monospace;
        font-size: 36px;
        font-weight: 800;
        letter-spacing: 8px;
        color: #C9A227;
        margin: 0;
      }
      .expiry-notice {
        font-size: 12px;
        font-family: monospace;
        color: #71717a;
        margin-top: 12px;
        margin-bottom: 0;
      }
      .footer {
        padding: 24px 32px;
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        background-color: #09090b;
      }
      .footer p {
        font-size: 12px;
        color: #52525b;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 class="logo-text">AEGIS TRADING</h2>
        <span class="logo-sub">ACADEMY</span>
      </div>
      <div class="content">
        <h1>Verify Your Email Address</h1>
        <p>Welcome to Aegis Trading Academy! Use the 6-digit One-Time Password (OTP) below to complete your registration and verify your email address.</p>
        
        <div class="code-box">
          <div class="otp-code">${code}</div>
          <p class="expiry-notice">This code will expire in 10 minutes.</p>
        </div>

        <p>If you did not create an account on Aegis Trading Academy, please ignore this email.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Aegis Trading Academy. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    const transporter = createTransporter();

    // Verify SMTP connection
    await transporter.verify().catch((verifyErr: any) => {
      console.error("[SMTP_VERIFY_FAILED]", {
        code: verifyErr?.code,
        command: verifyErr?.command,
        message: verifyErr?.message || verifyErr,
      });

      if (verifyErr?.code === "EAUTH" || verifyErr?.responseCode === 535) {
        console.error(
          "[SMTP_AUTH_ERROR] Google SMTP rejected the username or password (535 Bad Credentials).\n" +
            `Configured User: "${user}"\n` +
            "Action required:\n" +
            "1. Verify if 'SMTP_USER' is spelled correctly in .env (e.g. check for typos in email domain/handle).\n" +
            "2. Ensure 2-Step Verification is enabled on your Google Account.\n" +
            "3. Generate a 16-character Google App Password at https://myaccount.google.com/apppasswords and update 'SMTP_PASS' in .env.",
        );
      }
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Verify Your Email - Aegis Trading Academy",
      html: htmlContent,
      text: `Your Aegis Trading Academy email verification code is: ${code}. It expires in 10 minutes.`,
    });

    console.log("[SMTP_SUCCESS] Verification email successfully delivered to:", to, "MessageId:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("[SMTP_DELIVERY_ERROR]", {
      code: error?.code,
      response: error?.response,
      message: error?.message || error,
    });

    if (error?.code === "EAUTH" || error?.responseCode === 535) {
      console.error(
        "[SMTP_AUTH_ERROR] Google SMTP rejected the username or password (535 Bad Credentials).\n" +
          `Configured User: "${user}"\n` +
          "Action required:\n" +
          "1. Verify if 'SMTP_USER' is spelled correctly in .env (e.g. check for typos in email domain/handle).\n" +
          "2. Ensure 2-Step Verification is enabled on your Google Account.\n" +
          "3. Generate a 16-character Google App Password at https://myaccount.google.com/apppasswords and update 'SMTP_PASS' in .env.",
      );
    }

    return {
      success: false,
      error: error?.message || "Failed to send email via SMTP.",
    };
  }
}

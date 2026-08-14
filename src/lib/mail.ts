import nodemailer from "nodemailer";

function getSMTPConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from =
    process.env.SMTP_FROM ||
    (user ? `"Aegis Trading Academy" <${user}>` : `"Aegis Trading Academy" <noreply@aegistrading.com>`);

  return { host, port, user, pass, from };
}

export function logSMTPDiagnostics() {
  const { host, port, user, pass, from } = getSMTPConfig();

  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");

  console.log("[SMTP_DIAGNOSTICS]", {
    hostConfigured: Boolean(host),
    port,
    userConfigured: Boolean(user),
    passConfigured: Boolean(pass),
    fromConfigured: Boolean(from),
    missingVariables: missing.length > 0 ? missing : "none",
    environment: process.env.NODE_ENV || "development",
  });
}

function createTransporter() {
  const { host, port, user, pass } = getSMTPConfig();

  const smtpPort = port || 465;

  return nodemailer.createTransport({
    host: host || "smtp.gmail.com",
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendRegistrationVerificationCode(
  to: string,
  code: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  logSMTPDiagnostics();

  const { from, user } = getSMTPConfig();

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

    // Verify SMTP connection before sending
    await transporter.verify();

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Verify Your Email - Aegis Trading Academy",
      html: htmlContent,
      text: `Your Aegis Trading Academy email verification code is: ${code}. It expires in 10 minutes.`,
    });

    console.log("[SMTP_SUCCESS] Verification email successfully delivered to:", to, "MessageId:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("SMTP_SEND_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
    });

    if (error?.code === "EAUTH" || error?.responseCode === 535) {
      console.error(
        "[SMTP_AUTH_ERROR] Google SMTP rejected credentials (535 Bad Credentials).\n" +
          `Configured User: "${user}"\n` +
          "1. Ensure 2-Step Verification is enabled on your Google Account.\n" +
          "2. Generate a 16-character Google App Password at https://myaccount.google.com/apppasswords and update 'SMTP_PASS' in .env.",
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP email failed",
    };
  }
}

export async function sendPasswordResetCode(
  to: string,
  code: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  logSMTPDiagnostics();

  const { from, user } = getSMTPConfig();

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code - Aegis Trading Academy</title>
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
      .warning-box {
        background-color: rgba(225, 29, 72, 0.1);
        border: 1px solid rgba(225, 29, 72, 0.2);
        border-radius: 10px;
        padding: 16px;
        font-size: 13px;
        color: #fda4af;
        margin-bottom: 20px;
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
        <h1>Password Reset Request</h1>
        <p>We received a request to reset the password for your Aegis Trading Academy student account. Use the 6-digit verification code below to set a new password.</p>
        
        <div class="code-box">
          <div class="otp-code">${code}</div>
          <p class="expiry-notice">This reset code will expire in 10 minutes.</p>
        </div>

        <div class="warning-box">
          <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support. Your password will remain unchanged.
        </div>
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

    // Verify SMTP connection before sending
    await transporter.verify();

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Password Reset Code - Aegis Trading Academy",
      html: htmlContent,
      text: `Your Aegis Trading Academy password reset code is: ${code}. It expires in 10 minutes. If you did not request this, please ignore this email.`,
    });

    console.log("[SMTP_SUCCESS] Password reset email delivered to:", to, "MessageId:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("SMTP_SEND_ERROR", {
      message: error instanceof Error ? error.message : String(error),
      code: error?.code,
      command: error?.command,
      response: error?.response,
      responseCode: error?.responseCode,
    });

    if (error?.code === "EAUTH" || error?.responseCode === 535) {
      console.error(
        "[SMTP_AUTH_ERROR] Google SMTP rejected credentials (535 Bad Credentials).\n" +
          `Configured User: "${user}"\n` +
          "1. Ensure 2-Step Verification is enabled on your Google Account.\n" +
          "2. Generate a 16-character Google App Password at https://myaccount.google.com/apppasswords and update 'SMTP_PASS' in .env.",
      );
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP email failed",
    };
  }
}



export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface StudentQueryData {
  referenceId: string;
  name: string;
  email: string;
  phone?: string;
  stage: string;
  subject: string;
  message: string;
}

export interface InstitutionalQueryData {
  referenceId: string;
  institutionName: string;
  representativeName: string;
  designation: string;
  workEmail: string;
  phone: string;
  institutionType: string;
  cohortSize: string;
  partnershipObjective: string;
  message: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendVerificationEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendPasswordResetEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendPasswordResetOtpEmail(to: string, code: string): Promise<{ success: boolean }>;
  sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }>;
  sendStudentQueryNotifications(data: StudentQueryData): Promise<{ success: boolean }>;
  sendInstitutionalQueryNotifications(data: InstitutionalQueryData): Promise<{ success: boolean }>;
}

/**
 * Base Abstract Helper for Email Templates
 */
function getEmailBaseUrl(): string {
  return process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://www.alderwoodvantage.com";
}

function getDefaultFromAddress(): string {
  return process.env.EMAIL_FROM || "Alderwood Vantage <support@send.alderwoodvantage.com>";
}

function getDefaultReplyTo(): string {
  return process.env.EMAIL_REPLY_TO || "support@alderwoodvantage.com";
}

/**
 * Resend Production Email Service
 * Uses Resend API via fetch for zero dependencies and universal Edge/Node compatibility.
 */
export class ResendEmailService implements IEmailService {
  private apiKey: string;
  private from: string;
  private replyTo: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.from = getDefaultFromAddress();
    this.replyTo = getDefaultReplyTo();
  }

  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      console.warn("[Resend] Missing RESEND_API_KEY. Check your environment variables.");
      return { success: false, error: "MISSING_RESEND_API_KEY" };
    }

    try {
      const toAddresses = Array.isArray(options.to) ? options.to : [options.to];

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: toAddresses,
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo || this.replyTo,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("[Resend API Error]:", data);
        return { success: false, error: data?.message || "Failed to send email via Resend" };
      }

      return { success: true, messageId: data.id };
    } catch (err: any) {
      console.error("[Resend Dispatch Exception]:", err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  async sendVerificationEmail(to: string, token: string, baseUrl = getEmailBaseUrl()): Promise<{ success: boolean }> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    const res = await this.sendEmail({
      to,
      subject: "Verify your Alderwood Vantage account",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 22px;">Welcome to Alderwood Vantage</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Please confirm your email address to access your student leadership assessment portal:</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${verifyUrl}" style="background-color: #FF6B6B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #64748B; font-size: 13px; line-height: 1.5;">Or copy and paste this link into your browser:<br/><a href="${verifyUrl}" style="color: #0F172A; word-break: break-all;">${verifyUrl}</a></p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 0;">Alderwood Vantage • Raising leaders, not just employees.</p>
        </div>
      `,
      text: `Welcome to Alderwood Vantage! Verify your email address at: ${verifyUrl}`,
    });
    return { success: res.success };
  }

  async sendPasswordResetEmail(to: string, token: string, baseUrl = getEmailBaseUrl()): Promise<{ success: boolean }> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    const res = await this.sendEmail({
      to,
      subject: "Reset your Alderwood Vantage password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new password:</p>
          <div style="margin: 28px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #0F172A; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748B; font-size: 13px; line-height: 1.5;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 0;">Alderwood Vantage • Raising leaders, not just employees.</p>
        </div>
      `,
      text: `Reset your Alderwood Vantage password at: ${resetUrl}`,
    });
    return { success: res.success };
  }

  async sendPasswordResetOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    const res = await this.sendEmail({
      to,
      subject: "Your Alderwood Vantage Password Reset Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 22px;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the 6-digit verification code below to reset your Alderwood Vantage account password. This code expires in 10 minutes.</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #0F172A; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #64748B; font-size: 12px; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
      text: `Your Alderwood Vantage password reset code is: ${code}. It expires in 10 minutes.`,
    });
    return { success: res.success };
  }

  async sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    const res = await this.sendEmail({
      to,
      subject: "Your Alderwood Vantage Sign-in Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 22px;">Your One-Time Sign-in Code</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Enter this 6-digit code to log in to your Alderwood Vantage account. Valid for 10 minutes:</p>
          <div style="background: #FFF5F5; border: 1px solid #FED7CC; padding: 18px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #FF6B6B; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #64748B; font-size: 12px; margin-bottom: 0;">If you did not request this sign-in code, no action is required.</p>
        </div>
      `,
      text: `Your Alderwood Vantage security sign-in code is: ${code}. Valid for 10 minutes.`,
    });
    return { success: res.success };
  }

  async sendStudentQueryNotifications(data: StudentQueryData): Promise<{ success: boolean }> {
    const adminInbox = process.env.CONTACT_NOTIFICATION_EMAIL || "support@alderwoodvantage.com";

    // 1. Dispatch alert to Alderwood Vantage Team
    await this.sendEmail({
      to: adminInbox,
      replyTo: data.email,
      subject: `[New Contact Query: ${data.referenceId}] ${data.subject} - ${data.name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
          <div style="border-bottom: 2px solid #FF6B6B; padding-bottom: 12px; margin-bottom: 20px;">
            <h3 style="color: #0F172A; margin: 0;">New Student & Parent Query Received</h3>
            <span style="font-size: 12px; color: #64748B; font-mono;">Reference: ${data.referenceId}</span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 140px;"><strong>Name:</strong></td><td style="color: #0F172A;">${data.name}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Email:</strong></td><td style="color: #0F172A;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Phone:</strong></td><td style="color: #0F172A;">${data.phone || "Not provided"}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Stage:</strong></td><td style="color: #0F172A;">${data.stage}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Subject:</strong></td><td style="color: #0F172A;">${data.subject}</td></tr>
          </table>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px;">
            <strong style="color: #0F172A; display: block; margin-bottom: 8px; font-size: 13px;">Message:</strong>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
          </div>
        </div>
      `,
      text: `New Student Query (${data.referenceId}) from ${data.name} (${data.email}, ${data.phone || 'N/A'})\nStage: ${data.stage}\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
    });

    // 2. Dispatch automated acknowledgement to Student/Parent
    await this.sendEmail({
      to: data.email,
      subject: `We've received your query [Ref: ${data.referenceId}] - Alderwood Vantage`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Thank you for contacting Alderwood Vantage</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello ${data.name},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">We have received your enquiry regarding <strong>"${data.subject}"</strong>. Our academic guidance desk is reviewing your message and will respond by email within <strong>4 business hours</strong>.</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin: 20px 0; text-align: center;">
            <span style="font-size: 12px; color: #64748B; display: block; margin-bottom: 4px;">Your Reference ID:</span>
            <span style="font-size: 18px; font-weight: bold; color: #0F172A; font-family: monospace;">${data.referenceId}</span>
          </div>
          <p style="color: #64748B; font-size: 13px; line-height: 1.5;">If you have any urgent queries, you can also connect directly with our counsellor helpline at <strong>+91 93168 19331</strong> (Mon – Sat, 9:00 AM – 7:00 PM IST).</p>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 0;">Alderwood Vantage • Raising leaders, not just employees.</p>
        </div>
      `,
      text: `Hello ${data.name},\n\nWe have received your enquiry (Ref: ${data.referenceId}). Our academic guidance desk will respond within 4 business hours.\n\nHelpline: +91 93168 19331`,
    });

    return { success: true };
  }

  async sendInstitutionalQueryNotifications(data: InstitutionalQueryData): Promise<{ success: boolean }> {
    const adminInbox = process.env.INSTITUTIONAL_NOTIFICATION_EMAIL || "partnerships@alderwoodvantage.com";

    // 1. Dispatch alert to Institutional Partnerships Director
    await this.sendEmail({
      to: adminInbox,
      replyTo: data.workEmail,
      subject: `[Institutional Partnership Request: ${data.referenceId}] ${data.institutionName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px;">
          <div style="border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 20px;">
            <h3 style="color: #0F172A; margin: 0;">Institutional Partnership Inquiry</h3>
            <span style="font-size: 12px; color: #64748B; font-mono;">Reference: ${data.referenceId}</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
            <tr><td style="padding: 6px 0; color: #64748B; width: 170px;"><strong>Institution:</strong></td><td style="color: #0F172A;">${data.institutionName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Type:</strong></td><td style="color: #0F172A;">${data.institutionType}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Representative:</strong></td><td style="color: #0F172A;">${data.representativeName} (${data.designation})</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Work Email:</strong></td><td style="color: #0F172A;"><a href="mailto:${data.workEmail}">${data.workEmail}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Phone:</strong></td><td style="color: #0F172A;">${data.phone}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Cohort Size:</strong></td><td style="color: #0F172A;">${data.cohortSize}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748B;"><strong>Primary Objective:</strong></td><td style="color: #0F172A;">${data.partnershipObjective}</td></tr>
          </table>

          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px;">
            <strong style="color: #0F172A; display: block; margin-bottom: 8px; font-size: 13px;">Context & Timeline:</strong>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message || "None specified"}</p>
          </div>
        </div>
      `,
      text: `Institutional Request (${data.referenceId})\nInstitution: ${data.institutionName} (${data.institutionType})\nRepresentative: ${data.representativeName} (${data.designation})\nEmail: ${data.workEmail}\nPhone: ${data.phone}\nCohort: ${data.cohortSize}\nObjective: ${data.partnershipObjective}\n\nContext:\n${data.message}`,
    });

    // 2. Dispatch automated acknowledgement to School Representative
    await this.sendEmail({
      to: data.workEmail,
      subject: `Institutional Partnership Request Received [Ref: ${data.referenceId}] - Alderwood Vantage`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Institutional Partnership Request Received</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear ${data.representativeName},</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for your interest in bringing Alderwood Vantage to <strong>${data.institutionName}</strong>. Our Institutional Partnerships Director is reviewing your institutional profile and requirements (<em>${data.partnershipObjective}</em>) and will contact you directly within 4 business hours.</p>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px; margin: 20px 0; text-align: center;">
            <span style="font-size: 12px; color: #64748B; display: block; margin-bottom: 4px;">Institutional Docket Reference:</span>
            <span style="font-size: 18px; font-weight: bold; color: #0F172A; font-family: monospace;">${data.referenceId}</span>
          </div>
          <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 0;">Alderwood Vantage • Institutional Partnerships Desk</p>
        </div>
      `,
      text: `Dear ${data.representativeName},\n\nThank you for reaching out regarding ${data.institutionName}. Our Institutional Partnerships Director will contact you within 4 business hours.\nDocket Ref: ${data.referenceId}`,
    });

    return { success: true };
  }
}

/**
 * Stub / Console Logger implementation for local development and testing.
 * Activates when RESEND_API_KEY is not defined.
 */
export class ConsoleEmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL STUB] To: ${Array.isArray(options.to) ? options.to.join(", ") : options.to}`);
    console.log(`[EMAIL STUB] Subject: ${options.subject}`);
    console.log(`[EMAIL STUB] Content Preview: ${options.text || options.html.slice(0, 150)}...`);
    console.log("=======================================================\n");
    return { success: true, messageId: `stub_${Date.now()}` };
  }

  async sendVerificationEmail(to: string, token: string, baseUrl = getEmailBaseUrl()): Promise<{ success: boolean }> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Verification Email to: ${to}`);
    console.log(`[VERIFICATION URL]: ${verifyUrl}`);
    console.log("=======================================================\n");
    return { success: true };
  }

  async sendPasswordResetEmail(to: string, token: string, baseUrl = getEmailBaseUrl()): Promise<{ success: boolean }> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Password Reset Email to: ${to}`);
    console.log(`[RESET URL]: ${resetUrl}`);
    console.log("=======================================================\n");
    return { success: true };
  }

  async sendPasswordResetOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL OTP DISPATCH] Password Reset Code to: ${to}`);
    console.log(`[PASSWORD RESET 6-DIGIT OTP CODE]: ${code}`);
    console.log("=======================================================\n");
    return { success: true };
  }

  async sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL OTP DISPATCH] Passwordless Code to: ${to}`);
    console.log(`[SECURITY 6-DIGIT OTP CODE]: ${code}`);
    console.log("=======================================================\n");
    return { success: true };
  }

  async sendStudentQueryNotifications(data: StudentQueryData): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL CONTACT DISPATCH] Student Query: ${data.referenceId}`);
    console.log(`From: ${data.name} (${data.email})`);
    console.log(`Subject: ${data.subject}`);
    console.log("=======================================================\n");
    return { success: true };
  }

  async sendInstitutionalQueryNotifications(data: InstitutionalQueryData): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL CONTACT DISPATCH] Institutional Query: ${data.referenceId}`);
    console.log(`Institution: ${data.institutionName} (${data.representativeName})`);
    console.log(`Objective: ${data.partnershipObjective}`);
    console.log("=======================================================\n");
    return { success: true };
  }
}

let emailServiceInstance: IEmailService | null = null;

export function getEmailService(): IEmailService {
  if (!emailServiceInstance) {
    if (process.env.RESEND_API_KEY) {
      emailServiceInstance = new ResendEmailService();
    } else {
      emailServiceInstance = new ConsoleEmailService();
    }
  }
  return emailServiceInstance;
}

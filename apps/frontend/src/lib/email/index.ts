export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendVerificationEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendPasswordResetEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendPasswordResetOtpEmail(to: string, code: string): Promise<{ success: boolean }>;
  sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }>;
}

/**
 * Stub / Console Logger implementation for local development and testing.
 * Can be swapped for Resend / SES / SendGrid implementation via environment flag.
 */
export class ConsoleEmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL STUB] To: ${options.to}`);
    console.log(`[EMAIL STUB] Subject: ${options.subject}`);
    console.log(`[EMAIL STUB] Content Preview: ${options.text || options.html.slice(0, 150)}...`);
    console.log("=======================================================\n");
    return { success: true, messageId: `stub_${Date.now()}` };
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://www.alderwoodvantage.com"
  ): Promise<{ success: boolean }> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Verification Email to: ${to}`);
    console.log(`[VERIFICATION URL]: ${verifyUrl}`);
    console.log(`[VERIFICATION TOKEN]: ${token}`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Verify your Alderwood Vantage account",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to Alderwood Vantage!</h2>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${verifyUrl}" style="background-color: #A9B4E8; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a></p>
          <p>Or copy this link: ${verifyUrl}</p>
        </div>
      `,
      text: `Welcome to Alderwood Vantage! Verify your email at: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    token: string,
    baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || "https://www.alderwoodvantage.com"
  ): Promise<{ success: boolean }> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Password Reset Email to: ${to}`);
    console.log(`[RESET URL]: ${resetUrl}`);
    console.log(`[RESET TOKEN]: ${token}`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Reset your Alderwood Vantage password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Alderwood Vantage Password Reset</h2>
          <p>You requested a password reset. Click below to choose a new password:</p>
          <p><a href="${resetUrl}" style="background-color: #A9B4E8; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a></p>
          <p>Or copy this link: ${resetUrl}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your Alderwood Vantage password at: ${resetUrl}`,
    });
  }

  async sendPasswordResetOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL OTP DISPATCH] Password Reset Code to: ${to}`);
    console.log(`[PASSWORD RESET 6-DIGIT OTP CODE]: ${code}`);
    console.log(`[VALIDITY]: 10 Minutes (Single-Use)`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Your Alderwood Vantage Password Reset Code",
      html: `
        <div style="font-family: sans-serif; padding: 24px; max-width: 520px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 16px;">
          <h2 style="color: #0F172A; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px;">Use the 6-digit verification code below to reset your Alderwood Vantage account password. This code expires in 10 minutes.</p>
          <div style="background: #F1F5F9; border: 1px solid #CBD5E1; padding: 16px; text-align: center; border-radius: 12px; margin: 24px 0;">
            <span style="letter-spacing: 6px; font-size: 32px; font-weight: 800; color: #0F172A; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #64748B; font-size: 12px; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
        </div>
      `,
      text: `Your Alderwood Vantage password reset code is: ${code}. It expires in 10 minutes.`,
    });
  }

  async sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[EMAIL OTP DISPATCH] Passwordless Code to: ${to}`);
    console.log(`[SECURITY 6-DIGIT OTP CODE]: ${code}`);
    console.log(`[VALIDITY]: 10 Minutes (Single-Use)`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Your Alderwood Vantage Security Sign-in Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Alderwood Vantage One-Time Sign In Code</h2>
          <p>Your one-time security code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; background: #EEF1FB; padding: 12px; display: inline-block; border-radius: 8px;">${code}</h1>
          <p>This code expires in 10 minutes and can only be used once.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your Alderwood Vantage security sign-in code is: ${code}. Valid for 10 minutes.`,
    });
  }
}

let emailServiceInstance: IEmailService | null = null;

export function getEmailService(): IEmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new ConsoleEmailService();
  }
  return emailServiceInstance;
}

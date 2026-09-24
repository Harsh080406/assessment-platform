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

  async sendVerificationEmail(to: string, token: string, baseUrl = "http://localhost:3000"): Promise<{ success: boolean }> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Verification Email to: ${to}`);
    console.log(`[VERIFICATION URL]: ${verifyUrl}`);
    console.log(`[VERIFICATION TOKEN]: ${token}`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Verify your AuraPath account",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Welcome to AuraPath!</h2>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${verifyUrl}" style="background-color: #A9B4E8; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a></p>
          <p>Or copy this link: ${verifyUrl}</p>
        </div>
      `,
      text: `Welcome to AuraPath! Verify your email at: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string, baseUrl = "http://localhost:3000"): Promise<{ success: boolean }> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[EMAIL DISPATCH] Password Reset Email to: ${to}`);
    console.log(`[RESET URL]: ${resetUrl}`);
    console.log(`[RESET TOKEN]: ${token}`);
    console.log("=======================================================\n");

    return this.sendEmail({
      to,
      subject: "Reset your AuraPath password",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>AuraPath Password Reset</h2>
          <p>You requested a password reset. Click below to choose a new password:</p>
          <p><a href="${resetUrl}" style="background-color: #A9B4E8; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a></p>
          <p>Or copy this link: ${resetUrl}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      text: `Reset your AuraPath password at: ${resetUrl}`,
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
      subject: "Your AuraPath Security Sign-in Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>AuraPath One-Time Sign In Code</h2>
          <p>Your one-time security code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; background: #EEF1FB; padding: 12px; display: inline-block; border-radius: 8px;">${code}</h1>
          <p>This code expires in 10 minutes and can only be used once.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your AuraPath security sign-in code is: ${code}. Valid for 10 minutes.`,
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

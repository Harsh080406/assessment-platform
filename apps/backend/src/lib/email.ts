export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string }>;
  sendVerificationEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendPasswordResetEmail(to: string, token: string, baseUrl?: string): Promise<{ success: boolean }>;
  sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }>;
}

export class ConsoleEmailService implements IEmailService {
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[BACKEND EMAIL STUB] To: ${options.to}`);
    console.log(`[BACKEND EMAIL STUB] Subject: ${options.subject}`);
    console.log(`[BACKEND EMAIL STUB] Content: ${options.text || options.html.slice(0, 150)}...`);
    console.log("=======================================================\n");
    return { success: true, messageId: `backend_email_${Date.now()}` };
  }

  async sendVerificationEmail(to: string, token: string, baseUrl = "http://localhost:3000"): Promise<{ success: boolean }> {
    const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[BACKEND EMAIL DISPATCH] Verification Email to: ${to}`);
    console.log(`[VERIFICATION URL]: ${verifyUrl}`);
    console.log(`[TOKEN]: ${token}`);
    console.log("=======================================================\n");
    return this.sendEmail({
      to,
      subject: "Verify your AuraPath account",
      html: `<p>Verify your email at <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      text: `Verify your email: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string, baseUrl = "http://localhost:3000"): Promise<{ success: boolean }> {
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;
    console.log("\n=======================================================");
    console.log(`[BACKEND EMAIL DISPATCH] Password Reset Email to: ${to}`);
    console.log(`[RESET URL]: ${resetUrl}`);
    console.log(`[TOKEN]: ${token}`);
    console.log("=======================================================\n");
    return this.sendEmail({
      to,
      subject: "Reset your AuraPath password",
      html: `<p>Reset your password at <a href="${resetUrl}">${resetUrl}</a></p>`,
      text: `Reset your password: ${resetUrl}`,
    });
  }

  async sendLoginOtpEmail(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[BACKEND EMAIL OTP DISPATCH] Passwordless Code to: ${to}`);
    console.log(`[SECURITY 6-DIGIT OTP CODE]: ${code}`);
    console.log(`[VALIDITY]: 10 Minutes`);
    console.log("=======================================================\n");
    return this.sendEmail({
      to,
      subject: "Your AuraPath Login Code",
      html: `<h2>Your Security Code: ${code}</h2>`,
      text: `Your security code is: ${code}`,
    });
  }
}

let emailInstance: IEmailService | null = null;
export function getEmailService(): IEmailService {
  if (!emailInstance) emailInstance = new ConsoleEmailService();
  return emailInstance;
}

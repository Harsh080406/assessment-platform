export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface ISmsService {
  sendSms(options: SendSmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendOtp(to: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

/**
 * Console Logger / Stub SMS Service for development.
 * Pluggable architecture allows swapping for Twilio / MSG91 / AWS SNS in production.
 */
export class ConsoleSmsService implements ISmsService {
  async sendSms({ to, message }: SendSmsOptions): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[SMS STUB DISPATCH] To: ${to}`);
    console.log(`[MESSAGE CONTENT]: ${message}`);
    console.log("=======================================================\n");
    return { success: true, messageId: `sms_stub_${Date.now()}` };
  }

  async sendOtp(to: string, code: string): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[SMS OTP DISPATCH] Phone Number: ${to}`);
    console.log(`[SECURITY 6-DIGIT OTP CODE]: ${code}`);
    console.log(`[VALIDITY]: 10 Minutes (Single-Use)`);
    console.log("=======================================================\n");

    return this.sendSms({
      to,
      message: `Your AuraPath security verification code is: ${code}. It expires in 10 minutes. Do not share this with anyone.`,
    });
  }
}

let smsServiceInstance: ISmsService | null = null;

export function getSmsService(): ISmsService {
  if (!smsServiceInstance) {
    // In future phases: if (process.env.TWILIO_ACCOUNT_SID) return new TwilioSmsService()
    smsServiceInstance = new ConsoleSmsService();
  }
  return smsServiceInstance;
}

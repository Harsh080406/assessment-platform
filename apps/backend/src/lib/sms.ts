export interface SendSmsOptions {
  to: string;
  message: string;
}

export interface ISmsService {
  sendSms(options: SendSmsOptions): Promise<{ success: boolean; messageId?: string }>;
  sendOtp(to: string, code: string): Promise<{ success: boolean }>;
}

export class ConsoleSmsService implements ISmsService {
  async sendSms({ to, message }: SendSmsOptions): Promise<{ success: boolean; messageId: string }> {
    console.log("\n=======================================================");
    console.log(`[BACKEND SMS STUB] To: ${to}`);
    console.log(`[MESSAGE]: ${message}`);
    console.log("=======================================================\n");
    return { success: true, messageId: `backend_sms_${Date.now()}` };
  }

  async sendOtp(to: string, code: string): Promise<{ success: boolean }> {
    console.log("\n=======================================================");
    console.log(`[BACKEND SMS OTP] To: ${to}`);
    console.log(`[SECURITY 6-DIGIT OTP CODE]: ${code}`);
    console.log(`[VALIDITY]: 10 Minutes`);
    console.log("=======================================================\n");
    return this.sendSms({
      to,
      message: `Your AuraPath security code is: ${code}. Valid for 10 minutes.`,
    });
  }
}

let smsInstance: ISmsService | null = null;
export function getSmsService(): ISmsService {
  if (!smsInstance) smsInstance = new ConsoleSmsService();
  return smsInstance;
}

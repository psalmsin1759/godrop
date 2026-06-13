import axios from "axios";
import { SmsProvider } from "./smsProvider";

// Termii Messaging API — https://developer.termii.com/messaging-api
export class TermiiSmsProvider implements SmsProvider {
  async sendSms(to: string, message: string): Promise<void> {
    const apiKey = process.env.TERMII_API_KEY;
    if (!apiKey) throw new Error("TERMII_API_KEY is not set");

    const baseUrl = process.env.TERMII_BASE_URL ?? "https://v3.api.termii.com";

    try {
      await axios.post(`${baseUrl}/api/sms/send`, {
        to: to.replace(/^\+/, ""),
        from: process.env.TERMII_SENDER_ID || "Godrop",
        sms: message,
        type: "plain",
        channel: "dnd",
        api_key: apiKey,
      });
      console.log(`[sms:termii] Sent → ${to}`);
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message;
      console.error("[sms:termii] Send failed:", detail);
      throw err;
    }
  }
}

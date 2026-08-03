import axios from "axios";
import { SmsProvider } from "./smsProvider";

export interface TermiiSenderId {
  sender_id: string;
  status: string;
  country: string;
  createdAt: string;
}

// Termii Messaging API — https://developer.termii.com/messaging-api
export class TermiiSmsProvider implements SmsProvider {
  // Uses the Generic Send API (https://developer.termii.com/messaging-api#send-message),
  // which sends from a registered, approved sender ID (TERMII_SENDER_ID).
  async sendSms(to: string, message: string): Promise<void> {
    const apiKey = process.env.TERMII_API_KEY;
    if (!apiKey) throw new Error("TERMII_API_KEY is not set");

    const senderId = process.env.TERMII_SENDER_ID;
    if (!senderId) throw new Error("TERMII_SENDER_ID is not set");

    const baseUrl = process.env.TERMII_BASE_URL ?? "https://v3.api.termii.com";

    try {
      await axios.post(`${baseUrl}/api/sms/send`, {
        to: to.replace(/^\+/, ""),
        from: senderId,
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      });
      console.log(`[sms:termii] Sent → ${to}`);
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message;
      console.error("[sms:termii] Send failed:", detail);
      throw err;
    }
  }

  async getSenderIds(): Promise<TermiiSenderId[]> {
    const apiKey = process.env.TERMII_API_KEY;
    if (!apiKey) throw new Error("TERMII_API_KEY is not set");

    const baseUrl = process.env.TERMII_BASE_URL ?? "https://v3.api.termii.com";

    try {
      const { data } = await axios.get(`${baseUrl}/api/sender-id`, {
        params: { api_key: apiKey },
      });
      return data.content ?? [];
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message;
      console.error("[sms:termii] Fetch sender IDs failed:", detail);
      throw err;
    }
  }

  async requestSenderId(senderId: string, useCase: string, company: string): Promise<string> {
    const apiKey = process.env.TERMII_API_KEY;
    if (!apiKey) throw new Error("TERMII_API_KEY is not set");

    const baseUrl = process.env.TERMII_BASE_URL ?? "https://v3.api.termii.com";

    try {
      const { data } = await axios.post(`${baseUrl}/api/sender-id/request`, {
        api_key: apiKey,
        sender_id: senderId,
        use_case: useCase,
        company,
      });
      return data.message;
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.message;
      console.error("[sms:termii] Request sender ID failed:", detail);
      throw err;
    }
  }
}

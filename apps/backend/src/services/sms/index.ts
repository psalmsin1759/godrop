import { SmsProvider } from "./smsProvider";
import { TermiiSmsProvider, TermiiSenderId } from "./termiiSmsProvider";

const providers: Record<string, () => SmsProvider> = {
  termii: () => new TermiiSmsProvider(),
};

let cachedProvider: SmsProvider | undefined;

export function getSmsProvider(): SmsProvider {
  if (!cachedProvider) {
    const name = (process.env.SMS_PROVIDER ?? "termii").trim().toLowerCase();
    const factory = providers[name];
    if (!factory) throw new Error(`Unknown SMS_PROVIDER: ${name}`);
    cachedProvider = factory();
  }
  return cachedProvider;
}

export async function sendSms(to: string, message: string): Promise<void> {
  return getSmsProvider().sendSms(to, message);
}

// Termii-specific lookup, used by the System Admin SMS settings page
// regardless of which provider is currently active.
export async function getTermiiSenderIds(): Promise<TermiiSenderId[]> {
  return new TermiiSmsProvider().getSenderIds();
}

export type { SmsProvider } from "./smsProvider";
export type { TermiiSenderId } from "./termiiSmsProvider";

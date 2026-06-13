import { SmsProvider } from "./smsProvider";
import { TermiiSmsProvider } from "./termiiSmsProvider";

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

export type { SmsProvider } from "./smsProvider";

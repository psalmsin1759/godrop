import axios, { AxiosInstance } from "axios";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

let client: AxiosInstance | null = null;

export function api(): AxiosInstance {
  if (client) return client;

  const baseURL = required("BACKEND_API_URL");
  const token = required("CUSTOMER_JWT");

  client = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${token}` },
  });

  return client;
}

export function toolError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.error || err.message || err.cause?.message || err.code || "unknown error";
    return `Backend request failed (${err.response?.status ?? "network error"}): ${message}`;
  }
  return err instanceof Error ? err.message : String(err);
}

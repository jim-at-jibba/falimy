import * as SecureStore from "expo-secure-store";
import PocketBase from "pocketbase";

import { getServerUrl } from "../utils/config";

const AUTH_KEY = "falimy.auth";

let client: PocketBase | null = null;
let clientUrl: string | null = null;

const normalizeServerUrl = (url: string): string => url.trim().replace(/\/+$/, "");

const loadAuth = async (pb: PocketBase): Promise<void> => {
  const raw = await SecureStore.getItemAsync(AUTH_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as { token: string; model: Record<string, unknown> | null };
    pb.authStore.save(parsed.token, parsed.model);
  } catch {
    await SecureStore.deleteItemAsync(AUTH_KEY);
  }
};

const bindAuthPersistence = (pb: PocketBase): void => {
  pb.authStore.onChange(async (token, model) => {
    if (token) {
      await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify({ token, model }));
    } else {
      await SecureStore.deleteItemAsync(AUTH_KEY);
    }
  }, true);
};

export const resetPocketBase = (): void => {
  client = null;
  clientUrl = null;
};

export const getPocketBase = async (): Promise<PocketBase | null> => {
  const url = await getServerUrl();
  if (!url) return null;

  if (client && clientUrl === url) return client;

  const pb = new PocketBase(url);
  pb.autoCancellation(false);
  bindAuthPersistence(pb);
  await loadAuth(pb);

  client = pb;
  clientUrl = url;
  return pb;
};

export const validateServerUrl = async (url: string): Promise<string> => {
  const normalized = normalizeServerUrl(url);
  const response = await fetch(`${normalized}/api/health`);

  if (!response.ok) {
    throw new Error("Unable to reach PocketBase server.");
  }

  return normalized;
};

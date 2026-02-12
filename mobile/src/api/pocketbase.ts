import * as SecureStore from "expo-secure-store";
import PocketBase, { AsyncAuthStore } from "pocketbase";

import { getServerUrl } from "../utils/config";

const AUTH_KEY = "falimy.auth";

let client: PocketBase | null = null;
let clientUrl: string | null = null;

const normalizeServerUrl = (url: string): string => url.trim().replace(/\/+$/, "");

/**
 * Creates an AsyncAuthStore backed by expo-secure-store.
 *
 * PocketBase's AsyncAuthStore handles the async hydration lifecycle
 * internally — it accepts an `initial` promise for loading persisted
 * auth on startup and a `save` callback for persisting changes.
 * This eliminates the race window between client creation and auth
 * restoration that the manual approach had.
 */
const createAuthStore = (): AsyncAuthStore =>
  new AsyncAuthStore({
    save: async (serialized: string) => {
      await SecureStore.setItemAsync(AUTH_KEY, serialized);
    },
    initial: SecureStore.getItemAsync(AUTH_KEY),
    clear: async () => {
      await SecureStore.deleteItemAsync(AUTH_KEY);
    },
  });

export const resetPocketBase = (): void => {
  client = null;
  clientUrl = null;
};

export const getPocketBase = async (): Promise<PocketBase | null> => {
  const url = await getServerUrl();
  if (!url) return null;

  if (client && clientUrl === url) return client;

  const store = createAuthStore();
  const pb = new PocketBase(url, store);
  pb.autoCancellation(false);

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

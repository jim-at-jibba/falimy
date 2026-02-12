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
 * We pre-load the persisted auth data and pass the resolved string
 * (not a promise) as `initial`. This ensures the auth state is
 * hydrated synchronously during construction, avoiding a race where
 * `isValid`/`record` would return empty before the promise resolved.
 *
 * The `save` and `clear` callbacks handle ongoing persistence.
 */
const createAuthStore = (initialData: string | null): AsyncAuthStore =>
  new AsyncAuthStore({
    save: async (serialized: string) => {
      await SecureStore.setItemAsync(AUTH_KEY, serialized);
    },
    initial: initialData ?? "",
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

  // Pre-load persisted auth before creating the store so hydration
  // is synchronous and `authStore.isValid` is accurate immediately.
  const persistedAuth = await SecureStore.getItemAsync(AUTH_KEY);

  const store = createAuthStore(persistedAuth);
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

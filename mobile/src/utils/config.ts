import * as SecureStore from "expo-secure-store";

const SERVER_URL_KEY = "falimy.serverUrl";
export const getServerUrl = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(SERVER_URL_KEY);
};

export const setServerUrl = async (url: string): Promise<void> => {
  await SecureStore.setItemAsync(SERVER_URL_KEY, url.trim());
};

export const clearServerUrl = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(SERVER_URL_KEY);
};

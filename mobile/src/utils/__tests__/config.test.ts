import { getServerUrl, setServerUrl, clearServerUrl } from "@/utils/config";
import * as SecureStore from "expo-secure-store";

describe("config", () => {
  const SERVER_URL_KEY = "falimy.serverUrl";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getServerUrl", () => {
    it("returns null when no URL is stored", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await getServerUrl();
      
      expect(result).toBeNull();
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(SERVER_URL_KEY);
    });

    it("returns the stored URL", async () => {
      const testUrl = "https://example.com";
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(testUrl);
      
      const result = await getServerUrl();
      
      expect(result).toBe(testUrl);
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith(SERVER_URL_KEY);
    });
  });

  describe("setServerUrl", () => {
    it("stores the URL", async () => {
      const testUrl = "https://example.com";
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      
      await setServerUrl(testUrl);
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SERVER_URL_KEY, testUrl);
    });

    it("trims whitespace from the URL", async () => {
      const testUrl = "  https://example.com  ";
      const trimmedUrl = "https://example.com";
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      
      await setServerUrl(testUrl);
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(SERVER_URL_KEY, trimmedUrl);
    });
  });

  describe("clearServerUrl", () => {
    it("removes the stored URL", async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
      
      await clearServerUrl();
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(SERVER_URL_KEY);
    });
  });

});

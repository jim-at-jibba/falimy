import { PocketBase, AsyncAuthStore } from "pocketbase";
import * as SecureStore from "expo-secure-store";
import { resetPocketBase, getPocketBase, validateServerUrl } from "../pocketbase";
import { getServerUrl } from "@/utils/config";

// Mock dependencies
jest.mock("pocketbase", () => {
  const mockPocketBase = jest.fn().mockImplementation(() => ({
    autoCancellation: jest.fn(),
  }));
  
  const mockAsyncAuthStore = jest.fn().mockImplementation((config) => {
    return {
      save: config.save,
      clear: config.clear,
      initial: config.initial,
    };
  });

  return {
    __esModule: true,
    default: mockPocketBase,
    PocketBase: mockPocketBase,
    AsyncAuthStore: mockAsyncAuthStore,
  };
});

jest.mock("@/utils/config", () => ({
  getServerUrl: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock global fetch
global.fetch = jest.fn();

describe("pocketbase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPocketBase();
  });

  afterEach(() => {
    resetPocketBase();
  });

  describe("resetPocketBase", () => {
    it("clears cached client", async () => {
      (getServerUrl as jest.Mock).mockResolvedValue("https://example.com");
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const client1 = await getPocketBase();
      expect(client1).not.toBeNull();

      resetPocketBase();

      const client2 = await getPocketBase();
      expect(client2).not.toBeNull();
      expect(client2).not.toBe(client1);
    });
  });

  describe("getPocketBase", () => {
    it("returns null when no server URL", async () => {
      (getServerUrl as jest.Mock).mockResolvedValue(null);

      const result = await getPocketBase();

      expect(result).toBeNull();
      expect(PocketBase).not.toHaveBeenCalled();
    });

    it("creates and returns a PocketBase instance", async () => {
      const testUrl = "https://example.com";
      (getServerUrl as jest.Mock).mockResolvedValue(testUrl);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await getPocketBase();

      expect(result).not.toBeNull();
      expect(PocketBase).toHaveBeenCalledWith(
        testUrl,
        expect.any(Object)
      );
      expect(result?.autoCancellation).toHaveBeenCalledWith(false);
    });

    it("returns cached instance on same URL", async () => {
      const testUrl = "https://example.com";
      (getServerUrl as jest.Mock).mockResolvedValue(testUrl);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const client1 = await getPocketBase();
      const client2 = await getPocketBase();

      expect(client1).toBe(client2);
      expect(PocketBase).toHaveBeenCalledTimes(1);
    });

    it("creates new instance when URL changes", async () => {
      const url1 = "https://example1.com";
      const url2 = "https://example2.com";
      (getServerUrl as jest.Mock)
        .mockResolvedValueOnce(url1)
        .mockResolvedValueOnce(url2);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const client1 = await getPocketBase();
      const client2 = await getPocketBase();

      expect(client1).not.toBe(client2);
      expect(PocketBase).toHaveBeenCalledTimes(2);
      expect(PocketBase).toHaveBeenNthCalledWith(1, url1, expect.any(Object));
      expect(PocketBase).toHaveBeenNthCalledWith(2, url2, expect.any(Object));
    });

    it("uses persisted auth data when available", async () => {
      const testUrl = "https://example.com";
      const authData = JSON.stringify({ token: "test-token" });
      (getServerUrl as jest.Mock).mockResolvedValue(testUrl);
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(authData);

      await getPocketBase();

      expect(PocketBase).toHaveBeenCalledWith(
        testUrl,
        expect.objectContaining({
          save: expect.any(Function),
          initial: authData,
          clear: expect.any(Function),
        })
      );
    });
  });

  describe("validateServerUrl", () => {
    it("normalizes URL (trim + strip trailing slashes)", async () => {
      const testCases = [
        { input: "  https://example.com  ", expected: "https://example.com" },
        { input: "https://example.com///", expected: "https://example.com" },
        { input: "  https://example.com///  ", expected: "https://example.com" },
        { input: "https://example.com/api/", expected: "https://example.com/api" },
      ];

      for (const { input, expected } of testCases) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
        });

        const result = await validateServerUrl(input);

        expect(result).toBe(expected);
        expect(global.fetch).toHaveBeenCalledWith(`${expected}/api/health`);
      }
    });

    it("throws on non-ok response", async () => {
      const testUrl = "https://example.com";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(validateServerUrl(testUrl)).rejects.toThrow(
        "Unable to reach PocketBase server."
      );
    });

    it("returns normalized URL on success", async () => {
      const testUrl = "https://example.com";
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await validateServerUrl(testUrl);

      expect(result).toBe(testUrl);
      expect(global.fetch).toHaveBeenCalledWith(`${testUrl}/api/health`);
    });

    it("throws on network failure", async () => {
      const testUrl = "https://example.com";
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(validateServerUrl(testUrl)).rejects.toThrow("Network error");
    });
  });
});

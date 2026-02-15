import { renderHook, act } from "@testing-library/react-native";
import { useSync } from "../useSync";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { sync } from "@/db/sync";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/DatabaseContext");
jest.mock("@/db/sync");
jest.mock("@/db", () => ({ database: {} }));
jest.mock("pocketbase", () => {
  return { __esModule: true, default: jest.fn(), AsyncAuthStore: jest.fn() };
});

describe("useSync", () => {
  const mockDatabase = {
    write: jest.fn((fn: any) => fn()),
  };

  const mockAuthState = {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    pb: null,
    logout: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDatabase as jest.Mock).mockReturnValue(mockDatabase);
    (useAuth as jest.Mock).mockReturnValue(mockAuthState);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should have initial state with isSyncing false, lastError null, lastSyncedAt null", () => {
    const { result } = renderHook(() => useSync());

    expect(result.current.isSyncing).toBe(false);
    expect(result.current.lastError).toBeNull();
    expect(result.current.lastSyncedAt).toBeNull();
  });

  it("should trigger sync on mount when authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: true,
    });

    (sync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSync());

    expect(result.current.isSyncing).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(sync).toHaveBeenCalled();
    expect(result.current.isSyncing).toBe(false);
  });

  it("should not trigger sync on mount when not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: false,
    });

    renderHook(() => useSync());

    expect(sync).not.toHaveBeenCalled();
  });

  it("should call sync function when triggerSync is called", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: true,
    });

    (sync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await Promise.resolve();
    });

    jest.clearAllMocks();

    await act(async () => {
      await result.current.triggerSync();
    });

    expect(sync).toHaveBeenCalled();
  });

  it("should capture sync error in lastError", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: true,
    });

    const testError = new Error("Sync failed");
    (sync as jest.Mock).mockRejectedValue(testError);

    const { result } = renderHook(() => useSync());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.lastError).toEqual(testError);
    expect(result.current.isSyncing).toBe(false);
  });

  it("should trigger periodic sync after 5 minute interval", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      isAuthenticated: true,
    });

    (sync as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useSync());

    // Wait for initial sync
    await act(async () => {
      await Promise.resolve();
    });

    jest.clearAllMocks();

    // Advance time by 5 minutes
    await act(async () => {
      jest.advanceTimersByTime(5 * 60 * 1000);
      await Promise.resolve();
    });

    expect(sync).toHaveBeenCalled();
  });
});

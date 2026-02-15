import { renderHook } from "@testing-library/react-native";
import { useGeofences } from "../useGeofences";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/DatabaseContext");
jest.mock("@/db/sync", () => ({
  sync: jest.fn(),
  upsertRecord: jest.fn().mockResolvedValue(undefined),
  deleteRecordByServerId: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/db", () => ({ database: {} }));
jest.mock("pocketbase", () => {
  return { __esModule: true, default: jest.fn(), AsyncAuthStore: jest.fn() };
});

describe("useGeofences", () => {
  const mockObservable = (data: any[] = []) => ({
    observe: () => ({
      subscribe: (handlers: any) => {
        handlers.next(data);
        return { unsubscribe: jest.fn() };
      },
    }),
  });

  const mockDatabase = {
    get: jest.fn(() => ({
      query: jest.fn(() => mockObservable()),
    })),
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
  });

  it("should have initial state with empty geofences", () => {
    const { result } = renderHook(() => useGeofences());

    expect(result.current.geofences).toEqual([]);
  });

  it("should throw when createGeofence is called without family_id", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: null, email: "test@example.com" },
      pb: { collection: jest.fn() },
    });

    const { result } = renderHook(() => useGeofences());

    await expect(
      result.current.createGeofence({
        name: "Home",
        lat: 40.7128,
        lng: -74.006,
        radius: 100,
      }),
    ).rejects.toThrow(/no family_id/i);
  });

  it("should throw when createGeofence is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useGeofences());

    await expect(
      result.current.createGeofence({
        name: "Home",
        lat: 40.7128,
        lng: -74.006,
        radius: 100,
      }),
    ).rejects.toThrow(/PocketBase not available/i);
  });

  it("should throw when deleteGeofence is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useGeofences());

    await expect(result.current.deleteGeofence("geofence1")).rejects.toThrow(
      /PocketBase not available/i,
    );
  });

  it("should successfully create a geofence", async () => {
    const mockPbRecord = {
      id: "geofence-server-123",
      family_id: "family1",
      name: "Home",
      lat: 40.7128,
      lng: -74.006,
      radius: 100,
      notify_user_id: "user1",
      watch_user_id: "",
      trigger_on: "both",
      enabled: true,
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ create: mockCreate })) },
    });

    const { result } = renderHook(() => useGeofences());

    const serverId = await result.current.createGeofence({
      name: "Home",
      lat: 40.7128,
      lng: -74.006,
      radius: 100,
    });

    expect(serverId).toBe("geofence-server-123");
    expect(mockCreate).toHaveBeenCalledWith({
      family_id: "family1",
      name: "Home",
      lat: 40.7128,
      lng: -74.006,
      radius: 100,
      notify_user_id: "user1",
      watch_user_id: "",
      trigger_on: "both",
      enabled: true,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });

  it("should successfully create a geofence with custom notify and watch users", async () => {
    const mockPbRecord = {
      id: "geofence-server-456",
      family_id: "family1",
      name: "Work",
      lat: 37.7749,
      lng: -122.4194,
      radius: 200,
      notify_user_id: "user2",
      watch_user_id: "user1",
      trigger_on: "entry",
      enabled: true,
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ create: mockCreate })) },
    });

    const { result } = renderHook(() => useGeofences());

    const serverId = await result.current.createGeofence({
      name: "Work",
      lat: 37.7749,
      lng: -122.4194,
      radius: 200,
      notifyUserId: "user2",
      watchUserId: "user1",
      triggerOn: "entry",
    });

    expect(serverId).toBe("geofence-server-456");
    expect(mockCreate).toHaveBeenCalledWith({
      family_id: "family1",
      name: "Work",
      lat: 37.7749,
      lng: -122.4194,
      radius: 200,
      notify_user_id: "user2",
      watch_user_id: "user1",
      trigger_on: "entry",
      enabled: true,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });

  it("should successfully update a geofence", async () => {
    const mockPbRecord = {
      id: "geofence1",
      name: "Updated Home",
      lat: 40.713,
      lng: -74.007,
      radius: 150,
      notify_user_id: "user2",
      watch_user_id: "user1",
      trigger_on: "exit",
      enabled: false,
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useGeofences());

    await result.current.updateGeofence("geofence1", {
      name: "Updated Home",
      lat: 40.713,
      lng: -74.007,
      radius: 150,
      notifyUserId: "user2",
      watchUserId: "user1",
      triggerOn: "exit",
      enabled: false,
    });

    expect(mockUpdate).toHaveBeenCalledWith("geofence1", {
      name: "Updated Home",
      lat: 40.713,
      lng: -74.007,
      radius: 150,
      notify_user_id: "user2",
      watch_user_id: "user1",
      trigger_on: "exit",
      enabled: false,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });

  it("should successfully update only geofence name and radius", async () => {
    const mockPbRecord = {
      id: "geofence1",
      name: "New Name",
      radius: 250,
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useGeofences());

    await result.current.updateGeofence("geofence1", {
      name: "New Name",
      radius: 250,
    });

    expect(mockUpdate).toHaveBeenCalledWith("geofence1", {
      name: "New Name",
      radius: 250,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });

  it("should successfully delete a geofence", async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ delete: mockDelete })) },
    });

    const { result } = renderHook(() => useGeofences());

    await result.current.deleteGeofence("geofence1");

    expect(mockDelete).toHaveBeenCalledWith("geofence1");
    expect(deleteRecordByServerId).toHaveBeenCalledWith(mockDatabase, "geofences", "geofence1");
  });

  it("should successfully toggle a geofence from enabled to disabled", async () => {
    const mockPbRecord = {
      id: "geofence1",
      enabled: false,
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useGeofences());

    await result.current.toggleGeofence("geofence1", true);

    expect(mockUpdate).toHaveBeenCalledWith("geofence1", {
      enabled: false,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });

  it("should successfully toggle a geofence from disabled to enabled", async () => {
    const mockPbRecord = {
      id: "geofence1",
      enabled: true,
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useGeofences());

    await result.current.toggleGeofence("geofence1", false);

    expect(mockUpdate).toHaveBeenCalledWith("geofence1", {
      enabled: true,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "geofences", mockPbRecord);
  });
});

import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import * as Battery from "expo-battery";
import { getPocketBase } from "@/api/pocketbase";
import PocketBase from "pocketbase";

import {
  LOCATION_TASK_NAME,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  isBackgroundLocationRunning,
  postCurrentLocation,
} from "../locationTask";

// Mock dependencies
jest.mock("expo-location", () => ({
  ...jest.requireActual("expo-location"),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

jest.mock("expo-task-manager", () => ({
  isTaskRegisteredAsync: jest.fn(),
  defineTask: jest.fn(),
}));

jest.mock("@/api/pocketbase", () => ({
  getPocketBase: jest.fn(),
}));

jest.mock("pocketbase", () => {
  return jest.fn().mockImplementation(() => ({
    collection: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    authStore: {
      isValid: true,
      token: "test-token",
      record: {
        id: "user-123",
      },
    },
  }));
});

jest.mock("expo-battery", () => ({
  getBatteryLevelAsync: jest.fn().mockResolvedValue(0.85),
}));

jest.mock("@/db", () => ({
  database: {},
}));

jest.mock("@/db/sync", () => ({
  upsertRecord: jest.fn().mockResolvedValue(undefined),
}));

describe("locationTask", () => {
  const mockLocation = {
    coords: {
      latitude: 40.7128,
      longitude: -74.006,
      altitude: 10,
      accuracy: 5,
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
  });

  describe("LOCATION_TASK_NAME constant", () => {
    it("has the correct value", () => {
      expect(LOCATION_TASK_NAME).toBe("falimy-background-location");
    });
  });

  describe("startBackgroundLocationTracking", () => {
    it("skips if already registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      await startBackgroundLocationTracking();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
      expect(Location.startLocationUpdatesAsync).not.toHaveBeenCalled();
    });

    it("calls Location.startLocationUpdatesAsync if not registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);
      (Location.startLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

      await startBackgroundLocationTracking();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
      expect(Location.startLocationUpdatesAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME,
        expect.any(Object)
      );
    });
  });

  describe("stopBackgroundLocationTracking", () => {
    it("calls Location.stopLocationUpdatesAsync if registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);
      (Location.stopLocationUpdatesAsync as jest.Mock).mockResolvedValue(undefined);

      await stopBackgroundLocationTracking();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
      expect(Location.stopLocationUpdatesAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
    });

    it("does nothing if not registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      await stopBackgroundLocationTracking();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
      expect(Location.stopLocationUpdatesAsync).not.toHaveBeenCalled();
    });
  });

  describe("isBackgroundLocationRunning", () => {
    it("delegates to TaskManager", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(true);

      const result = await isBackgroundLocationRunning();

      expect(TaskManager.isTaskRegisteredAsync).toHaveBeenCalledWith(
        LOCATION_TASK_NAME
      );
      expect(result).toBe(true);
    });

    it("returns false when task is not registered", async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockResolvedValue(false);

      const result = await isBackgroundLocationRunning();

      expect(result).toBe(false);
    });
  });

  describe("postCurrentLocation", () => {
    it("throws when not authenticated", async () => {
      const mockPb = {
        collection: jest.fn().mockReturnThis(),
        create: jest.fn(),
        update: jest.fn(),
        authStore: {
          isValid: false,
          token: "test-token",
          record: {
            id: "user-123",
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);

      await expect(postCurrentLocation()).rejects.toThrow("Not authenticated");
    });

    it("throws when PocketBase client is null", async () => {
      (getPocketBase as jest.Mock).mockResolvedValue(null);

      await expect(postCurrentLocation()).rejects.toThrow("Not authenticated");
    });

    it("posts location and updates user record", async () => {
      const mockPb = {
        collection: jest.fn().mockReturnThis(),
        create: jest.fn().mockResolvedValue({ id: "loc-123" }),
        update: jest.fn().mockResolvedValue({ id: "user-123" }),
        authStore: {
          isValid: true,
          token: "test-token",
          record: {
            id: "user-123",
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);

      await postCurrentLocation();

      expect(getPocketBase).toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      
      // Verify location was posted to location_history collection
      expect(mockPb.collection).toHaveBeenCalledWith("location_history");
      expect(mockPb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: mockLocation.coords.latitude,
          lng: mockLocation.coords.longitude,
          accuracy: mockLocation.coords.accuracy,
          user_id: "user-123",
        })
      );
    });

    it("posts location with correct timestamp", async () => {
      const mockPb = {
        collection: jest.fn().mockReturnThis(),
        create: jest.fn().mockResolvedValue({ id: "loc-123" }),
        update: jest.fn().mockResolvedValue({ id: "user-123" }),
        authStore: {
          isValid: true,
          token: "test-token",
          record: {
            id: "user-123",
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);

      await postCurrentLocation();

      const expectedTimestamp = new Date(mockLocation.timestamp).toISOString();
      expect(mockPb.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expectedTimestamp,
        })
      );
    });

    it("gets user ID from auth and updates user record", async () => {
      const mockPb = {
        collection: jest.fn().mockReturnThis(),
        create: jest.fn().mockResolvedValue({ id: "loc-123" }),
        update: jest.fn().mockResolvedValue({ id: "user-123" }),
        authStore: {
          isValid: true,
          token: "test-token",
          record: {
            id: "user-123",
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);

      await postCurrentLocation();

      const expectedTimestamp = new Date(mockLocation.timestamp).toISOString();
      expect(mockPb.collection).toHaveBeenCalledWith("users");
      expect(mockPb.update).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          last_lat: mockLocation.coords.latitude,
          last_lng: mockLocation.coords.longitude,
          last_location_at: expectedTimestamp,
        })
      );
    });

    it("throws when user ID is missing", async () => {
      const mockPb = {
        collection: jest.fn(),
        authStore: {
          isValid: true,
          token: "test-token",
          record: {
            // No id field
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);

      await expect(postCurrentLocation()).rejects.toThrow(/No user ID/i);
    });
  });

  describe("Background Task Callback", () => {
    let mockPb: any;
    let mockCollection: any;
    
    // Capture the callback from defineTask BEFORE clearAllMocks is called
    // defineTask was called at module load time
    const taskCallback = (TaskManager.defineTask as jest.Mock).mock.calls[0]?.[1];

    beforeEach(() => {
      // Don't clearAllMocks here as it would lose the defineTask call history
      // Instead, only reset the mocks we need to reset
      (getPocketBase as jest.Mock).mockClear();
      (Battery.getBatteryLevelAsync as jest.Mock).mockClear();
      
      // Reset Battery mock to default behavior
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.85);

      mockCollection = {
        create: jest.fn().mockResolvedValue({ id: "loc-123" }),
        update: jest.fn().mockResolvedValue({ id: "user-123" }),
      };

      mockPb = {
        collection: jest.fn().mockReturnValue(mockCollection),
        authStore: {
          isValid: true,
          token: "test-token",
          record: {
            id: "user-123",
          },
        },
      };
      (getPocketBase as jest.Mock).mockResolvedValue(mockPb);
    });

    it("handles error in callback", async () => {
      if (!taskCallback) {
        throw new Error("Task callback not captured - defineTask may not have been called");
      }
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      await taskCallback!({
        error: new Error("Task error"),
        data: {},
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[locationTask]",
        "Background task error",
        expect.objectContaining({
          component: "locationTask",
          error: "Task error",
        })
      );
      consoleWarnSpy.mockRestore();
    });

    it("returns early when no locations", async () => {
      await taskCallback!({
        error: null,
        data: { locations: [] },
      });

      expect(getPocketBase).not.toHaveBeenCalled();
    });

    it("returns early when locations is undefined", async () => {
      await taskCallback!({
        error: null,
        data: {},
      });

      expect(getPocketBase).not.toHaveBeenCalled();
    });

    it("skips posting when auth is invalid", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      (getPocketBase as jest.Mock).mockResolvedValue({
        authStore: { isValid: false },
      });

      await taskCallback!({
        error: null,
        data: {
          locations: [mockLocation],
        },
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[locationTask]",
        "No valid PB auth, skipping location post",
        expect.objectContaining({
          component: "locationTask",
        })
      );
      expect(mockCollection.create).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("posts location with battery level", async () => {
      const mockBatteryLevel = 0.85;
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(
        mockBatteryLevel
      );

      await taskCallback!({
        error: null,
        data: {
          locations: [mockLocation],
        },
      });

      expect(mockPb.collection).toHaveBeenCalledWith("location_history");
      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          battery_level: 85, // 0.85 * 100 rounded
        })
      );
    });

    it.skip("posts location with null battery when battery API fails", async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockRejectedValue(
        new Error("Battery API unavailable")
      );

      await taskCallback!({
        error: null,
        data: {
          locations: [mockLocation],
        },
      });

      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          battery_level: null,
        })
      );
    });

    it.skip("uses most recent location when multiple provided", async () => {
      const olderLocation = {
        coords: { latitude: 40.0, longitude: -74.0, accuracy: 20 },
        timestamp: Date.now() - 10000,
      };
      const newerLocation = {
        coords: { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
        timestamp: Date.now(),
      };

      await taskCallback!({
        error: null,
        data: {
          locations: [olderLocation, newerLocation],
        },
      });

      expect(mockCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lat: 40.7128,
          lng: -74.006,
        })
      );
    });

    it.skip("handles exceptions gracefully", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      (getPocketBase as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await taskCallback!({
        error: null,
        data: {
          locations: [mockLocation],
        },
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[LocationTask] Failed to post location:",
        expect.any(Error)
      );
      consoleWarnSpy.mockRestore();
    });
  });
});

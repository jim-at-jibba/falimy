import { RealtimeManager } from "../realtime";
import { upsertRecord, deleteRecordByServerId } from "@/db/sync";
import PocketBase from "pocketbase";
import { Collections } from "@/types/pocketbase-types";
import type { Database } from "@nozbe/watermelondb";

// Mock dependencies
jest.mock("@/db/sync", () => ({
  upsertRecord: jest.fn(),
  deleteRecordByServerId: jest.fn(),
}));

jest.mock("pocketbase", () => {
  return jest.fn().mockImplementation(() => ({
    collection: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  }));
});

describe("RealtimeManager", () => {
  let mockPb: any;
  let mockDatabase: jest.Mocked<Database>;
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockDatabase = {} as jest.Mocked<Database>;
    mockPb = new (PocketBase as any)();
    
    // Mock the collection().subscribe() chain
    mockPb.collection.mockReturnThis();
    mockPb.subscribe.mockResolvedValue(mockUnsubscribe);
  });

  describe("constructor", () => {
    it("sets pb and database", () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      expect((manager as any).pb).toBe(mockPb);
      expect((manager as any).database).toBe(mockDatabase);
    });
  });

  describe("subscribed getter", () => {
    it("is false initially", () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      expect(manager.subscribed).toBe(false);
    });

    it("returns true after successful subscription", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await manager.subscribe();

      expect(manager.subscribed).toBe(true);
    });
  });

  describe("subscribe", () => {
    it("subscribes to all 6 collections", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await manager.subscribe();

      expect(mockPb.collection).toHaveBeenCalledTimes(6);
      
      const expectedCollections = [
        Collections.Lists,
        Collections.ListItems,
        Collections.Families,
        Collections.Users,
        Collections.LocationHistory,
        Collections.Geofences,
      ];

      expectedCollections.forEach((collection) => {
        expect(mockPb.collection).toHaveBeenCalledWith(collection);
      });

      expect(mockPb.subscribe).toHaveBeenCalledTimes(6);
    });

    it("is idempotent (calling twice doesn't double subscribe)", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await manager.subscribe();
      await manager.subscribe();

      expect(mockPb.collection).toHaveBeenCalledTimes(6);
      expect(mockPb.subscribe).toHaveBeenCalledTimes(6);
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });

    it("handles subscription errors gracefully", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);
      
      // Make first collection subscription fail
      mockPb.subscribe.mockRejectedValueOnce(new Error("Subscribe failed"));

      await manager.subscribe();

      // Should still try to subscribe to other collections
      expect(mockPb.collection).toHaveBeenCalled();
      expect(mockPb.subscribe).toHaveBeenCalledTimes(6);
    });
  });

  describe("unsubscribe", () => {
    it("calls all unsub functions and resets state", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await manager.subscribe();
      expect(manager.subscribed).toBe(true);

      await manager.unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalledTimes(6);
      expect(manager.subscribed).toBe(false);
      expect((manager as any).unsubscribeFns).toEqual([]);
    });

    it("handles unsubscribe errors gracefully", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await manager.subscribe();

      // Make one unsubscribe fail
      mockUnsubscribe.mockRejectedValueOnce(new Error("Unsubscribe failed"));

      await expect(manager.unsubscribe()).resolves.not.toThrow();

      expect(manager.subscribed).toBe(false);
    });

    it("does nothing when not subscribed", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);

      await expect(manager.unsubscribe()).resolves.not.toThrow();
      expect(mockUnsubscribe).not.toHaveBeenCalled();
    });
  });

  describe("subscribe callback", () => {
    it("calls upsertRecord on create events", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);
      const mockRecord = { id: "123", name: "Test Record" };

      let subscribeCallback: ((data: any) => Promise<void>) | null = null;
      mockPb.subscribe.mockImplementation((event: string, callback: (data: any) => Promise<void>) => {
        // Only capture the first callback (Lists collection -> "lists" table)
        if (!subscribeCallback) {
          subscribeCallback = callback;
        }
        return Promise.resolve(mockUnsubscribe);
      });

      await manager.subscribe();

      // Simulate create event
      if (subscribeCallback) {
        await subscribeCallback({
          action: "create",
          record: mockRecord,
        });
      }

      expect(upsertRecord).toHaveBeenCalledWith(
        mockDatabase,
        "lists",
        mockRecord
      );
    });

    it("calls upsertRecord on update events", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);
      const mockRecord = { id: "123", name: "Updated Record" };

      let subscribeCallback: ((data: any) => Promise<void>) | null = null;
      mockPb.subscribe.mockImplementation((event: string, callback: (data: any) => Promise<void>) => {
        // Only capture the third callback (Families collection -> "families" table)
        if (mockPb.collection.mock.calls.length === 3 && !subscribeCallback) {
          subscribeCallback = callback;
        }
        return Promise.resolve(mockUnsubscribe);
      });

      await manager.subscribe();

      // Simulate update event
      if (subscribeCallback) {
        await subscribeCallback({
          action: "update",
          record: mockRecord,
        });
      }

      expect(upsertRecord).toHaveBeenCalledWith(
        mockDatabase,
        "families",
        mockRecord
      );
    });

    it("calls deleteRecordByServerId on delete events", async () => {
      const manager = new RealtimeManager(mockPb, mockDatabase);
      const mockRecord = { id: "123" };

      let subscribeCallback: ((data: any) => Promise<void>) | null = null;
      mockPb.subscribe.mockImplementation((event: string, callback: (data: any) => Promise<void>) => {
        // Only capture the third callback (Families collection -> "families" table)
        if (mockPb.collection.mock.calls.length === 3 && !subscribeCallback) {
          subscribeCallback = callback;
        }
        return Promise.resolve(mockUnsubscribe);
      });

      await manager.subscribe();

      // Simulate delete event
      if (subscribeCallback) {
        await subscribeCallback({
          action: "delete",
          record: mockRecord,
        });
      }

      expect(deleteRecordByServerId).toHaveBeenCalledWith(
        mockDatabase,
        "families",
        "123"
      );
      expect(upsertRecord).not.toHaveBeenCalled();
    });

    it("handles callback errors gracefully", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
      const manager = new RealtimeManager(mockPb, mockDatabase);
      const mockRecord = { id: "123", name: "Test" };

      let subscribeCallback: ((data: any) => Promise<void>) | null = null;
      mockPb.subscribe.mockImplementation((event: string, callback: (data: any) => Promise<void>) => {
        if (!subscribeCallback) {
          subscribeCallback = callback;
        }
        return Promise.resolve(mockUnsubscribe);
      });

      (upsertRecord as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await manager.subscribe();

      if (subscribeCallback) {
        await subscribeCallback({
          action: "create",
          record: mockRecord,
        });
      }

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});

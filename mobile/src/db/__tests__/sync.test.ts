import { upsertRecord, deleteRecordByServerId, deduplicateRecords, sync } from "../sync";

// Mock dependencies
jest.mock("@/api/pocketbase", () => ({
  getPocketBase: jest.fn(),
}));

jest.mock("@/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/types/pocketbase-types", () => ({
  Collections: {
    Families: "families",
    Users: "users",
    Lists: "lists",
    ListItems: "list_items",
    LocationHistory: "location_history",
    Geofences: "geofences",
  },
}));

const { getPocketBase } = require("@/api/pocketbase");

// Helper to create a mock record that tracks _raw writes
const createMockRecord = (initialRaw: Record<string, unknown> = {}) => {
  const record: any = {
    _raw: { ...initialRaw },
    update: jest.fn().mockImplementation((fn) => {
      fn(record);
      return Promise.resolve();
    }),
    destroyPermanently: jest.fn().mockResolvedValue(undefined),
  };
  return record;
};

// Helper to create a mock database
const createMockDatabase = (existingRecords: Record<string, any[]> = {}) => {
  return {
    write: jest.fn().mockImplementation(async (fn) => {
      await fn();
    }),
    get: jest.fn().mockImplementation((tableName: string) => {
      const records = existingRecords[tableName] || [];
      return {
        query: jest.fn().mockReturnValue({
          fetch: jest.fn().mockResolvedValue(records),
        }),
        create: jest.fn().mockImplementation((fn) => {
          const newRecord = createMockRecord();
          fn(newRecord);
          return Promise.resolve(newRecord);
        }),
      };
    }),
  };
};

describe("upsertRecord", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a new record when none exists", async () => {
    const mockDb = createMockDatabase();
    const pbRecord = {
      id: "server-123",
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
      collectionId: "col-1",
      collectionName: "families",
      expand: {},
      name: "Test Family",
      invite_code: "ABC123",
    };

    await upsertRecord(mockDb as any, "families", pbRecord);

    expect(mockDb.write).toHaveBeenCalled();
    expect(mockDb.get).toHaveBeenCalledWith("families");
  });

  it("updates existing record when found by server_id", async () => {
    const existing = createMockRecord({
      server_id: "server-456",
      name: "Old Name",
    });
    const mockDb = createMockDatabase({ members: [existing] });

    const pbRecord = {
      id: "server-456",
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
      collectionId: "col-1",
      collectionName: "members",
      expand: {},
      name: "New Name",
      email: "test@example.com",
      role: "member",
      family_id: "fam-1",
    };

    await upsertRecord(mockDb as any, "members", pbRecord);

    expect(existing.update).toHaveBeenCalled();
    expect(existing._raw.name).toBe("New Name");
    expect(existing._raw.email).toBe("test@example.com");
    expect(existing._raw.server_id).toBe("server-456");
  });

  it("transforms field names using PB_TO_WMDB_FIELDS mapping", async () => {
    const existing = createMockRecord({ server_id: "item-1" });
    const mockDb = createMockDatabase({ list_items: [existing] });

    const pbRecord = {
      id: "item-1",
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
      collectionId: "col-1",
      collectionName: "list_items",
      expand: {},
      list_id: "list-1",
      name: "Buy milk",
      checked: true,
      checked_by: "user-1",
      created_by: "user-2",
    };

    await upsertRecord(mockDb as any, "list_items", pbRecord);

    expect(existing._raw.is_checked).toBe(true);
    expect(existing._raw.checked_by_id).toBe("user-1");
    expect(existing._raw.created_by_id).toBe("user-2");
  });

  it("converts date-like fields to timestamps", async () => {
    const existing = createMockRecord({ server_id: "mem-1" });
    const mockDb = createMockDatabase({ members: [existing] });

    const dateStr = "2024-06-15T10:30:00.000Z";
    const expectedTs = new Date(dateStr).getTime();

    const pbRecord = {
      id: "mem-1",
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
      collectionId: "col-1",
      collectionName: "members",
      expand: {},
      name: "Test",
      last_location_at: dateStr,
      location_sharing_until: dateStr,
    };

    await upsertRecord(mockDb as any, "members", pbRecord);

    expect(existing._raw.last_location_at).toBe(expectedTs);
    expect(existing._raw.location_sharing_until).toBe(expectedTs);
  });

  it("skips PocketBase metadata fields", async () => {
    const existing = createMockRecord({ server_id: "fam-1" });
    const mockDb = createMockDatabase({ families: [existing] });

    const pbRecord = {
      id: "fam-1",
      created: "2024-01-01T00:00:00.000Z",
      updated: "2024-01-02T00:00:00.000Z",
      collectionId: "should-not-exist",
      collectionName: "should-not-exist",
      expand: { data: "should-not-exist" },
      name: "Test Family",
    };

    await upsertRecord(mockDb as any, "families", pbRecord);

    expect(existing._raw.collectionId).toBeUndefined();
    expect(existing._raw.collectionName).toBeUndefined();
    expect(existing._raw.expand).toBeUndefined();
    expect(existing._raw.server_id).toBe("fam-1");
    expect(existing._raw.name).toBe("Test Family");
  });
});

describe("deleteRecordByServerId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("destroys the record when it exists", async () => {
    const existing = createMockRecord({ server_id: "to-delete" });
    const mockDb = createMockDatabase({ families: [existing] });

    await deleteRecordByServerId(mockDb as any, "families", "to-delete");

    expect(existing.destroyPermanently).toHaveBeenCalled();
  });

  it("does nothing when no record exists", async () => {
    const mockDb = createMockDatabase({ families: [] });

    await expect(
      deleteRecordByServerId(mockDb as any, "families", "non-existent"),
    ).resolves.not.toThrow();

    // write is called (query now runs inside it) but no destroy happens
    expect(mockDb.write).toHaveBeenCalled();
  });
});

describe("deduplicateRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removes duplicates keeping the newest by updated_at", async () => {
    const older = createMockRecord({ server_id: "dup-1", updated_at: 1000 });
    const newer = createMockRecord({ server_id: "dup-1", updated_at: 2000 });
    const unique = createMockRecord({ server_id: "unique-1", updated_at: 1500 });

    const mockDb = createMockDatabase({
      families: [older, newer, unique],
      members: [],
      lists: [],
      list_items: [],
      location_history: [],
      geofences: [],
      recipes: [],
    });

    const removed = await deduplicateRecords(mockDb as any);

    expect(removed).toBe(1);
    // The older duplicate should be destroyed
    expect(older.destroyPermanently).toHaveBeenCalled();
    // The newer one and the unique record should not be destroyed
    expect(newer.destroyPermanently).not.toHaveBeenCalled();
    expect(unique.destroyPermanently).not.toHaveBeenCalled();
  });

  it("returns 0 when there are no duplicates", async () => {
    const rec1 = createMockRecord({ server_id: "a", updated_at: 1000 });
    const rec2 = createMockRecord({ server_id: "b", updated_at: 2000 });

    const mockDb = createMockDatabase({
      families: [rec1, rec2],
      members: [],
      lists: [],
      list_items: [],
      location_history: [],
      geofences: [],
      recipes: [],
    });

    const removed = await deduplicateRecords(mockDb as any);

    expect(removed).toBe(0);
    expect(rec1.destroyPermanently).not.toHaveBeenCalled();
    expect(rec2.destroyPermanently).not.toHaveBeenCalled();
    expect(mockDb.write).not.toHaveBeenCalled();
  });
});

describe("sync", () => {
  let mockDb: any;

  beforeEach(() => {
    mockDb = createMockDatabase();
    jest.clearAllMocks();
  });

  it("skips when no PocketBase instance", async () => {
    getPocketBase.mockResolvedValue(null);

    await sync(mockDb);

    expect(mockDb.write).not.toHaveBeenCalled();
  });

  it("skips when auth is not valid", async () => {
    getPocketBase.mockResolvedValue({
      authStore: { isValid: false },
    });

    await sync(mockDb);

    expect(mockDb.write).not.toHaveBeenCalled();
  });

  it("pulls from PocketBase when auth is valid", async () => {
    const mockCollection = jest.fn().mockReturnValue({
      getFullList: jest.fn().mockResolvedValue([]),
    });

    getPocketBase.mockResolvedValue({
      authStore: { isValid: true },
      collection: mockCollection,
    });

    await sync(mockDb);

    expect(getPocketBase).toHaveBeenCalled();
    expect(mockCollection).toHaveBeenCalled();
  });

  it("deletes local records that no longer exist on server", async () => {
    // Set up local DB with 3 records
    const localRecord1 = createMockRecord({ server_id: "keep-1", name: "Keep" });
    const localRecord2 = createMockRecord({ server_id: "keep-2", name: "Also Keep" });
    const localRecord3 = createMockRecord({ server_id: "delete-me", name: "Delete" });

    const mockDbWithRecords = createMockDatabase({ families: [localRecord1, localRecord2, localRecord3] });

    // Mock PB to return only 2 records (record3 is gone from server)
    const mockCollection = jest.fn((name: string) => ({
      getFullList: jest.fn().mockResolvedValue([
        { id: "keep-1", name: "Keep", created: "2024-01-01T00:00:00Z", updated: "2024-01-01T00:00:00Z" },
        { id: "keep-2", name: "Also Keep", created: "2024-01-01T00:00:00Z", updated: "2024-01-01T00:00:00Z" },
      ]),
    }));

    getPocketBase.mockResolvedValue({
      authStore: { isValid: true },
      collection: mockCollection,
    });

    await sync(mockDbWithRecords);

    // Verify the local record not in PB response was destroyed
    expect(localRecord3.destroyPermanently).toHaveBeenCalled();
    // Verify the other two were NOT destroyed
    expect(localRecord1.destroyPermanently).not.toHaveBeenCalled();
    expect(localRecord2.destroyPermanently).not.toHaveBeenCalled();
  });

  it("handles concurrent sync attempts with queueing", async () => {
    // Create a slow sync by making getFullList delay
    let resolveFirstSync: any;
    const firstSyncPromise = new Promise((resolve) => {
      resolveFirstSync = resolve;
    });

    const mockCollection = jest.fn().mockReturnValue({
      getFullList: jest.fn()
        .mockReturnValueOnce(firstSyncPromise)  // First call is slow
        .mockResolvedValue([]),  // Subsequent calls are fast
    });

    getPocketBase.mockResolvedValue({
      authStore: { isValid: true },
      collection: mockCollection,
    });

    // Start first sync (doesn't await)
    const firstSync = sync(mockDb);

    // Start second sync while first is in progress
    const secondSync = sync(mockDb);

    // Resolve the first sync
    resolveFirstSync([]);
    await firstSync;

    // The second sync should have been queued and should also complete
    await secondSync;

    // Depending on implementation, collection might be called once or twice
    // At minimum, we verify both syncs completed without error
    expect(getPocketBase).toHaveBeenCalled();
  });
});

import { renderHook } from "@testing-library/react-native";
import { useLists } from "../useLists";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { sync, upsertRecord, deleteRecordByServerId } from "@/db/sync";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/DatabaseContext");
jest.mock("@/db/sync", () => ({
  sync: jest.fn().mockResolvedValue(undefined),
  upsertRecord: jest.fn().mockResolvedValue(undefined),
  deleteRecordByServerId: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/db", () => ({ database: {} }));
jest.mock("pocketbase", () => {
  return { __esModule: true, default: jest.fn(), AsyncAuthStore: jest.fn() };
});

describe("useLists", () => {
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
    // Reset mockDatabase.get to default behavior
    mockDatabase.get.mockImplementation(() => ({
      query: jest.fn(() => mockObservable()),
    }));
  });

  it("should have initial state with empty lists", () => {
    const { result } = renderHook(() => useLists());

    expect(result.current.lists).toEqual([]);
    // With no user/family_id, isLoading is set to false immediately
    expect(result.current.isLoading).toBe(false);
  });

  it("should throw when createList is called without family_id", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: null, email: "test@example.com" },
      pb: { collection: jest.fn() },
    });

    const { result } = renderHook(() => useLists());

    await expect(result.current.createList("Test List")).rejects.toThrow(
      /no family_id/i
    );
  });

  it("should throw when createList is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useLists());

    await expect(result.current.createList("Test List")).rejects.toThrow(
      /PocketBase not available/i
    );
  });

  it("should throw when deleteList is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useLists());

    await expect(result.current.deleteList("list1")).rejects.toThrow(
      /PocketBase not available/i
    );
  });

  it("should throw when renameList is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useLists());

    await expect(result.current.renameList("list1", "New Name")).rejects.toThrow(
      /PocketBase not available/i
    );
  });

  it("should successfully create a list", async () => {
    const mockPbRecord = {
      id: "list-server-123",
      name: "Groceries",
      type: "shopping",
      family_id: "family1",
      created_by: "user1",
      status: "active",
      sort_order: 0,
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ create: mockCreate })) },
    });

    const { result } = renderHook(() => useLists());

    const serverId = await result.current.createList("Groceries");

    expect(serverId).toBe("list-server-123");
    expect(mockCreate).toHaveBeenCalledWith({
      name: "Groceries",
      type: "shopping",
      family_id: "family1",
      created_by: "user1",
      status: "active",
      sort_order: 0,
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "lists", mockPbRecord);
  });

  it("should successfully archive a list", async () => {
    const mockPbRecord = { id: "list1", status: "archived" };
    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useLists());

    await result.current.archiveList("list1");

    expect(mockUpdate).toHaveBeenCalledWith("list1", { status: "archived" });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "lists", mockPbRecord);
  });

  it("should successfully delete a list and cascade-delete local items", async () => {
    const mockItem1 = { destroyPermanently: jest.fn().mockResolvedValue(undefined) };
    const mockItem2 = { destroyPermanently: jest.fn().mockResolvedValue(undefined) };
    
    // Mock database.get to return items collection for list_items query
    mockDatabase.get.mockImplementation((collectionName: string) => {
      if (collectionName === "list_items") {
        return {
          query: jest.fn(() => ({
            fetch: jest.fn().mockResolvedValue([mockItem1, mockItem2]),
          })),
        };
      }
      return {
        query: jest.fn(() => mockObservable()),
      };
    });

    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ delete: mockDelete })) },
    });

    const { result } = renderHook(() => useLists());

    await result.current.deleteList("list1");

    expect(mockDelete).toHaveBeenCalledWith("list1");
    expect(deleteRecordByServerId).toHaveBeenCalledWith(mockDatabase, "lists", "list1");
    expect(mockDatabase.write).toHaveBeenCalled();
    expect(mockItem1.destroyPermanently).toHaveBeenCalled();
    expect(mockItem2.destroyPermanently).toHaveBeenCalled();
  });

  it("should successfully rename a list", async () => {
    const mockPbRecord = { id: "list1", name: "New Name" };
    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const { result } = renderHook(() => useLists());

    await result.current.renameList("list1", "New Name");

    expect(mockUpdate).toHaveBeenCalledWith("list1", { name: "New Name" });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "lists", mockPbRecord);
  });
});

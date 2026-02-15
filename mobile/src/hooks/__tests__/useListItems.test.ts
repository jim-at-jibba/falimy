import { renderHook } from "@testing-library/react-native";
import { useListItems } from "../useListItems";
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

describe("useListItems", () => {
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

  it("should have initial state with empty items and isLoading true", () => {
    const { result } = renderHook(() => useListItems("list-server-1"));

    expect(result.current.uncheckedItems).toEqual([]);
    expect(result.current.checkedItems).toEqual([]);
    expect(result.current.list).toBeNull();
  });

  it("should throw when addItem is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: null,
    });

    const { result } = renderHook(() => useListItems("list-server-1"));

    await expect(
      result.current.addItem({ name: "Test Item" }),
    ).rejects.toThrow(/PocketBase not available/i);
  });

  it("should throw when toggleItem is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      pb: null,
    });

    const mockItem = { serverId: "item-1", isChecked: false } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await expect(result.current.toggleItem(mockItem)).rejects.toThrow(
      /PocketBase not available/i,
    );
  });

  it("should throw when deleteItem is called without PocketBase", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      pb: null,
    });

    const mockItem = { serverId: "item-1" } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await expect(result.current.deleteItem(mockItem)).rejects.toThrow(
      /PocketBase not available/i,
    );
  });

  it("should throw when addItem is called without listServerId", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      pb: { collection: jest.fn() },
    });

    const { result } = renderHook(() => useListItems(undefined));

    await expect(
      result.current.addItem({ name: "Test Item" }),
    ).rejects.toThrow(/No list ID/i);
  });

  it("should successfully add an item", async () => {
    const mockPbRecord = {
      id: "item-server-123",
      list_id: "list-server-1",
      name: "Milk",
      quantity: "2",
      note: "Buy organic",
      checked: false,
      sort_order: 0,
      created_by: "user1",
    };

    const mockCreate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ create: mockCreate })) },
    });

    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.addItem({ name: "Milk", quantity: "2", note: "Buy organic" });

    expect(mockCreate).toHaveBeenCalledWith({
      list_id: "list-server-1",
      name: "Milk",
      quantity: "2",
      note: "Buy organic",
      checked: false,
      sort_order: 0,
      created_by: "user1",
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "list_items", mockPbRecord);
  });

  it("should successfully toggle an item from unchecked to checked", async () => {
    const mockPbRecord = {
      id: "item-1",
      checked: true,
      checked_by: "user1",
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const mockItem = { serverId: "item-1", isChecked: false } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.toggleItem(mockItem);

    expect(mockUpdate).toHaveBeenCalledWith("item-1", {
      checked: true,
      checked_by: "user1",
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "list_items", mockPbRecord);
  });

  it("should successfully toggle an item from checked to unchecked", async () => {
    const mockPbRecord = {
      id: "item-1",
      checked: false,
      checked_by: "",
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const mockItem = { serverId: "item-1", isChecked: true } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.toggleItem(mockItem);

    expect(mockUpdate).toHaveBeenCalledWith("item-1", {
      checked: false,
      checked_by: "",
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "list_items", mockPbRecord);
  });

  it("should successfully delete an item", async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ delete: mockDelete })) },
    });

    const mockItem = { serverId: "item-1" } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.deleteItem(mockItem);

    expect(mockDelete).toHaveBeenCalledWith("item-1");
    expect(deleteRecordByServerId).toHaveBeenCalledWith(mockDatabase, "list_items", "item-1");
  });

  it("should successfully update an item", async () => {
    const mockPbRecord = {
      id: "item-1",
      name: "Updated Item",
      quantity: "3",
      note: "Updated note",
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const mockItem = { serverId: "item-1" } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.updateItem(mockItem, {
      name: "Updated Item",
      quantity: "3",
      note: "Updated note",
    });

    expect(mockUpdate).toHaveBeenCalledWith("item-1", {
      name: "Updated Item",
      quantity: "3",
      note: "Updated note",
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "list_items", mockPbRecord);
  });

  it("should successfully update only item name", async () => {
    const mockPbRecord = {
      id: "item-1",
      name: "New Name Only",
    };

    const mockUpdate = jest.fn().mockResolvedValue(mockPbRecord);
    (useAuth as jest.Mock).mockReturnValue({
      ...mockAuthState,
      user: { id: "user1", family_id: "family1", email: "test@example.com" },
      pb: { collection: jest.fn(() => ({ update: mockUpdate })) },
    });

    const mockItem = { serverId: "item-1" } as any;
    const { result } = renderHook(() => useListItems("list-server-1"));

    await result.current.updateItem(mockItem, { name: "New Name Only" });

    expect(mockUpdate).toHaveBeenCalledWith("item-1", {
      name: "New Name Only",
    });
    expect(upsertRecord).toHaveBeenCalledWith(mockDatabase, "list_items", mockPbRecord);
  });
});

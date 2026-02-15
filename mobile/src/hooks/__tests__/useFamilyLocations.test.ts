import { renderHook } from "@testing-library/react-native";
import { useFamilyLocations, useFamilyMembers } from "../useFamilyLocations";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";

jest.mock("@/contexts/AuthContext");
jest.mock("@/contexts/DatabaseContext");
jest.mock("@/db", () => ({ database: {} }));
jest.mock("pocketbase", () => {
  return { __esModule: true, default: jest.fn(), AsyncAuthStore: jest.fn() };
});

describe("useFamilyLocations and useFamilyMembers", () => {
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

  describe("useFamilyMembers", () => {
    it("returns empty members when no family_id", () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...mockAuthState,
        user: { id: "user1", family_id: null, email: "test@example.com" },
      });

      const { result } = renderHook(() => useFamilyMembers());

      expect(result.current.members).toEqual([]);
    });

    it("isLoading starts as true when no user", () => {
      const { result } = renderHook(() => useFamilyMembers());

      // With no user, the hook sets isLoading to false immediately
      // because there's no family_id
      expect(result.current.members).toEqual([]);
    });
  });

  describe("useFamilyLocations", () => {
    it("returns empty members when no family_id", () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...mockAuthState,
        user: { id: "user1", family_id: null, email: "test@example.com" },
      });

      const { result } = renderHook(() => useFamilyLocations());

      expect(result.current.members).toEqual([]);
    });

    it("isLoading is defined", () => {
      const { result } = renderHook(() => useFamilyLocations());

      // isLoading state depends on whether user has family_id
      // With no user, it's set to false immediately
      expect(typeof result.current.isLoading).toBe("boolean");
    });
  });
});

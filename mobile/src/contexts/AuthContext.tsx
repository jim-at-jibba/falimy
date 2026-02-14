import type PocketBase from "pocketbase";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPocketBase, resetPocketBase } from "@/api/pocketbase";
import type { UsersResponse } from "@/types/pocketbase-types";
import { clearServerUrl } from "@/utils/config";

type AuthUser = Pick<UsersResponse, "id" | "email" | "name" | "role" | "family_id">;

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  pb: PocketBase | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  pb: null,
  logout: async () => {},
  refresh: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [pb, setPb] = useState<PocketBase | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const extractUser = useCallback((client: PocketBase): AuthUser | null => {
    const model = client.authStore.record as UsersResponse | null;
    if (!client.authStore.isValid || !model) return null;
    return {
      id: model.id,
      email: model.email,
      name: model.name ?? "",
      role: model.role ?? "member",
      family_id: model.family_id ?? null,
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const client = await getPocketBase();
      if (!client) {
        setPb(null);
        setUser(null);
        return;
      }

      // Validate token with server - catches revoked tokens
      if (client.authStore.isValid) {
        try {
          await client.collection("users").authRefresh();
        } catch (err) {
          // Token invalid (401) or network error
          // For network errors, allow offline use with stale token
          const isNetworkError = String(err).includes("fetch") || String(err).includes("network");
          if (!isNetworkError) {
            client.authStore.clear();
            setPb(null);
            setUser(null);
            return;
          }
        }
      }

      setPb(client);
      setUser(extractUser(client));
    } catch {
      setPb(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [extractUser]);

  const logout = useCallback(async () => {
    if (pb) {
      pb.authStore.clear();
    }
    resetPocketBase();
    await clearServerUrl();
    setPb(null);
    setUser(null);
  }, [pb]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Listen for authStore changes (e.g. login/logout from other screens)
  // so the context stays in sync without needing explicit refresh() calls.
  useEffect(() => {
    if (!pb) return;

    const unsubscribe = pb.authStore.onChange(() => {
      setUser(extractUser(pb));
    });

    return () => unsubscribe();
  }, [pb, extractUser]);

  const value = useMemo(
    () => ({
      isAuthenticated: !!user,
      isLoading,
      user,
      pb,
      logout,
      refresh,
    }),
    [user, isLoading, pb, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  return useContext(AuthContext);
};

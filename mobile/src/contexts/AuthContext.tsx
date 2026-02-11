import type PocketBase from "pocketbase";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getPocketBase, resetPocketBase } from "@/api/pocketbase";
import { clearServerUrl } from "@/utils/config";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  family_id: string | null;
};

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
    const model = client.authStore.model as Record<string, unknown> | null;
    if (!client.authStore.isValid || !model) return null;
    return {
      id: model.id as string,
      email: model.email as string,
      name: (model.name as string) ?? "",
      role: (model.role as string) ?? "member",
      family_id: (model.family_id as string) ?? null,
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

  useEffect(() => {
    refresh();
  }, [refresh]);

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

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { sync } from "@/db/sync";

/** How often to auto-sync in the background (ms). */
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

type SyncState = {
  /** Whether a sync is currently in progress. */
  isSyncing: boolean;
  /** The last error from a sync attempt, if any. */
  lastError: Error | null;
  /** Timestamp of the last successful sync. */
  lastSyncedAt: number | null;
  /** Manually trigger a sync. */
  triggerSync: () => Promise<void>;
};

/**
 * Hook that manages pull-based sync from PocketBase into WatermelonDB.
 *
 * - Pulls on mount (if authenticated).
 * - Pulls when app comes to foreground.
 * - Pulls on a periodic interval.
 * - Exposes a manual trigger for pull-to-refresh.
 *
 * There is no push — mutations go to PB first via hooks, then upsert locally.
 */
export const useSync = (): SyncState => {
  const database = useDatabase();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const performSync = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsSyncing(true);
    setLastError(null);

    try {
      await sync(database);
      setLastSyncedAt(Date.now());
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      console.warn("[useSync] Sync failed:", err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [database, isAuthenticated]);

  const triggerSync = useCallback(async () => {
    await performSync();
  }, [performSync]);

  // Sync on mount once auth is ready
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      performSync();
    }
  }, [isLoading, isAuthenticated, performSync]);

  // Sync when app returns to foreground
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active" && isAuthenticated) {
        performSync();
      }
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [isAuthenticated, performSync]);

  // Periodic sync interval
  useEffect(() => {
    if (isAuthenticated) {
      intervalRef.current = setInterval(() => {
        performSync();
      }, SYNC_INTERVAL);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, performSync]);

  return {
    isSyncing,
    lastError,
    lastSyncedAt,
    triggerSync,
  };
};

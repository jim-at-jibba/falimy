import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import { deduplicateRecords, sync } from "@/db/sync";
import { logger } from "@/utils/logger";

/** Module-level flag so dedup runs at most once per app session. */
let hasRunDedup = false;

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
      // Run dedup once per app session before the first sync
      if (!hasRunDedup) {
        hasRunDedup = true;
        try {
          await deduplicateRecords(database);
        } catch (dedupError) {
          logger.warn("Dedup failed, continuing with sync", {
            component: "useSync",
            error: dedupError instanceof Error ? dedupError.message : String(dedupError),
          });
        }
      }

      await sync(database);
      setLastSyncedAt(Date.now());
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setLastError(err);
      logger.warn("Sync failed, will retry later", {
        component: "useSync",
        error: err instanceof Error ? err.message : String(err),
      });
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

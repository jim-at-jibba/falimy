import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { RealtimeManager } from "@/api/realtime";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";

/**
 * Hook that manages PocketBase SSE realtime subscriptions.
 *
 * When a realtime event is received, the RealtimeManager directly upserts
 * (or deletes) the record in WatermelonDB — no full sync trigger needed.
 *
 * Automatically subscribes when authenticated and unsubscribes on cleanup.
 * Re-subscribes when the app returns to the foreground.
 */
export const useRealtime = (): void => {
  const { isAuthenticated, pb } = useAuth();
  const database = useDatabase();
  const managerRef = useRef<RealtimeManager | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !pb) {
      // Clean up any existing subscription
      if (managerRef.current) {
        managerRef.current.unsubscribe();
        managerRef.current = null;
      }
      return;
    }

    const manager = new RealtimeManager(pb, database);
    managerRef.current = manager;

    manager.subscribe();

    // Re-subscribe when app comes to foreground (SSE connection may have dropped)
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && !manager.subscribed) {
        manager.subscribe();
      }
    };
    const subscription = AppState.addEventListener("change", handleAppState);

    return () => {
      subscription.remove();
      manager.unsubscribe();
      managerRef.current = null;
    };
  }, [isAuthenticated, pb, database]);
};

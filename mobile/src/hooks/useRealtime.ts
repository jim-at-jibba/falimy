import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { RealtimeManager } from "@/api/realtime";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook that manages PocketBase SSE realtime subscriptions.
 *
 * When a realtime event is received, calls `onEvent` which should
 * trigger a sync to pull the latest changes into WatermelonDB.
 *
 * Automatically subscribes when authenticated and unsubscribes on cleanup.
 * Re-subscribes when the app returns to the foreground.
 */
export const useRealtime = (onEvent: () => void): void => {
  const { isAuthenticated, pb } = useAuth();
  const managerRef = useRef<RealtimeManager | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced event handler — avoids triggering sync for every single SSE event
  // when a batch of changes arrives at once.
  const handleEvent = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onEvent();
    }, 500);
  }, [onEvent]);

  useEffect(() => {
    if (!isAuthenticated || !pb) {
      // Clean up any existing subscription
      if (managerRef.current) {
        managerRef.current.unsubscribe();
        managerRef.current = null;
      }
      return;
    }

    const manager = new RealtimeManager(pb, () => {
      handleEvent();
    });
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
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isAuthenticated, pb, handleEvent]);
};

import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeManager } from "@/api/realtime";
import { useAuth } from "@/contexts/AuthContext";

type RealtimeLogEntry = {
  id: number;
  timestamp: Date;
  collection: string;
  action: string;
  recordId: string;
};

/**
 * Debug hook for verifying PocketBase SSE realtime subscriptions.
 *
 * Subscribes to all collections and logs every event received.
 * Use this during development to confirm events are flowing correctly.
 *
 * Usage:
 *   const { logs, isConnected, clear } = useRealtimeDebug();
 */
export const useRealtimeDebug = () => {
  const { isAuthenticated, pb } = useAuth();
  const [logs, setLogs] = useState<RealtimeLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const managerRef = useRef<RealtimeManager | null>(null);
  const counterRef = useRef(0);

  const clear = useCallback(() => {
    setLogs([]);
    counterRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !pb) {
      setIsConnected(false);
      return;
    }

    const manager = new RealtimeManager(pb, (event, collection) => {
      counterRef.current += 1;
      const entry: RealtimeLogEntry = {
        id: counterRef.current,
        timestamp: new Date(),
        collection,
        action: event.action,
        recordId: (event.record as { id?: string })?.id ?? "unknown",
      };

      console.log(`[Realtime] ${entry.action} on ${entry.collection}: ${entry.recordId}`);

      setLogs((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    });

    managerRef.current = manager;
    manager.subscribe().then(() => {
      setIsConnected(true);
      console.log("[Realtime Debug] Subscribed to all collections");
    });

    return () => {
      manager.unsubscribe().then(() => {
        setIsConnected(false);
        console.log("[Realtime Debug] Unsubscribed from all collections");
      });
      managerRef.current = null;
    };
  }, [isAuthenticated, pb]);

  return { logs, isConnected, clear };
};

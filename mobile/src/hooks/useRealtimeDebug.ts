import { useCallback, useEffect, useRef, useState } from "react";
import type { UnsubscribeFunc } from "pocketbase";
import { useAuth } from "@/contexts/AuthContext";
import { Collections } from "@/types/pocketbase-types";

type RealtimeLogEntry = {
  id: number;
  timestamp: Date;
  collection: string;
  action: string;
  recordId: string;
};

/** Collections to watch in the debug logger. */
const DEBUG_COLLECTIONS = [
  Collections.Lists,
  Collections.ListItems,
  Collections.Families,
  Collections.Users,
  Collections.LocationHistory,
  Collections.Geofences,
];

/**
 * Debug hook for verifying PocketBase SSE realtime subscriptions.
 *
 * Subscribes to all collections and logs every event received.
 * Use this during development to confirm events are flowing correctly.
 *
 * This subscribes independently of the main RealtimeManager so it can be
 * used to verify events without interfering with production sync.
 *
 * Usage:
 *   const { logs, isConnected, clear } = useRealtimeDebug();
 */
export const useRealtimeDebug = () => {
  const { isAuthenticated, pb } = useAuth();
  const [logs, setLogs] = useState<RealtimeLogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const counterRef = useRef(0);
  const unsubFnsRef = useRef<UnsubscribeFunc[]>([]);

  const clear = useCallback(() => {
    setLogs([]);
    counterRef.current = 0;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !pb) {
      setIsConnected(false);
      return;
    }

    const subscribe = async () => {
      for (const collection of DEBUG_COLLECTIONS) {
        try {
          const unsub = await pb.collection(collection).subscribe("*", (data) => {
            counterRef.current += 1;
            const entry: RealtimeLogEntry = {
              id: counterRef.current,
              timestamp: new Date(),
              collection,
              action: data.action,
              recordId: (data.record as { id?: string })?.id ?? "unknown",
            };

            console.log(`[Realtime] ${entry.action} on ${entry.collection}: ${entry.recordId}`);

            setLogs((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
          });
          unsubFnsRef.current.push(unsub);
        } catch (error) {
          console.warn(`[Realtime Debug] Failed to subscribe to ${collection}:`, error);
        }
      }
      setIsConnected(true);
      console.log("[Realtime Debug] Subscribed to all collections");
    };

    subscribe();

    return () => {
      for (const fn of unsubFnsRef.current) {
        try {
          fn();
        } catch {
          // ignore cleanup errors
        }
      }
      unsubFnsRef.current = [];
      setIsConnected(false);
      console.log("[Realtime Debug] Unsubscribed from all collections");
    };
  }, [isAuthenticated, pb]);

  return { logs, isConnected, clear };
};

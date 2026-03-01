import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { useDatabase } from "@/contexts/DatabaseContext";
import type LocationHistory from "@/db/models/LocationHistory";

type UseLocationHistoryResult = {
  history: LocationHistory[];
  isLoading: boolean;
};

/**
 * Reactively observes a single user's location history for the map trail.
 * Returns points sorted ascending (oldest → newest) for polyline drawing.
 * When `userId` is null, returns an empty array with no subscription.
 */
export const useLocationHistory = (
  userId: string | null,
  hoursBack = 24,
): UseLocationHistoryResult => {
  const database = useDatabase();
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const collection = database.get<LocationHistory>("location_history");
    const query = collection.query(
      Q.where("user_id", userId),
      Q.where("timestamp", Q.gte(cutoff)),
      Q.sortBy("timestamp", Q.asc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setHistory(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useLocationHistory] Observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, userId, hoursBack]);

  return { history, isLoading };
};

/**
 * Reactively observes location history for all given family members.
 * Returns points sorted descending (newest first) for timeline display.
 */
export const useFamilyLocationHistory = (
  memberServerIds: string[],
  hoursBack = 24,
): UseLocationHistoryResult => {
  const database = useDatabase();
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stabilize the dependency on the array of IDs
  const idsKey = memberServerIds.join(",");

  useEffect(() => {
    if (memberServerIds.length === 0) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const collection = database.get<LocationHistory>("location_history");
    const query = collection.query(
      Q.where("user_id", Q.oneOf(memberServerIds)),
      Q.where("timestamp", Q.gte(cutoff)),
      Q.sortBy("timestamp", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setHistory(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useFamilyLocationHistory] Observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, idsKey, hoursBack]);

  return { history, isLoading };
};

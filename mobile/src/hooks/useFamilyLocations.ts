import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type Member from "@/db/models/Member";

type UseFamilyLocationsResult = {
  /** Family members who have location data (last_lat/last_lng set). */
  members: Member[];
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
};

/**
 * Reactively observes family members and their last-known locations from WatermelonDB.
 *
 * Only includes members who have a non-null `last_lat` and `last_lng` — i.e.,
 * members who have shared their location at least once.
 */
export const useFamilyLocations = (): UseFamilyLocationsResult => {
  const database = useDatabase();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.family_id) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    const collection = database.get<Member>("members");
    const query = collection.query(
      Q.where("family_id", user.family_id),
      Q.where("last_lat", Q.notEq(null)),
      Q.where("last_lng", Q.notEq(null)),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setMembers(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useFamilyLocations] Observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id]);

  return { members, isLoading };
};

/**
 * Reactively observes ALL family members (including those without location).
 * Useful for the geofence "watch_user" and "notify_user" pickers.
 */
export const useFamilyMembers = (): { members: Member[]; isLoading: boolean } => {
  const database = useDatabase();
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.family_id) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    const collection = database.get<Member>("members");
    const query = collection.query(Q.where("family_id", user.family_id));

    const subscription = query.observe().subscribe({
      next: (results) => {
        setMembers(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useFamilyMembers] Observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id]);

  return { members, isLoading };
};

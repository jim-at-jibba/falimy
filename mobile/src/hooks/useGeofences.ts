import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type Geofence from "@/db/models/Geofence";
import type { GeofenceTrigger } from "@/db/models/Geofence";
import { deleteRecordByServerId, upsertRecord } from "@/db/sync";

type CreateGeofenceInput = {
  name: string;
  lat: number;
  lng: number;
  radius: number;
  notifyUserId?: string;
  watchUserId?: string;
  triggerOn?: GeofenceTrigger;
};

type UpdateGeofenceInput = {
  name?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  notifyUserId?: string;
  watchUserId?: string;
  triggerOn?: GeofenceTrigger;
  enabled?: boolean;
};

type UseGeofencesResult = {
  /** All geofences for the user's family. */
  geofences: Geofence[];
  /** Whether the initial load is still in progress. */
  isLoading: boolean;
  /** Create a new geofence. Returns the PB server ID. */
  createGeofence: (input: CreateGeofenceInput) => Promise<string>;
  /** Update an existing geofence. */
  updateGeofence: (serverId: string, input: UpdateGeofenceInput) => Promise<void>;
  /** Delete a geofence. */
  deleteGeofence: (serverId: string) => Promise<void>;
  /** Toggle a geofence's enabled state. */
  toggleGeofence: (serverId: string, currentEnabled: boolean) => Promise<void>;
};

/**
 * Reactively observes geofences for the current user's family.
 *
 * Mutations go to PocketBase first, then upsert the result into WatermelonDB.
 */
export const useGeofences = (): UseGeofencesResult => {
  const database = useDatabase();
  const { user, pb } = useAuth();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.family_id) {
      setGeofences([]);
      setIsLoading(false);
      return;
    }

    const collection = database.get<Geofence>("geofences");
    const query = collection.query(
      Q.where("family_id", user.family_id),
      Q.sortBy("created_at", Q.desc),
    );

    const subscription = query.observe().subscribe({
      next: (results) => {
        setGeofences(results);
        setIsLoading(false);
      },
      error: (err) => {
        console.warn("[useGeofences] Observe error:", err);
        setIsLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [database, user?.family_id]);

  const createGeofence = async (input: CreateGeofenceInput): Promise<string> => {
    if (!user?.family_id) {
      throw new Error("Cannot create geofence: no family_id.");
    }
    if (!pb) throw new Error("PocketBase not available.");

    const pbRecord = await pb.collection("geofences").create({
      family_id: user.family_id,
      name: input.name,
      lat: input.lat,
      lng: input.lng,
      radius: input.radius,
      notify_user_id: input.notifyUserId ?? user.id,
      watch_user_id: input.watchUserId ?? "",
      trigger_on: input.triggerOn ?? "both",
      enabled: true,
    });

    await upsertRecord(database, "geofences", pbRecord as unknown as Record<string, unknown>);

    return pbRecord.id;
  };

  const updateGeofence = async (serverId: string, input: UpdateGeofenceInput): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.lat !== undefined) updateData.lat = input.lat;
    if (input.lng !== undefined) updateData.lng = input.lng;
    if (input.radius !== undefined) updateData.radius = input.radius;
    if (input.notifyUserId !== undefined) updateData.notify_user_id = input.notifyUserId;
    if (input.watchUserId !== undefined) updateData.watch_user_id = input.watchUserId;
    if (input.triggerOn !== undefined) updateData.trigger_on = input.triggerOn;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;

    const pbRecord = await pb.collection("geofences").update(serverId, updateData);
    await upsertRecord(database, "geofences", pbRecord as unknown as Record<string, unknown>);
  };

  const deleteGeofence = async (serverId: string): Promise<void> => {
    if (!pb) throw new Error("PocketBase not available.");

    await pb.collection("geofences").delete(serverId);
    await deleteRecordByServerId(database, "geofences", serverId);
  };

  const toggleGeofence = async (serverId: string, currentEnabled: boolean): Promise<void> => {
    await updateGeofence(serverId, { enabled: !currentEnabled });
  };

  return { geofences, isLoading, createGeofence, updateGeofence, deleteGeofence, toggleGeofence };
};

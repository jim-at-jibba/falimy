import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/contexts/DatabaseContext";
import type { LocationSharingMode } from "@/db/models/Member";
import { upsertRecord } from "@/db/sync";
import {
  isBackgroundLocationRunning,
  postCurrentLocation,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "@/services/locationTask";

type PermissionStatus = "undetermined" | "granted" | "denied" | "background_granted";

type UseLocationResult = {
  /** Current permission status. */
  permissionStatus: PermissionStatus;
  /** Whether the background task is currently running. */
  isTracking: boolean;
  /** The current user's sharing mode from PocketBase. */
  sharingMode: LocationSharingMode;
  /** Whether a permission or mode change is in progress. */
  isUpdating: boolean;
  /** Request foreground location permission. */
  requestForegroundPermission: () => Promise<boolean>;
  /** Request background location permission (must have foreground first). */
  requestBackgroundPermission: () => Promise<boolean>;
  /** Change the user's sharing mode. Starts/stops tracking as needed. */
  setSharingMode: (mode: LocationSharingMode, until?: Date) => Promise<void>;
  /** Post a single location update (for on-request ping). */
  sendCurrentLocation: () => Promise<void>;
};

/**
 * Hook for managing location permissions, sharing modes, and background tracking.
 *
 * Mutations go to PocketBase first, then upsert the response locally.
 */
export const useLocation = (): UseLocationResult => {
  const { user, pb } = useAuth();
  const database = useDatabase();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>("undetermined");
  const [isTracking, setIsTracking] = useState(false);
  const [sharingMode, setSharingModeState] = useState<LocationSharingMode>("off");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check permissions and tracking status on mount
  useEffect(() => {
    const check = async () => {
      const fg = await Location.getForegroundPermissionsAsync();
      if (!fg.granted) {
        setPermissionStatus(fg.canAskAgain ? "undetermined" : "denied");
      } else {
        const bg = await Location.getBackgroundPermissionsAsync();
        setPermissionStatus(bg.granted ? "background_granted" : "granted");
      }

      const running = await isBackgroundLocationRunning();
      setIsTracking(running);
    };
    check();
  }, []);

  // Load the current sharing mode from PocketBase user record.
  // Uses useFocusEffect so the state refreshes when navigating back
  // (e.g. returning from the settings screen after changing mode).
  useFocusEffect(
    useCallback(() => {
      if (!pb || !user?.id) return;

      const loadMode = async () => {
        try {
          const record = await pb.collection("users").getOne(user.id);
          setSharingModeState((record.location_sharing_mode as LocationSharingMode) || "off");

          // Check timed mode expiry
          if (record.location_sharing_mode === "timed" && record.location_sharing_until) {
            const until = new Date(record.location_sharing_until);
            if (until <= new Date()) {
              // Timer expired — turn off
              await pb.collection("users").update(user.id, {
                location_sharing_mode: "off",
                location_sharing_until: "",
              });
              setSharingModeState("off");
              await stopBackgroundLocationTracking();
              setIsTracking(false);
            }
          }
        } catch (err) {
          console.warn("[useLocation] Failed to load sharing mode:", err);
        }
      };
      loadMode();
    }, [pb, user?.id]),
  );

  // Foreground polling: post location every 5 minutes while tracking
  const FOREGROUND_POLL_INTERVAL_MS = 5 * 60 * 1000;
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isTracking) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    // Post immediately, then every 5 minutes
    postCurrentLocation().catch((err) =>
      console.warn("[useLocation] Foreground poll failed:", err),
    );

    pollTimerRef.current = setInterval(() => {
      postCurrentLocation().catch((err) =>
        console.warn("[useLocation] Foreground poll failed:", err),
      );
    }, FOREGROUND_POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isTracking]);

  const requestForegroundPermission = useCallback(async (): Promise<boolean> => {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setPermissionStatus("granted");
      return true;
    }

    if (!canAskAgain) {
      setPermissionStatus("denied");
      Alert.alert(
        "Location Permission Needed",
        "Please enable location access in your device settings to share your location with family.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
      );
    } else {
      setPermissionStatus("undetermined");
    }

    return false;
  }, []);

  const requestBackgroundPermission = useCallback(async (): Promise<boolean> => {
    // Must have foreground first
    if (permissionStatus !== "granted" && permissionStatus !== "background_granted") {
      const fgGranted = await requestForegroundPermission();
      if (!fgGranted) return false;
    }

    const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();

    if (status === "granted") {
      setPermissionStatus("background_granted");
      return true;
    }

    if (!canAskAgain) {
      setPermissionStatus("denied");
      const hint =
        Platform.OS === "ios"
          ? 'Please select "Always" for Location in Settings.'
          : "Please enable background location access in Settings.";
      Alert.alert("Background Location Needed", hint, [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]);
    }

    return false;
  }, [permissionStatus, requestForegroundPermission]);

  const setSharingMode = useCallback(
    async (mode: LocationSharingMode, until?: Date): Promise<void> => {
      if (!pb || !user?.id) return;
      setIsUpdating(true);

      try {
        // For "always" or "timed", ensure we have background permission
        if (mode === "always" || mode === "timed") {
          const bgGranted = await requestBackgroundPermission();
          if (!bgGranted) {
            setIsUpdating(false);
            return;
          }
        }

        // Update on PocketBase first
        const pbRecord = await pb.collection("users").update(user.id, {
          location_sharing_mode: mode,
          location_sharing_until: mode === "timed" && until ? until.toISOString() : "",
        });

        // Upsert locally
        await upsertRecord(database, "members", pbRecord as unknown as Record<string, unknown>);

        setSharingModeState(mode);

        // Start or stop background tracking based on mode
        if (mode === "always" || mode === "timed") {
          await startBackgroundLocationTracking();
          setIsTracking(true);
        } else {
          await stopBackgroundLocationTracking();
          setIsTracking(false);
        }
      } catch (err) {
        console.warn("[useLocation] Failed to set sharing mode:", err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [pb, user?.id, database, requestBackgroundPermission],
  );

  const sendCurrentLocation = useCallback(async (): Promise<void> => {
    // Need at least foreground permission
    if (permissionStatus === "undetermined" || permissionStatus === "denied") {
      const granted = await requestForegroundPermission();
      if (!granted) throw new Error("Location permission not granted");
    }

    setIsUpdating(true);
    try {
      await postCurrentLocation();
    } finally {
      setIsUpdating(false);
    }
  }, [permissionStatus, requestForegroundPermission]);

  return {
    permissionStatus,
    isTracking,
    sharingMode,
    isUpdating,
    requestForegroundPermission,
    requestBackgroundPermission,
    setSharingMode,
    sendCurrentLocation,
  };
};

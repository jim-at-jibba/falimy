import * as Battery from "expo-battery";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { getPocketBase } from "@/api/pocketbase";
import { logger } from "@/utils/logger";

/**
 * Background location task name.
 * Must be defined at the top level (not inside a component) so
 * TaskManager can register it before React renders.
 */
export const LOCATION_TASK_NAME = "falimy-background-location";

/**
 * Minimum interval between location posts to PocketBase (ms).
 * The background task may fire more frequently; we debounce on the client side.
 */
const MIN_POST_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/** Tracks the last time we posted a location update. */
let lastPostTimestamp = 0;

// ---------------------------------------------------------------------------
// Background task definition
// ---------------------------------------------------------------------------

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    logger.warn("Background task error", {
      component: "locationTask",
      error: error.message,
    });
    return;
  }

  const locations = (data as { locations?: Location.LocationObject[] })?.locations;
  if (!locations || locations.length === 0) return;

  // Use the most recent location
  const location = locations[locations.length - 1];
  const now = Date.now();

  // Debounce: skip if we posted recently
  if (now - lastPostTimestamp < MIN_POST_INTERVAL_MS) {
    return;
  }

  try {
    const pb = await getPocketBase();
    if (!pb || !pb.authStore.isValid) {
      logger.warn("No valid PB auth, skipping location post", {
        component: "locationTask",
      });
      return;
    }

    const userId = pb.authStore.record?.id;
    if (!userId) return;

    // Get battery level (best effort)
    let batteryLevel: number | null = null;
    try {
      batteryLevel = await Battery.getBatteryLevelAsync();
      // Battery API returns 0-1, we store as 0-100
      if (batteryLevel !== null && batteryLevel >= 0) {
        batteryLevel = Math.round(batteryLevel * 100);
      }
    } catch {
      // Battery API may not be available on all devices
    }

    // Post to location_history collection
    await pb.collection("location_history").create({
      user_id: userId,
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      accuracy: location.coords.accuracy ?? null,
      battery_level: batteryLevel,
      timestamp: new Date(location.timestamp).toISOString(),
    });

    // Update user's last-known location fields
    await pb.collection("users").update(userId, {
      last_lat: location.coords.latitude,
      last_lng: location.coords.longitude,
      last_location_at: new Date(location.timestamp).toISOString(),
    });

    lastPostTimestamp = now;
  } catch (err) {
    logger.error("Failed to post location", err, { component: "locationTask" });
  }
});

// ---------------------------------------------------------------------------
// Public API — start / stop background tracking
// ---------------------------------------------------------------------------

/**
 * Start background location tracking.
 * Requires background location permission to be granted already.
 */
export const startBackgroundLocationTracking = async (): Promise<void> => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    logger.debug("Already running, skipping start", { component: "locationTask" });
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 100, // metres — minimum displacement before update
    timeInterval: MIN_POST_INTERVAL_MS,
    deferredUpdatesInterval: MIN_POST_INTERVAL_MS,
    showsBackgroundLocationIndicator: true, // iOS: blue status bar
    foregroundService: {
      notificationTitle: "Falimy",
      notificationBody: "Sharing your location with family",
      notificationColor: "#2BCCBD",
    },
    pausesUpdatesAutomatically: true, // iOS: pause when stationary
    activityType: Location.ActivityType.Other,
  });

  logger.info("Background tracking started", { component: "locationTask" });
};

/**
 * Stop background location tracking.
 */
export const stopBackgroundLocationTracking = async (): Promise<void> => {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (!isRegistered) {
    return;
  }

  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  logger.info("Background tracking stopped", { component: "locationTask" });
};

/**
 * Check whether the background location task is currently running.
 */
export const isBackgroundLocationRunning = async (): Promise<boolean> => {
  return TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
};

// ---------------------------------------------------------------------------
// One-shot location post (for on-request / ping scenarios)
// ---------------------------------------------------------------------------

/**
 * Get the current location and post it to PocketBase once.
 * Used for the "on_request" sharing mode (ping response).
 */
export const postCurrentLocation = async (): Promise<void> => {
  const pb = await getPocketBase();
  if (!pb || !pb.authStore.isValid) {
    throw new Error("Not authenticated");
  }

  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error("No user ID");

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  let batteryLevel: number | null = null;
  try {
    batteryLevel = await Battery.getBatteryLevelAsync();
    if (batteryLevel !== null && batteryLevel >= 0) {
      batteryLevel = Math.round(batteryLevel * 100);
    }
  } catch {
    // noop
  }

  await pb.collection("location_history").create({
    user_id: userId,
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    accuracy: location.coords.accuracy ?? null,
    battery_level: batteryLevel,
    timestamp: new Date(location.timestamp).toISOString(),
  });

  await pb.collection("users").update(userId, {
    last_lat: location.coords.latitude,
    last_lng: location.coords.longitude,
    last_location_at: new Date(location.timestamp).toISOString(),
  });
};

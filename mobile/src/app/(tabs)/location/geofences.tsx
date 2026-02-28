import { router } from "expo-router";
import { MapPin, Plus, Shield, Trash2 } from "lucide-react-native";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import type Geofence from "@/db/models/Geofence";
import { useFamilyMembers } from "@/hooks/useFamilyLocations";
import { useGeofences } from "@/hooks/useGeofences";
import { useSync } from "@/hooks/useSync";

/** Get a human-friendly radius string. */
function formatRadius(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/** Get trigger label. */
function triggerLabel(trigger: string | null): string {
  switch (trigger) {
    case "enter":
      return "Enter";
    case "exit":
      return "Exit";
    case "both":
      return "Enter & Exit";
    default:
      return "Both";
  }
}

export default function GeofencesScreen() {
  const { theme } = useUnistyles();
  const { geofences, isLoading, toggleGeofence, deleteGeofence } = useGeofences();
  const { members } = useFamilyMembers();
  const { isSyncing, triggerSync } = useSync();

  /** Resolve user ID to name. */
  const memberName = useCallback(
    (userId: string | null): string => {
      if (!userId) return "Anyone";
      const member = members.find((m) => m.serverId === userId);
      return member?.name ?? "Unknown";
    },
    [members],
  );

  const handleToggle = useCallback(
    async (geofence: Geofence) => {
      try {
        await toggleGeofence(geofence.serverId, geofence.isEnabled);
      } catch (_err) {
        Alert.alert("Error", "Failed to toggle geofence.");
      }
    },
    [toggleGeofence],
  );

  const handleDelete = useCallback(
    (geofence: Geofence) => {
      Alert.alert("Delete Geofence", `Delete "${geofence.name}"? This cannot be undone.`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGeofence(geofence.serverId);
            } catch {
              Alert.alert("Error", "Failed to delete geofence.");
            }
          },
        },
      ]);
    },
    [deleteGeofence],
  );

  if (isLoading) {
    return (
      <View style={styles.outerContainer}>
        <Header
          title="Geofences"
          showBack
          backgroundColor="#b2ecca"
          rightElement={
            <Pressable
              style={styles.addButton}
              onPress={() => router.push("/(tabs)/location/create-geofence" as never)}
              hitSlop={8}
            >
              <Plus size={24} color={theme.colors.primary} />
            </Pressable>
          }
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Header
        title="Geofences"
        showBack
        backgroundColor="#b2ecca"
        rightElement={
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/(tabs)/location/create-geofence" as never)}
            hitSlop={8}
          >
            <Plus size={24} color={theme.colors.primary} />
          </Pressable>
        }
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={triggerSync}
            tintColor={theme.colors.primary}
          />
        }
      >
        <SmallText text="Get notified when family members enter or leave saved places." />

      {/* Empty state */}
      {geofences.length === 0 && (
        <View style={styles.emptyState}>
          <Shield size={48} color={theme.colors.grey} />
          <DefaultText
            text="No geofences yet"
            additionalStyles={{ color: theme.colors.grey, marginTop: 12 }}
          />
          <DefaultText
            text="Tap + to create a geofence"
            additionalStyles={{ color: theme.colors.grey }}
          />
        </View>
      )}

      {/* Geofence list */}
      {geofences.map((geofence) => (
        <View key={geofence.id} style={styles.geofenceCard}>
          <View style={styles.geofenceRow}>
            <View style={styles.geofenceIcon}>
              <MapPin
                size={20}
                color={geofence.isEnabled ? theme.colors.primary : theme.colors.grey}
              />
            </View>
            <View style={styles.geofenceText}>
              <DefaultText
                text={geofence.name}
                additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.md }}
              />
              <SmallText text={`Radius: ${formatRadius(geofence.radius)}`} />
              <SmallText text={`Trigger: ${triggerLabel(geofence.triggerOn)}`} />
              {geofence.watchUserId && (
                <SmallText text={`Watching: ${memberName(geofence.watchUserId)}`} />
              )}
              <SmallText text={`Notify: ${memberName(geofence.notifyUserId)}`} />
            </View>
            <View style={styles.geofenceActions}>
              <Switch
                value={geofence.isEnabled}
                onValueChange={() => handleToggle(geofence)}
                trackColor={{ false: theme.colors.greyLight, true: theme.colors.primary }}
              />
              <Pressable onPress={() => handleDelete(geofence)} hitSlop={8}>
                <Trash2 size={18} color={theme.colors.error} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    gap: theme.spacing[3],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundAccent,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
    gap: 4,
  },
  geofenceCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  geofenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[3],
  },
  geofenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundAccent,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  geofenceText: {
    flex: 1,
    gap: 2,
  },
  geofenceActions: {
    alignItems: "center",
    gap: theme.spacing[3],
  },
}));

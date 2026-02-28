import { Clock, type MapPin, Radio, Shield, Wifi, WifiOff } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import type { LocationSharingMode } from "@/db/models/Member";
import { useLocation } from "@/hooks/useLocation";

const SHARING_MODES: {
  mode: LocationSharingMode;
  label: string;
  description: string;
  icon: typeof MapPin;
}[] = [
  {
    mode: "off",
    label: "Off",
    description: "Your location is not shared with anyone.",
    icon: WifiOff,
  },
  {
    mode: "always",
    label: "Always",
    description: "Your location is continuously shared with your family in the background.",
    icon: Wifi,
  },
  {
    mode: "timed",
    label: "Timed",
    description: "Share your location for a set duration, then automatically stop.",
    icon: Clock,
  },
  {
    mode: "on_request",
    label: "On Request",
    description: "Family members can request your location. You choose when to share.",
    icon: Radio,
  },
];

const TIMED_OPTIONS = [
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
  { label: "4 hours", minutes: 240 },
  { label: "8 hours", minutes: 480 },
];

export default function LocationSettingsScreen() {
  const { theme } = useUnistyles();
  const { sharingMode, isTracking, isUpdating, permissionStatus, setSharingMode } = useLocation();
  const [showTimedOptions, setShowTimedOptions] = useState(false);

  const handleModeSelect = useCallback(
    async (mode: LocationSharingMode) => {
      if (mode === "timed") {
        setShowTimedOptions(true);
        return;
      }

      try {
        await setSharingMode(mode);
        setShowTimedOptions(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update sharing mode.";
        Alert.alert("Error", message);
      }
    },
    [setSharingMode],
  );

  const handleTimedSelect = useCallback(
    async (minutes: number) => {
      try {
        const until = new Date(Date.now() + minutes * 60_000);
        await setSharingMode("timed", until);
        setShowTimedOptions(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start timed sharing.";
        Alert.alert("Error", message);
      }
    },
    [setSharingMode],
  );

  return (
    <View style={styles.outerContainer}>
      <Header title="Location Sharing" showBack backgroundColor="#b2ecca" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DefaultText
          text="Control how and when your location is shared with your family. All data stays on your family's private server."
          additionalStyles={{ color: theme.colors.grey, marginBottom: theme.spacing[3] }}
        />

      {/* Current status */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isTracking ? theme.colors.primary : theme.colors.grey },
            ]}
          />
          <DefaultText
            text={isTracking ? "Sharing Active" : "Not Sharing"}
            additionalStyles={{ fontWeight: "600" }}
          />
        </View>
        {permissionStatus === "denied" && (
          <SmallText text="Location permission denied. Please enable in device settings." />
        )}
        {permissionStatus === "undetermined" && (
          <SmallText text="Location permission not yet requested." />
        )}
        {permissionStatus === "granted" && sharingMode !== "off" && (
          <SmallText text="Foreground only. Enable 'Always' in settings for background tracking." />
        )}
      </View>

      {/* Sharing mode options */}
      <DefaultText
        text="Sharing Mode"
        additionalStyles={{
          fontWeight: "600",
          marginTop: theme.spacing[4],
          marginBottom: theme.spacing[2],
        }}
      />

      {SHARING_MODES.map(({ mode, label, description, icon: Icon }) => {
        const isSelected = sharingMode === mode;
        return (
          <Pressable
            key={mode}
            style={[styles.modeCard, isSelected && styles.modeCardSelected]}
            onPress={() => handleModeSelect(mode)}
            disabled={isUpdating}
          >
            <View style={styles.modeCardRow}>
              <View
                style={[
                  styles.modeIcon,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.backgroundAccent,
                  },
                ]}
              >
                <Icon size={20} color={isSelected ? theme.colors.white : theme.colors.grey} />
              </View>
              <View style={styles.modeCardText}>
                <DefaultText text={label} additionalStyles={{ fontWeight: "600" }} />
                <SmallText text={description} />
              </View>
              {isSelected && (
                <View style={styles.selectedIndicator}>
                  <View style={styles.selectedDot} />
                </View>
              )}
              {isUpdating && isSelected && (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              )}
            </View>
          </Pressable>
        );
      })}

      {/* Timed duration picker */}
      {showTimedOptions && (
        <View style={styles.timedSection}>
          <DefaultText
            text="Choose Duration"
            additionalStyles={{ fontWeight: "600", marginBottom: theme.spacing[2] }}
          />
          {TIMED_OPTIONS.map(({ label, minutes }) => (
            <Pressable
              key={minutes}
              style={styles.timedOption}
              onPress={() => handleTimedSelect(minutes)}
              disabled={isUpdating}
            >
              <Clock size={16} color={theme.colors.primary} />
              <DefaultText text={label} />
            </Pressable>
          ))}
          <Pressable style={styles.timedCancel} onPress={() => setShowTimedOptions(false)}>
            <SmallText text="Cancel" />
          </Pressable>
        </View>
      )}

      {/* Privacy notice */}
      <View style={styles.privacyCard}>
        <Shield size={20} color={theme.colors.primary} />
        <View style={styles.privacyText}>
          <DefaultText
            text="Your Privacy"
            additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.sm }}
          />
          <SmallText text="Location data is stored only on your family's self-hosted server. No third parties can access it. You can turn off sharing at any time." />
        </View>
        </View>
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
  statusCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modeCard: {
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
  modeCardSelected: {
    borderColor: theme.colors.primary,
  },
  modeCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  modeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modeCardText: {
    flex: 1,
    gap: 2,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  timedSection: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  timedOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
  },
  timedCancel: {
    alignItems: "center",
    paddingTop: theme.spacing[2],
  },
  privacyCard: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundAccent,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  },
  privacyText: {
    flex: 1,
    gap: 4,
  },
}));

import * as Location from "expo-location";
import { router } from "expo-router";
import { MapPin } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import type { GeofenceTrigger } from "@/db/models/Geofence";
import { useFamilyMembers } from "@/hooks/useFamilyLocations";
import { useGeofences } from "@/hooks/useGeofences";

const RADIUS_OPTIONS = [
  { label: "100 m", value: 100 },
  { label: "250 m", value: 250 },
  { label: "500 m", value: 500 },
  { label: "1 km", value: 1000 },
  { label: "2 km", value: 2000 },
];

const TRIGGER_OPTIONS: { label: string; value: GeofenceTrigger }[] = [
  { label: "Enter & Exit", value: "both" },
  { label: "Enter Only", value: "enter" },
  { label: "Exit Only", value: "exit" },
];

export default function CreateGeofenceScreen() {
  const { theme } = useUnistyles();
  const { createGeofence } = useGeofences();
  const { members } = useFamilyMembers();

  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [radius, setRadius] = useState(250);
  const [triggerOn, setTriggerOn] = useState<GeofenceTrigger>("both");
  const [watchUserId, setWatchUserId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Initialize with the user's current location
  useEffect(() => {
    const init = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLat(location.coords.latitude);
          setLng(location.coords.longitude);
        }
      } catch {
        // Default to 0,0 if can't get location
      } finally {
        setIsLoadingLocation(false);
      }
    };
    init();
  }, []);

  const handleMapPress = useCallback(
    (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
      setLat(e.nativeEvent.coordinate.latitude);
      setLng(e.nativeEvent.coordinate.longitude);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a name for this geofence.");
      return;
    }
    if (lat === null || lng === null) {
      Alert.alert("No Location", "Please tap the map to set a center point.");
      return;
    }

    setIsSaving(true);
    try {
      await createGeofence({
        name: name.trim(),
        lat,
        lng,
        radius,
        triggerOn,
        watchUserId: watchUserId || undefined,
      });
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create geofence.";
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  }, [name, lat, lng, radius, triggerOn, watchUserId, createGeofence]);

  if (isLoadingLocation) {
    return (
      <View style={styles.outerContainer}>
        <Header title="Create Geofence" showBack backgroundColor="#b2ecca" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <SmallText text="Getting your location..." />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Header title="Create Geofence" showBack backgroundColor="#b2ecca" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
        {/* Map picker */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat ?? 0,
              longitude: lng ?? 0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
            showsUserLocation
          >
            {lat !== null && lng !== null && (
              <>
                <Marker
                  coordinate={{ latitude: lat, longitude: lng }}
                  draggable
                  onDragEnd={(e) => {
                    setLat(e.nativeEvent.coordinate.latitude);
                    setLng(e.nativeEvent.coordinate.longitude);
                  }}
                />
                <Circle
                  center={{ latitude: lat, longitude: lng }}
                  radius={radius}
                  strokeColor="rgba(43, 204, 189, 0.6)"
                  fillColor="rgba(43, 204, 189, 0.15)"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>
          <SmallText text="Tap the map to set the center point, or drag the marker." />
        </View>

        {/* Name input */}
        <View style={styles.field}>
          <DefaultText text="Name" additionalStyles={{ fontWeight: "600" }} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Home, School, Work"
            placeholderTextColor={theme.colors.grey}
            value={name}
            onChangeText={setName}
            returnKeyType="done"
          />
        </View>

        {/* Radius picker */}
        <View style={styles.field}>
          <DefaultText text="Radius" additionalStyles={{ fontWeight: "600" }} />
          <View style={styles.optionRow}>
            {RADIUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.optionChip, radius === opt.value && styles.optionChipSelected]}
                onPress={() => setRadius(opt.value)}
              >
                <SmallText text={opt.label} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Trigger picker */}
        <View style={styles.field}>
          <DefaultText text="Trigger On" additionalStyles={{ fontWeight: "600" }} />
          <View style={styles.optionRow}>
            {TRIGGER_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.optionChip, triggerOn === opt.value && styles.optionChipSelected]}
                onPress={() => setTriggerOn(opt.value)}
              >
                <SmallText text={opt.label} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Watch user picker */}
        <View style={styles.field}>
          <DefaultText text="Watch Member" additionalStyles={{ fontWeight: "600" }} />
          <SmallText text="Which family member's location should trigger this geofence?" />
          <View style={styles.optionRow}>
            <Pressable
              style={[styles.optionChip, !watchUserId && styles.optionChipSelected]}
              onPress={() => setWatchUserId("")}
            >
              <SmallText text="Any" />
            </Pressable>
            {members.map((m) => (
              <Pressable
                key={m.serverId}
                style={[styles.optionChip, watchUserId === m.serverId && styles.optionChipSelected]}
                onPress={() => setWatchUserId(m.serverId)}
              >
                <SmallText text={m.name} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save button */}
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <MapPin size={20} color={theme.colors.white} />
              <DefaultText
                text="Create Geofence"
                additionalStyles={{ color: theme.colors.white, fontWeight: "600" }}
              />
            </>
          )}
        </Pressable>
      </ScrollView>
      </KeyboardAvoidingView>
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
    gap: theme.spacing[4],
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[3],
    backgroundColor: theme.colors.background,
  },
  mapContainer: {
    gap: theme.spacing[2],
  },
  map: {
    height: 250,
    borderRadius: theme.borderRadiusSm,
    overflow: "hidden",
  },
  field: {
    gap: theme.spacing[2],
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  optionChip: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadiusMd,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.greyLight,
  },
  optionChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[2],
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[4],
    borderRadius: theme.borderRadiusSm,
    marginTop: theme.spacing[3],
  },
}));

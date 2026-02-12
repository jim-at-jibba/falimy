import { router } from "expo-router";
import { MapPin, Navigation, Settings2, Shield } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from "react-native";
import MapView, { Circle, Marker, type Region } from "react-native-maps";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DefaultText } from "@/components/DefaultText";
import { SmallText } from "@/components/SmallText";
import Title from "@/components/Title";
import { useAuth } from "@/contexts/AuthContext";
import type Member from "@/db/models/Member";
import { useFamilyLocations } from "@/hooks/useFamilyLocations";
import { useGeofences } from "@/hooks/useGeofences";
import { useLocation } from "@/hooks/useLocation";
import { useSync } from "@/hooks/useSync";

/** Format a relative time string like "2 min ago" or "3 hrs ago". */
function formatRelativeTime(date: Date | null): string {
  if (!date) return "Unknown";
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

/** Get initials from a name. */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Marker colour based on recency. */
function getMarkerColor(date: Date | null): string {
  if (!date) return "#999";
  const diff = Date.now() - date.getTime();
  if (diff < 10 * 60_000) return "#2BCCBD"; // <10min: teal (active)
  if (diff < 60 * 60_000) return "#F5A623"; // <1hr: amber
  return "#999"; // stale
}

export default function MapScreen() {
  const { theme } = useUnistyles();
  const { user } = useAuth();
  const { members, isLoading: membersLoading } = useFamilyLocations();
  const { geofences } = useGeofences();
  const { sharingMode, permissionStatus } = useLocation();
  const { isSyncing, triggerSync } = useSync();

  const mapRef = useRef<MapView>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Compute initial region from members' locations
  const initialRegion: Region = useMemo(() => {
    if (members.length === 0) {
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 90,
      };
    }

    const lats = members.map((m) => m.lastLat ?? 0);
    const lngs = members.map((m) => m.lastLng ?? 0);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = Math.max((maxLat - minLat) * 1.5, 0.01);
    const deltaLng = Math.max((maxLng - minLng) * 1.5, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }, [members]);

  const handleMarkerPress = useCallback((member: Member) => {
    setSelectedMember(member);
  }, []);

  const handleCenterOnMembers = useCallback(() => {
    if (members.length === 0) return;
    const coords = members.map((m) => ({
      latitude: m.lastLat ?? 0,
      longitude: m.lastLng ?? 0,
    }));
    mapRef.current?.fitToCoordinates(coords, {
      edgePadding: { top: 80, right: 80, bottom: 200, left: 80 },
      animated: true,
    });
  }, [members]);

  // Show permission prompt if needed
  const showsPermissionBanner =
    sharingMode === "off" || permissionStatus === "undetermined" || permissionStatus === "denied";

  if (membersLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // No location data at all — show empty state
  if (members.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContent}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={triggerSync}
            tintColor={theme.colors.primary}
          />
        }
      >
        <MapPin size={48} color={theme.colors.grey} />
        <Title text="No Locations Yet" />
        <DefaultText
          text="No family members are sharing their location. Enable location sharing in settings to get started."
          additionalStyles={{
            color: theme.colors.grey,
            textAlign: "center",
            paddingHorizontal: 32,
          }}
        />
        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push("/(tabs)/location/settings" as never)}
        >
          <Settings2 size={20} color={theme.colors.white} />
          <DefaultText
            text="Location Settings"
            additionalStyles={{ color: theme.colors.white, fontWeight: "600" }}
          />
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={
          permissionStatus === "granted" || permissionStatus === "background_granted"
        }
        showsMyLocationButton={false}
      >
        {/* Family member markers */}
        {members.map((member) => (
          <Marker
            key={member.id}
            coordinate={{
              latitude: member.lastLat ?? 0,
              longitude: member.lastLng ?? 0,
            }}
            title={member.name}
            description={formatRelativeTime(member.lastLocationAt)}
            pinColor={getMarkerColor(member.lastLocationAt)}
            onPress={() => handleMarkerPress(member)}
          />
        ))}

        {/* Geofence circles */}
        {geofences
          .filter((g) => g.isEnabled)
          .map((geofence) => (
            <Circle
              key={geofence.id}
              center={{ latitude: geofence.lat, longitude: geofence.lng }}
              radius={geofence.radius}
              strokeColor="rgba(43, 204, 189, 0.6)"
              fillColor="rgba(43, 204, 189, 0.1)"
              strokeWidth={2}
            />
          ))}
      </MapView>

      {/* Floating action buttons */}
      <View style={styles.fabContainer}>
        <Pressable style={styles.fab} onPress={handleCenterOnMembers}>
          <Navigation size={20} color={theme.colors.primary} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/(tabs)/location/settings" as never)}
        >
          <Settings2 size={20} color={theme.colors.primary} />
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => router.push("/(tabs)/location/geofences" as never)}
        >
          <Shield size={20} color={theme.colors.primary} />
        </Pressable>
      </View>

      {/* Selected member detail card */}
      {selectedMember && (
        <View style={styles.memberCard}>
          <Pressable style={styles.memberCardClose} onPress={() => setSelectedMember(null)}>
            <SmallText text="x" />
          </Pressable>
          <View style={styles.memberCardRow}>
            <View style={styles.memberAvatar}>
              <DefaultText
                text={getInitials(selectedMember.name)}
                additionalStyles={{ color: theme.colors.white, fontWeight: "700" }}
              />
            </View>
            <View style={styles.memberCardText}>
              <DefaultText
                text={selectedMember.name}
                additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.md }}
              />
              <SmallText text={formatRelativeTime(selectedMember.lastLocationAt)} />
              {selectedMember.locationSharingMode && (
                <SmallText text={`Sharing: ${selectedMember.locationSharingMode}`} />
              )}
              {selectedMember.serverId === user?.id && <SmallText text="(You)" />}
            </View>
          </View>
        </View>
      )}

      {/* Sharing status banner */}
      {showsPermissionBanner && (
        <Pressable
          style={styles.banner}
          onPress={() => router.push("/(tabs)/location/settings" as never)}
        >
          <MapPin size={16} color={theme.colors.white} />
          <DefaultText
            text="Location sharing is off. Tap to configure."
            additionalStyles={{ color: theme.colors.white, fontSize: theme.fontSizes.sm }}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  emptyContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[4],
    padding: theme.spacing[5],
  },
  map: {
    flex: 1,
  },
  fabContainer: {
    position: "absolute",
    right: theme.spacing[4],
    top: theme.spacing[4],
    gap: theme.spacing[3],
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadiusSm,
    marginTop: theme.spacing[4],
  },
  memberCard: {
    position: "absolute",
    bottom: theme.spacing[5],
    left: theme.spacing[4],
    right: theme.spacing[4],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  memberCardClose: {
    position: "absolute",
    top: theme.spacing[2],
    right: theme.spacing[3],
    padding: theme.spacing[1],
  },
  memberCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  memberCardText: {
    flex: 1,
    gap: 2,
  },
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
}));

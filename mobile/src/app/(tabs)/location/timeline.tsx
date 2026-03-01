import { Clock } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, RefreshControl, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { SmallText } from "@/components/SmallText";
import type LocationHistory from "@/db/models/LocationHistory";
import { useFamilyLocations } from "@/hooks/useFamilyLocations";
import { useFamilyLocationHistory } from "@/hooks/useLocationHistory";
import { useSync } from "@/hooks/useSync";
import {
  formatAbsoluteTime,
  formatRelativeTime,
  getInitials,
  getMarkerColor,
} from "@/utils/formatTime";

export default function TimelineScreen() {
  const { theme } = useUnistyles();
  const { members, isLoading: membersLoading } = useFamilyLocations();
  const { isSyncing, triggerSync } = useSync();

  const memberServerIds = useMemo(() => members.map((m) => m.serverId), [members]);
  const { history, isLoading: historyLoading } = useFamilyLocationHistory(memberServerIds);

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      map.set(m.serverId, m.name);
    }
    return map;
  }, [members]);

  const isLoading = membersLoading || historyLoading;

  const renderItem = ({ item }: { item: LocationHistory }) => {
    const name = memberNameMap.get(item.userId) ?? "Unknown";
    const color = getMarkerColor(item.timestamp);

    return (
      <View style={styles.card}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <DefaultText
            text={getInitials(name)}
            additionalStyles={{ color: theme.colors.white, fontWeight: "700", fontSize: theme.fontSizes.sm }}
          />
        </View>
        <View style={styles.cardText}>
          <DefaultText
            text={name}
            additionalStyles={{ fontWeight: "600", fontSize: theme.fontSizes.md }}
          />
          <SmallText text={formatRelativeTime(item.timestamp)} />
          {item.batteryLevel != null && (
            <SmallText text={`Battery: ${item.batteryLevel}%`} />
          )}
        </View>
        <DefaultText
          text={formatAbsoluteTime(item.timestamp)}
          additionalStyles={{ color: theme.colors.grey, fontSize: theme.fontSizes.sm }}
        />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.outerContainer}>
        <Header title="Timeline" showBack backgroundColor="#b2ecca" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Header title="Timeline" showBack backgroundColor="#b2ecca" />
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isSyncing}
            onRefresh={triggerSync}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Clock size={48} color={theme.colors.grey} />
            <DefaultText
              text="No location history"
              additionalStyles={{ color: theme.colors.grey, marginTop: 12 }}
            />
            <DefaultText
              text="Location history will appear here as family members share their locations."
              additionalStyles={{ color: theme.colors.grey, textAlign: "center" }}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  outerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    gap: theme.spacing[3],
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing[8],
    gap: 4,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.black,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
}));

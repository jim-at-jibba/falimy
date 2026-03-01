import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { getPocketBase } from "@/api/pocketbase";
import { Button } from "@/components/Button";
import { Header } from "@/components/Navigation/Header";
import { Select, type SelectOption } from "@/components/Select";
import { SmallText } from "@/components/SmallText";
import type { FamiliesResponse, UsersResponse } from "@/types/pocketbase-types";
import { getServerUrl } from "@/utils/config";
import { generateInviteCode } from "@/utils/invite";

const ROLE_OPTIONS: SelectOption[] = [
  { label: "Admin", value: "admin" },
  { label: "Member", value: "member" },
  { label: "Child", value: "child" },
];

export default function FamilySettings() {
  const [family, setFamily] = useState<FamiliesResponse | null>(null);
  const [members, setMembers] = useState<UsersResponse[]>([]);
  const [serverUrl, setServerUrlState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const pb = await getPocketBase();
        const url = await getServerUrl();
        setServerUrlState(url);

        if (!pb || !pb.authStore.model) {
          setError("No active session.");
          return;
        }

        const model = pb.authStore.record as UsersResponse | null;
        if (!model) {
          setError("No active session.");
          return;
        }

        setCurrentUserId(model.id);
        setCurrentUserRole(model.role ?? null);

        const familyId = model.family_id;
        if (!familyId) {
          setError("No family assigned to this account.");
          return;
        }

        const familyRecord = await pb.collection("families").getOne<FamiliesResponse>(familyId);
        setFamily(familyRecord);

        const userRecords = await pb.collection("users").getFullList<UsersResponse>({
          filter: `family_id="${familyId}"`,
          sort: "name",
        });
        setMembers(userRecords);
      } catch {
        setError("Unable to load family settings.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const invitePayload = useMemo(() => {
    if (!family || !serverUrl) return null;
    return JSON.stringify({
      server: serverUrl,
      invite: family.invite_code,
      family_id: family.id,
    });
  }, [family, serverUrl]);

  const handleRegenerate = async () => {
    if (!family) return;
    try {
      const pb = await getPocketBase();
      if (!pb) return;

      const updated = await pb.collection("families").update<FamiliesResponse>(family.id, {
        invite_code: await generateInviteCode(),
      });
      setFamily(updated);
    } catch {
      setError("Could not regenerate the invite code.");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: UsersResponse["role"]) => {
    try {
      const pb = await getPocketBase();
      if (!pb) return;

      await pb.collection("users").update(memberId, { role: newRole });
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    } catch {
      setError("Could not update member role.");
    }
  };

  const isAdmin = currentUserRole === "admin";

  const { theme } = useUnistyles();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Family" showBack backgroundColor="#fadeaf" />
      <ScrollView contentContainerStyle={styles.content}>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {family ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {family.name}
            </Text>
            <SmallText text={`Family ID: ${family.id}`} />
            <SmallText text={`Invite code: ${family.invite_code}`} />
            <SmallText text={`Server: ${serverUrl || "Not set"}`} />
            {invitePayload ? (
              <View style={styles.qrContainer}>
                <QRCode value={invitePayload} size={180} />
                <SmallText text="Scan to join the family." />
              </View>
            ) : null}
            <Button label="Regenerate Invite Code" onPress={handleRegenerate} variant="secondary" />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Members
          </Text>
          {members.length === 0 ? (
            <SmallText text="No members yet." />
          ) : (
            members.map((member) => (
              <View
                key={member.id}
                style={styles.memberRow}
              >
                <Text style={styles.memberName}>
                  {member.name || member.email}
                </Text>
                {isAdmin && member.id !== currentUserId ? (
                  <View style={styles.roleSelect}>
                    <Select
                      options={ROLE_OPTIONS}
                      value={member.role}
                      onChange={(newRole) => handleRoleChange(member.id, newRole as UsersResponse["role"])}
                    />
                  </View>
                ) : (
                  <SmallText text={member.role} />
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: theme.spacing[5],
    paddingBottom: 40,
    gap: theme.spacing[4],
  },
  errorText: {
    color: theme.colors.error,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[5],
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    borderWidth: Platform.select({ android: 4, default: 2 }),
    borderColor: theme.colors.black,
  },
  cardTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "700",
    color: theme.colors.typography,
    marginBottom: theme.spacing[2],
  },
  qrContainer: {
    alignItems: "center",
    marginVertical: theme.spacing[4],
    gap: theme.spacing[2],
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyLight,
  },
  memberName: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.typography,
    flex: 1,
  },
  roleSelect: {
    width: 120,
  },
}));

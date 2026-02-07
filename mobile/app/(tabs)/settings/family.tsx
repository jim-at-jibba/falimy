import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

import { Button } from "../../../src/components/Button";
import { getPocketBase } from "../../../src/api/pocketbase";
import { generateInviteCode } from "../../../src/utils/invite";
import { getServerUrl } from "../../../src/utils/config";

type Family = {
  id: string;
  name: string;
  invite_code: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function FamilySettings() {
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [serverUrl, setServerUrlState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        const familyId = (pb.authStore.model as { family_id?: string }).family_id;
        if (!familyId) {
          setError("No family assigned to this account.");
          return;
        }

        const familyRecord = await pb.collection("families").getOne<Family>(familyId);
        setFamily(familyRecord);

        const userRecords = await pb.collection("users").getFullList<Member>({
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

      const updated = await pb.collection("families").update<Family>(family.id, {
        invite_code: generateInviteCode(),
      });
      setFamily(updated);
    } catch {
      setError("Could not regenerate the invite code.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#0c8ce9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Family</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {family ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{family.name}</Text>
            <Text style={styles.meta}>Invite code: {family.invite_code}</Text>
            {invitePayload ? (
              <View style={styles.qrWrap}>
                <QRCode value={invitePayload} size={180} />
                <Text style={styles.meta}>Scan to join the family.</Text>
              </View>
            ) : null}
            <Button label="Regenerate Invite Code" onPress={handleRegenerate} variant="secondary" />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Members</Text>
          {members.length === 0 ? (
            <Text style={styles.meta}>No members yet.</Text>
          ) : (
            members.map((member) => (
              <View key={member.id} style={styles.memberRow}>
                <Text style={styles.memberName}>{member.name || member.email}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f8fb",
  },
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0d3a5a",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#0d3a5a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: "#5b6c7c",
  },
  error: {
    color: "#b11d1d",
  },
  qrWrap: {
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f6",
  },
  memberName: {
    fontSize: 15,
    color: "#0d3a5a",
  },
  memberRole: {
    fontSize: 14,
    color: "#6b7d8d",
  },
});

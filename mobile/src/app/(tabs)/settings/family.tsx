import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPocketBase } from "../../../api/pocketbase";
import { Button } from "../../../components/Button";
import { DefaultText } from "../../../components/DefaultText";
import { SmallText } from "../../../components/SmallText";
import Title from "../../../components/Title";
import { getServerUrl } from "../../../utils/config";
import { generateInviteCode } from "../../../utils/invite";

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
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f8fb",
        }}
      >
        <ActivityIndicator size="large" color="#0c8ce9" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Title text="Family" />

        {error ? <Text style={{ color: "#b11d1d" }}>{error}</Text> : null}

        {family ? (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#0d3a5a",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#0d3a5a", marginBottom: 6 }}>
              {family.name}
            </Text>
            <SmallText text={`Invite code: ${family.invite_code}`} />
            {invitePayload ? (
              <View style={{ alignItems: "center", marginVertical: 16, gap: 8 }}>
                <QRCode value={invitePayload} size={180} />
                <SmallText text="Scan to join the family." />
              </View>
            ) : null}
            <Button label="Regenerate Invite Code" onPress={handleRegenerate} variant="secondary" />
          </View>
        ) : null}

        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#0d3a5a",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0d3a5a", marginBottom: 6 }}>
            Members
          </Text>
          {members.length === 0 ? (
            <SmallText text="No members yet." />
          ) : (
            members.map((member) => (
              <View
                key={member.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eef2f6",
                }}
              >
                <Text style={{ fontSize: 15, color: "#0d3a5a" }}>
                  {member.name || member.email}
                </Text>
                <SmallText text={member.role} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import { Button } from "../../src/components/Button";
import { getPocketBase, resetPocketBase, validateServerUrl } from "../../src/api/pocketbase";
import { setServerUrl } from "../../src/utils/config";

type JoinParams = {
  server?: string;
  invite?: string;
  familyId?: string;
};

export default function JoinFamily() {
  const params = useLocalSearchParams<JoinParams>();
  const [server, setServer] = useState(params.server ?? "");
  const [inviteCode, setInviteCode] = useState(params.invite ?? "");
  const [familyId, setFamilyId] = useState(params.familyId ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!params.server) return;

    const applyServer = async () => {
      try {
        const normalized = await validateServerUrl(params.server as string);
        await setServerUrl(normalized);
        resetPocketBase();
        setServer(normalized);
      } catch {
        setError("Could not validate the server URL from the QR code.");
      }
    };

    applyServer();
  }, [params.server]);

  const handleJoin = async () => {
    setError("");
    setLoading(true);

    try {
      if (server) {
        const normalized = await validateServerUrl(server);
        await setServerUrl(normalized);
        resetPocketBase();
      }

      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      const family = await pb.collection("families").getOne(familyId.trim());
      if (family.invite_code !== inviteCode.trim()) {
        setError("Invite code is invalid.");
        return;
      }

      await pb.collection("users").create({
        email: email.trim(),
        password,
        passwordConfirm: password,
        name: name.trim(),
        role: "member",
        family_id: family.id,
      });

      await pb.collection("users").authWithPassword(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      setError("Could not join the family. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Join Family</Text>
        <Text style={styles.subtitle}>Use the invite from your family admin.</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="Server URL"
          style={styles.input}
          value={server}
          onChangeText={setServer}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Invite code"
          style={styles.input}
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Family ID"
          style={styles.input}
          value={familyId}
          onChangeText={setFamilyId}
        />
        <TextInput placeholder="Your name" style={styles.input} value={name} onChangeText={setName} />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button label={loading ? "Joining..." : "Join Family"} onPress={handleJoin} disabled={loading} />
        <Button label="Scan QR Code" onPress={() => router.push("/(auth)/scan-qr")} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f8fb",
    padding: 20,
    justifyContent: "center",
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0d3a5a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#3f566b",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d7e1ea",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: "#b11d1d",
    marginBottom: 10,
  },
});

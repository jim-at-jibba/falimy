import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPocketBase, resetPocketBase, validateServerUrl } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";
import { setServerUrl } from "../../utils/config";

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
    <SafeAreaView>
      <View>
        <Title text="Join Family" />
        <DefaultText text="Use the invite from your family admin." />

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="Server URL"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={server}
          onChangeText={setServer}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Invite code"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={inviteCode}
          onChangeText={setInviteCode}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Family ID"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={familyId}
          onChangeText={setFamilyId}
        />
        <TextInput
          placeholder="Your name"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="Email"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <DefaultText text={error} /> : null}

        <Button
          label={loading ? "Joining..." : "Join Family"}
          onPress={handleJoin}
          disabled={loading}
        />
        <Button
          label="Scan QR Code"
          onPress={() => router.push("/(auth)/scan-qr")}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

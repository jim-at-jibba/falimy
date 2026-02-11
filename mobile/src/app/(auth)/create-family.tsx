import { router } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPocketBase } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";
import { generateInviteCode, generateTopicPrefix } from "../../utils/invite";

export default function CreateFamily() {
  const [familyName, setFamilyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError("");
    setLoading(true);

    try {
      const pb = await getPocketBase();
      if (!pb) {
        router.replace("/(auth)/server-url");
        return;
      }

      const user = await pb.collection("users").create({
        email: email.trim(),
        password,
        passwordConfirm: password,
        name: name.trim(),
        role: "admin",
      });

      await pb.collection("users").authWithPassword(email.trim(), password);

      const family = await pb.collection("families").create({
        name: familyName.trim(),
        invite_code: generateInviteCode(),
        ntfy_topic_prefix: generateTopicPrefix(),
        created_by: user.id,
      });

      await pb.collection("users").update(user.id, {
        family_id: family.id,
        role: "admin",
      });

      router.replace("/(tabs)");
    } catch {
      setError("Could not create the family. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Title text="Create a Family" />
        <DefaultText text="This account will become the admin." />

        <TextInput
          placeholder="Family name"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 12,
          }}
          value={familyName}
          onChangeText={setFamilyName}
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
            marginBottom: 12,
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
            marginBottom: 12,
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
            marginBottom: 12,
          }}
          value={password}
          onChangeText={setPassword}
        />

        {error ? <DefaultText text={error} /> : null}

        <Button
          label={loading ? "Creating..." : "Create Family"}
          onPress={handleCreate}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

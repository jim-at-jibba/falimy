import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetPocketBase, validateServerUrl } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";
import { setServerUrl } from "../../utils/config";

export default function ServerUrl() {
  const [serverUrl, setServerUrlState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!serverUrl.trim()) {
      setError("Enter your PocketBase server URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const normalized = await validateServerUrl(serverUrl);
      await setServerUrl(normalized);
      resetPocketBase();
      router.replace("/(auth)");
    } catch {
      setError("Could not reach that server. Check the URL and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Title text="Connect to PocketBase" />
        <DefaultText text="Enter the URL where your family hosts PocketBase." />

        <TextInput
          value={serverUrl}
          onChangeText={setServerUrlState}
          placeholder="https://family.example.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={{
            borderWidth: 1,
            borderColor: "#d7e1ea",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 10,
          }}
        />

        {error ? <DefaultText text={error} /> : null}

        <Button label="Save and Continue" onPress={handleSave} disabled={loading} />

        {loading ? <ActivityIndicator /> : null}
      </View>
    </SafeAreaView>
  );
}

import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../../components/Button";
import { DefaultText } from "../../../components/DefaultText";
import Title from "../../../components/Title";

export default function SettingsHome() {
  return (
    <SafeAreaView>
      <View>
        <Title text="Settings" />
        <DefaultText text="Manage your family and server connection." />

        <Button label="Family" onPress={() => router.push("/(tabs)/settings/family")} />
        <Button
          label="Change Server URL"
          onPress={() => router.push("/(auth)/server-url")}
          variant="secondary"
        />
      </View>
    </SafeAreaView>
  );
}

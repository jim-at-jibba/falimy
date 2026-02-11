import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPocketBase } from "../../api/pocketbase";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";

export default function Home() {
  const handleLogout = async () => {
    const pb = await getPocketBase();
    pb?.authStore.clear();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView>
      <View>
        <Title text="Falimy" />
        <DefaultText text="Phase 1 setup complete. Next up: lists and location." />
        <Button label="Log Out" onPress={handleLogout} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

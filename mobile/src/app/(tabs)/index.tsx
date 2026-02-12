import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { DefaultText } from "../../components/DefaultText";
import Title from "../../components/Title";
import { useAuth } from "../../contexts/AuthContext";

export default function Home() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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

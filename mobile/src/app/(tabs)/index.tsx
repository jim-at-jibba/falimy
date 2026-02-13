import { router } from "expo-router";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button } from "@/components/Button";
import { DefaultText } from "@/components/DefaultText";
import { Header } from "@/components/Navigation/Header";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)");
  };

  return (
    <View style={styles.container}>
      <Header title="Falimy" backgroundColor="#b4dbfa" />
      <View style={styles.content}>
        <DefaultText
          text={`Welcome${user?.name ? `, ${user.name}` : ""}. Your private family hub.`}
        />
        <Button label="Log Out" onPress={handleLogout} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing[5],
    gap: theme.spacing[3],
  },
}));

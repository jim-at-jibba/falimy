import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const { theme } = useUnistyles();
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable 
      style={styles.backButton} 
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      accessibilityHint="Navigate to previous screen"
    >
      <ChevronLeft size={24} color={theme.colors.typography} />
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  backButton: {
    padding: theme.spacing[2],
    marginLeft: -theme.spacing[2],
  },
}));

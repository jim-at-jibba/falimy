import { Pressable } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

interface BackButtonProps {
  onPress?: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const { styles, theme } = useStyles(stylesheet);
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <Pressable style={styles.backButton} onPress={handlePress}>
      <ChevronLeft size={24} color={theme.colors.typography} />
    </Pressable>
  );
}

const stylesheet = createStyleSheet(theme => ({
  backButton: {
    padding: theme.spacing[2],
    marginLeft: -theme.spacing[2],
  },
}));

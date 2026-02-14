import * as Haptics from "expo-haptics";
import { Pressable } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface ButtonProps {
  children: React.ReactNode;
  handlePress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "social";
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export default function ButtonContainer({
  children,
  handlePress,
  disabled = false,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const handlePressWithHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePress();
  };

  return (
    <Pressable
      disabled={disabled}
      style={[styles.container, styles[variant], disabled && styles.disabled]}
      onPress={handlePressWithHaptics}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.gap,
    flexDirection: "row",
    borderRadius: theme.borderRadiusSm,
    height: theme.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.greyBackground,
  },
  social: {
    backgroundColor: theme.colors.greyBackground,
  },
  disabled: {
    opacity: 0.5,
  },
}));

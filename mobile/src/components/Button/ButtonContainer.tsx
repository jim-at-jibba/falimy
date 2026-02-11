import { Pressable } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import * as Haptics from "expo-haptics";

interface ButtonProps {
  children: React.ReactNode;
  handlePress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "social";
}

export default function ButtonContainer({
  children,
  handlePress,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  const { styles } = useStyles(stylesheet);

  const handlePressWithHaptics = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handlePress();
  };

  return (
    <Pressable
      disabled={disabled}
      style={[styles.container, styles[variant], disabled && styles.disabled]}
      onPress={handlePressWithHaptics}
    >
      {children}
    </Pressable>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    gap: theme.gap,
    flexDirection: "row",
    borderRadius: theme.borderRadiusSm,
    height: theme.buttonHeight,
    alignItems: "center",
    justifyContent: "center",
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

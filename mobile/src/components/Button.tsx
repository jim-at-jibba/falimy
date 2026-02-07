import { Pressable, StyleSheet, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
};

export const Button = ({ label, onPress, disabled, variant = "primary" }: ButtonProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={variant === "primary" ? styles.primaryText : styles.secondaryText}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: "#0c8ce9",
  },
  secondary: {
    backgroundColor: "#e6eef6",
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryText: {
    color: "#0d3a5a",
    fontSize: 16,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});

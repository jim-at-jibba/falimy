import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Toggle({
  options,
  value,
  onChange,
  disabled = false,
  fullWidth = true,
}: ToggleProps) {
  return (
    <View style={[styles.toggleContainer, !fullWidth && styles.toggleContainerAuto]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.toggleButton,
            !fullWidth && styles.toggleButtonAuto,
            value === option.value && styles.toggleButtonActive,
            disabled && styles.toggleButtonDisabled,
          ]}
          onPress={() => onChange(option.value)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.toggleText,
              value === option.value && styles.toggleTextActive,
              disabled && styles.toggleTextDisabled,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: theme.colors.backgroundAccent,
    borderRadius: theme.borderRadiusSm / 2,
    padding: theme.spacing[1],
    width: "100%",
  },
  toggleContainerAuto: {
    alignSelf: "center",
    width: "auto",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    alignItems: "center",
    borderRadius: theme.borderRadiusSm / 2,
  },
  toggleButtonAuto: {
    flex: 0,
    minWidth: 80,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.background,
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  toggleText: {
    color: theme.colors.grey,
    fontSize: theme.fontSizes.xs,
  },
  toggleTextActive: {
    color: theme.colors.typography,
    fontWeight: "500",
  },
  toggleTextDisabled: {
    color: theme.colors.greyDark,
  },
}));

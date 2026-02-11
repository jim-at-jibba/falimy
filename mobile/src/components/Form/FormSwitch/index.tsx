import {
  type FieldValues,
  type UseControllerProps,
  useController,
  useFormContext,
} from "react-hook-form";
import { Platform, Switch, type SwitchProps, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface Props<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
  label: string; // Label is required for a switch
  switchProps?: Omit<SwitchProps, "value" | "onValueChange">; // Allow passing additional Switch props
  disabled?: boolean;
}

export const FormSwitch = <TFieldValues extends FieldValues>({
  name,
  label,
  switchProps,
  disabled = false,
}: Props<TFieldValues>) => {
  const { theme } = useUnistyles();
  const { control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={Boolean(field.value)}
        onValueChange={field.onChange}
        trackColor={{ false: theme.colors.grey, true: theme.colors.primary }}
        thumbColor={Platform.OS === "android" ? theme.colors.accentLight : ""}
        ios_backgroundColor={theme.colors.grey}
        disabled={disabled}
        {...switchProps}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing[2],
  },
  label: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
    fontFamily: theme.fontFamily.regular,
    marginRight: theme.spacing[4],
  },
}));

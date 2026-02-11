import { Check } from "lucide-react-native";
import {
  type FieldValues,
  type UseControllerProps,
  useController,
  useFormContext,
} from "react-hook-form";
import { Pressable } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface Props<TFieldValues extends FieldValues>
  extends Omit<UseControllerProps<TFieldValues>, "control"> {
  disabled?: boolean;
}

export const FormCheckbox = <TFieldValues extends FieldValues>({
  name,
  disabled = false,
}: Props<TFieldValues>) => {
  const { theme } = useUnistyles();
  const { formState, control } = useFormContext();
  const { field } = useController({ name, control });

  return (
    <Pressable
      onPress={() => !disabled && field.onChange(!field.value)}
      style={[
        styles.container,
        field.value && styles.containerChecked,
        disabled && styles.containerDisabled,
      ]}
    >
      {field.value && (
        <Check size={16} color={disabled ? theme.colors.grey : theme.colors.background} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    height: 24,
    width: 24,
    borderRadius: theme.borderRadiusSm,
    borderWidth: 2,
    borderColor: theme.colors.grey,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  containerChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  containerDisabled: {
    opacity: 0.5,
  },
}));

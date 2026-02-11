import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  type FieldValues,
  type UseControllerProps,
  useController,
  useFormContext,
} from "react-hook-form";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { FormError } from "../FormError";

export interface SelectOption {
  label: string;
  value: string;
}

interface Props<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  disableErrors?: boolean;
}

export const FormSelect = <TFieldValues extends FieldValues>({
  name,
  options,
  placeholder = "Select an option",
  disabled = false,
  disableErrors = false,
}: Props<TFieldValues>) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useUnistyles();
  const { formState } = useFormContext();
  const { field, fieldState } = useController({ name });

  const errors = disableErrors ? undefined : formState?.errors[name];
  const selectedOption = options.find((option) => option.value === field.value);

  const handleSelect = (value: string) => {
    field.onChange(value);
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.container(!!errors, pressed), disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.selectedText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={theme.colors.grey} />
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        index === options.length - 1 && styles.lastOptionItem,
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionText,
                            item.value === field.value && styles.selectedItemText,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.value === field.value && (
                          <Check size={18} color={theme.colors.primary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.fieldInfoContainer}>
        {errors ? <FormError message={errors?.message} /> : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: (hasErrors: boolean, isPressed: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    height: theme.inputHeight,
    borderRadius: theme.borderRadiusSm,
    backgroundColor: theme.colors.greyBackground,
    borderWidth: hasErrors ? 1 : 0,
    borderColor: hasErrors ? theme.colors.error : "transparent",
    opacity: isPressed ? 0.8 : 1,
  }),
  disabled: {
    opacity: 0.5,
  },
  selectedText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
    fontFamily: theme.fontFamily.regular,
  },
  placeholderText: {
    color: theme.colors.grey,
  },
  fieldInfoContainer: {
    marginTop: theme.spacing[1],
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadiusSm,
    padding: theme.spacing[2],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionItem: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.greyBackground,
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
    fontFamily: theme.fontFamily.regular,
  },
  selectedItemText: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
}));

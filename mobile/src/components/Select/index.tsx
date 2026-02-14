import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
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

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | null;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error,
}: SelectProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { theme } = useUnistyles();

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    if (onChange) {
      onChange(selectedValue);
    }
    setModalVisible(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.container(pressed), disabled && styles.disabled]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={selectedOption ? `Selected: ${selectedOption.label}` : placeholder}
        accessibilityHint="Opens a menu to select an option"
        accessibilityState={{ disabled, expanded: modalVisible }}
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
        accessibilityViewIsModal={true}
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
                      accessibilityRole="radio"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: item.value === value }}
                    >
                      <View style={styles.optionContent}>
                        <Text
                          style={[
                            styles.optionText,
                            item.value === value && styles.selectedItemText,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {item.value === value && <Check size={18} color={theme.colors.primary} />}
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
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: (isPressed: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    opacity: isPressed ? 0.8 : 1,
    backgroundColor: theme.colors.greyBackground,
    borderRadius: theme.borderRadiusSm,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
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
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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

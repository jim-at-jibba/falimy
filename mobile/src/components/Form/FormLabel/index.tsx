import { Text, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface Props {
  label: string;
  additionalStyles?: TextStyle;
}

export const FormLabel = ({ label, additionalStyles = {} }: Props) => {
  return <Text style={[styles.textInput, additionalStyles]}>{label}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  textInput: {
    fontSize: theme.fontSizes.xs,
    fontWeight: "700",
    color: theme.colors.greyDark,
    marginBottom: theme.spacing[3],
  },
}));

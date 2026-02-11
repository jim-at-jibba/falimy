import { Text, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface DefaultTextProps {
  text: string;
  additionalStyles?: TextStyle;
}
export const LabelText = ({ text, additionalStyles }: DefaultTextProps) => {
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography,
    marginBottom: 10,
  },
}));

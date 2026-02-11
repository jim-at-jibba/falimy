import { Text, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface SmallTextProps {
  text: string;
  additionalStyles?: TextStyle;
}
export const SmallText = ({ text, additionalStyles }: SmallTextProps) => {
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.xs,
    fontWeight: 400,
    fontFamily: theme.fontFamily.body,
  },
}));

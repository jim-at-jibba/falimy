import { Text, type TextStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";

interface DefaultTextProps {
  text: string;
  additionalStyles?: TextStyle | TextStyle[];
  numberOfLines?: number;
}
export const DefaultText = ({ text, additionalStyles, numberOfLines }: DefaultTextProps) => {
  const combinedStyles = Array.isArray(additionalStyles)
    ? [styles.text, ...additionalStyles]
    : [styles.text, additionalStyles];

  return (
    <Text style={combinedStyles} numberOfLines={numberOfLines}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    lineHeight: 22,
    fontWeight: 400,
    fontFamily: theme.fontFamily.body,
  },
}));

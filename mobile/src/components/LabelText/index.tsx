import { Text, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface DefaultTextProps {
  text: string;
  additionalStyles?: TextStyle;
}
export const LabelText = ({ text, additionalStyles }: DefaultTextProps) => {
  const { styles } = useStyles(stylesheet);
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const stylesheet = createStyleSheet((theme, runtime) => ({
  text: {
    fontSize: theme.fontSizes.md,
    lineHeight: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography,
    marginBottom: 10,
  },
}));

import { Text, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface SmallTextProps {
  text: string;
  additionalStyles?: TextStyle;
}
export const SmallText = ({ text, additionalStyles }: SmallTextProps) => {
  const { styles } = useStyles(stylesheet);
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const stylesheet = createStyleSheet((theme, runtime) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.xs,
    fontWeight: 400,
    fontFamily: theme.fontFamily.body,
  },
}));

import { Text, TextStyle } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface TitleProps {
  text: string;
  additionalStyles?: TextStyle | TextStyle[];
}
const Title = ({ text, additionalStyles }: TitleProps) => {
  const { styles } = useStyles(stylesheet);
  return <Text style={[styles.text, additionalStyles]}>{text}</Text>;
};

const stylesheet = createStyleSheet((theme, runtime) => ({
  text: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.lg,
    lineHeight: 38,
    fontWeight: 700,
    fontFamily: theme.fontFamily.bold,
  },
}));

export default Title;

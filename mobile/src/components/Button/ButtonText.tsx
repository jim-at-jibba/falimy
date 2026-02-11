import { DefaultText } from "@/components/DefaultText";
import { createStyleSheet, useStyles } from "react-native-unistyles";

interface ButtonTextProps {
  label: string;
  variant?: "primary" | "secondary" | "social";
}

export default function ButtonText({ label, variant = "primary" }: ButtonTextProps) {
  const { styles } = useStyles(stylesheet);
  return <DefaultText additionalStyles={styles[variant]} text={label} />;
}

const stylesheet = createStyleSheet(theme => ({
  primary: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
  secondary: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
  social: {
    color: theme.colors.typography,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    lineHeight: 24,
  },
}));

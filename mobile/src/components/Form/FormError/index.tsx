import { SmallText } from "@/components/SmallText";
import { AlertCircle } from "lucide-react-native";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { View } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import React from "react";

interface Props {
  message?: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
}

export const FormError = ({ message }: Props) => {
  if (!message) return null;
  const { styles, theme } = useStyles(stylesheet);

  const messageText =
    typeof message === "string"
      ? message
      : typeof message.message === "string"
        ? message.message
        : "An error occurred";

  return (
    <>
      {messageText ? (
        <View style={styles.container}>
          <AlertCircle size={20} color={theme.colors.error} />
          <SmallText text={messageText} additionalStyles={styles.text} />
        </View>
      ) : null}
    </>
  );
};

const stylesheet = createStyleSheet(theme => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: theme.colors.error + "50",
  },
  text: {
    marginLeft: theme.spacing[2],
    color: theme.colors.error,
    fontWeight: "600",
  },
}));

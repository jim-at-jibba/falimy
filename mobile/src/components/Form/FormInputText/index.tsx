import React, { RefObject, useState } from "react";
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  TouchableOpacity,
} from "react-native";
import { useController, useFormContext, FieldValues, UseControllerProps } from "react-hook-form";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { Eye, EyeOff } from "lucide-react-native";
import { FormError } from "../FormError";

interface Props<TFieldValues extends FieldValues> extends UseControllerProps<TFieldValues> {
  label?: string;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  forwardRef?: RefObject<TextInput>;
  errorTestID?: string;
  lightStyle?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  numberOfLines?: number;
  textInputStyle?: TextStyle;
  multiline?: boolean;
  editable?: boolean;
  textContentType?: TextInputProps["textContentType"];
  testID?: string;
  secureTextEntry?: boolean;
  onSubmitEditing?: () => void;
  disableErrors?: boolean;
  maxLength?: number;
  fieldInfo?: string;
}

export const FormInputText = <TFieldValues extends FieldValues>(props: Props<TFieldValues>) => {
  const {
    name,
    forwardRef,
    errorTestID,
    label,
    lightStyle,
    textInputStyle,
    returnKeyType = "done",
    editable = true,
    disableErrors = false,
    fieldInfo,
    multiline = false,
    placeholder,
    secureTextEntry,
    ...inputProps
  } = props;

  const [hasFocus, setHasFocus] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { styles, theme } = useStyles(stylesheet);
  const { formState } = useFormContext();
  const { field, fieldState } = useController({ name });

  const errors = disableErrors ? undefined : formState?.errors[name];
  const touched = fieldState.isTouched || formState.isSubmitted;

  return (
    <>
      <View style={styles.container(hasFocus, !!errors)}>
        <TextInput
          style={[styles.textInput, textInputStyle, !editable && styles.disabled]}
          value={field.value?.toString()}
          onChangeText={text => field.onChange(text)}
          autoCapitalize={props.autoCapitalize || "sentences"}
          ref={forwardRef}
          onBlur={() => {
            field.onBlur();
            setHasFocus(false);
          }}
          onFocus={() => setHasFocus(true)}
          placeholderTextColor={theme.colors.grey}
          placeholder={placeholder}
          returnKeyType={returnKeyType}
          editable={editable}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...inputProps}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={theme.colors.grey} />
            ) : (
              <Eye size={20} color={theme.colors.grey} />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.fieldInfoContainer}>
        {errors ? <FormError message={errors?.message} /> : null}
      </View>
    </>
  );
};

const stylesheet = createStyleSheet(theme => ({
  container: (hasFocus: boolean, hasErrors: boolean) => ({
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadiusSm,
    backgroundColor: theme.colors.greyBackground,
    overflow: "hidden",
    borderWidth: hasErrors || hasFocus ? 1 : 0,
    borderColor: hasErrors ? theme.colors.error : theme.colors.primary,
  }),
  textInput: {
    flex: 1,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
    backgroundColor: "transparent",
    height: theme.inputHeight,
    fontFamily: theme.fontFamily.regular,
  },
  iconContainer: {
    paddingRight: theme.spacing[4],
  },
  disabled: {
    opacity: 0.5,
  },
  fieldInfoContainer: {
    marginTop: theme.spacing[1],
    height: 30,
  },
}));

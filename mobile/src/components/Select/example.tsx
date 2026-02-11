import React, { useState } from "react";
import { View, Text } from "react-native";
import { createStyleSheet, useStyles } from "react-native-unistyles";
import { Select, SelectOption } from "./index";

export const SelectExample = () => {
  const { styles, theme } = useStyles(stylesheet);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [error, setError] = useState<string | undefined>(undefined);

  const options: SelectOption[] = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
    { label: "Option 4", value: "option4" },
  ];

  const handleChange = (value: string) => {
    setSelectedValue(value);
    // Example of validation
    if (value === "option3") {
      setError("This option is not recommended");
    } else {
      setError(undefined);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Example</Text>

      <Select
        options={options}
        value={selectedValue}
        onChange={handleChange}
        placeholder="Choose an option"
        error={error}
      />

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>Selected value: {selectedValue || "None"}</Text>
      </View>
    </View>
  );
};

const stylesheet = createStyleSheet(theme => ({
  container: {
    padding: theme.spacing[4],
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: "600",
    marginBottom: theme.spacing[4],
    color: theme.colors.typography,
  },
  resultContainer: {
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.greyBackground,
    borderRadius: theme.borderRadiusSm,
  },
  resultText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.typography,
  },
}));

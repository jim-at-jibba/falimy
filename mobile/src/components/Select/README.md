# Select Component

A standalone select component for React Native applications, styled with react-native-unistyles.

## Features

- Modal-based selection interface
- Customizable options with labels and values
- Error state handling
- Disabled state
- Placeholder text
- Fully typed with TypeScript

## Usage

```tsx
import React, { useState } from "react";
import { View } from "react-native";
import { Select, SelectOption } from "@/components/Select";

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const options: SelectOption[] = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];

  return (
    <View>
      <Select
        options={options}
        value={selectedValue}
        onChange={setSelectedValue}
        placeholder="Choose an option"
        error={selectedValue === "option3" ? "This option is not recommended" : undefined}
      />
    </View>
  );
};
```

## Props

| Prop          | Type                      | Default              | Description                                |
| ------------- | ------------------------- | -------------------- | ------------------------------------------ |
| `options`     | `SelectOption[]`          | Required             | Array of options to display in the select  |
| `value`       | `string`                  | `undefined`          | Currently selected value                   |
| `onChange`    | `(value: string) => void` | `undefined`          | Callback function when selection changes   |
| `placeholder` | `string`                  | `"Select an option"` | Text to display when no option is selected |
| `disabled`    | `boolean`                 | `false`              | Whether the select is disabled             |
| `error`       | `string`                  | `undefined`          | Error message to display below the select  |

## SelectOption Interface

```tsx
export interface SelectOption {
  label: string;
  value: string;
}
```

## Styling

The component uses react-native-unistyles for styling and follows the theme configuration of your application. It uses the following theme properties:

- `theme.colors.background`
- `theme.colors.typography`
- `theme.colors.grey`
- `theme.colors.greyBackground`
- `theme.colors.error`
- `theme.colors.primary`
- `theme.colors.accentLight`
- `theme.colors.black`
- `theme.spacing`
- `theme.borderRadiusSm`
- `theme.borderRadiusMd`
- `theme.fontSizes`
- `theme.fontFamily`
- `theme.inputHeight`

import { StyleSheet, UnistylesRuntime } from "react-native-unistyles";
import { breakpoints } from "@/styles/breakpoints";
import { nf } from "./utils";

// Add any custom base style
const base = {
  // USAGE: padding: theme.margins.lg
  margins: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    superLarge: 20,
    tvLike: 24,
  },
  fontSizes: {
    // fontSize: theme.fontSizes.lg
    xxs: nf(10),
    xs: nf(12),
    sm: nf(14),
    md: nf(16),
    lg: nf(18),
    xl: nf(24),
    xxl: nf(32),
  },
  spacing: {
    // USAGE: padding: theme.spacing(1),
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 56,
    8: 64,
  },
  fontFamily: {
    bold: "Montserrat_700Bold",
    semiBold: "Montserrat_600SemiBold",
    medium: "Montserrat_500Medium",
    regular: "Montserrat_400Regular",
    body: "Montserrat_400Regular",
  },
} as const;

export const lightTheme = {
  colors: {
    primary: "#b4dbfa",
    accentLight: "#dad4fc",
    backgroundAccent: "#2c2c2c",
    background: "#fff",
    blue: "#b4dbfa",
    purple: "#dad4fc",
    orange: "#fadeaf",
    pink: "#f8d5f4",
    green: "#b2ecca",
    black: "#2C2C2C",
    greyDark: "#4C4C4C",
    grey: "#B1B8BE",
    greySoft: "#D2D9DE",
    greyLight: "#EDF0F2",
    greyBackground: "#F7F7F7",
    white: "#FFFFFF",
    error: "#FF0000",
    errorBackground: "#FFC3C9",
    success: "#20D942",
    successBackground: "#BFF4C9",
    warning: "#FFBC26",
    warningBackground: "#FFEFC9",
    info: "#66ADFF",
    typography: "#000000",
  },
  margins: base.margins,
  fontSizes: base.fontSizes,
  spacing: base.spacing,
  fontFamily: base.fontFamily,
  gap: 8,
  borderRadiusXs: 8,
  borderRadiusSm: 16,
  borderRadiusMd: 32,
  borderRadiusLg: 50,
  buttonHeight: 56,
  listItemHeight: 80,
  bigButtonHeight: 72,
  inputHeight: 56,
} as const;

export const darkTheme = {
  colors: {
    typography: "#ffffff",
    primary: "#b4dbfa",
    accentLight: "#dad4fc",
    backgroundAccent: "#2c2c2c",
    blue: "#b4dbfa",
    purple: "#dad4fc",
    orange: "#fadeaf",
    pink: "#f8d5f4",
    green: "#b2ecca",
    background: "#0D0D0D",
    black: "#2C2C2C",
    greyDark: "#4C4C4C",
    grey: "#B1B8BE",
    greySoft: "#D2D9DE",
    greyLight: "#EDF0F2",
    greyBackground: "#F7F7F7",
    white: "#FFFFFF",
    error: "#FF0000",
    errorBackground: "#FFC3C9",
    success: "#20D942",
    successBackground: "#BFF4C9",
    warning: "#FFBC26",
    warningBackground: "#FFEFC9",
    info: "#66ADFF",
  },
  fontFamily: base.fontFamily,
  margins: base.margins,
  fontSizes: base.fontSizes,
  spacing: base.spacing,
  gap: 8,
  borderRadiusXs: 8,
  borderRadiusSm: 16,
  borderRadiusMd: 32,
  borderRadiusLg: 50,
  buttonHeight: 56,
  listItemHeight: 80,
  bigButtonHeight: 72,
  inputHeight: 56,
} as const;

// If you’re using TypeScript, create types for your breakpoints and/or themes. This step is required to achieve perfect Intellisense support across all StyleSheets.
type AppBreakpoints = typeof breakpoints;
type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};
const appThemes: AppThemes = {
  light: lightTheme,
  dark: darkTheme,
};
declare module "react-native-unistyles" {
  export interface UnistylesBreakpoints extends AppBreakpoints {}
  export interface UnistylesThemes extends AppThemes {}
}

UnistylesRuntime.setRootViewBackgroundColor("black");

// or with adaptive themes
const settings = {
  initialTheme: "light",
  // adaptiveThemes: true,
};

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings,
});

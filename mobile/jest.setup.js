// Mock expo-secure-store
jest.mock("expo-secure-store", () => {
  const store = {};
  return {
    getItemAsync: jest.fn((key) => Promise.resolve(store[key] ?? null)),
    setItemAsync: jest.fn((key, value) => {
      store[key] = value;
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key) => {
      delete store[key];
      return Promise.resolve();
    }),
  };
});

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  getRandomBytesAsync: jest.fn((length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(bytes);
  }),
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      name: "falimy",
      slug: "falimy",
    },
  },
}));

// Mock expo-font
jest.mock("expo-font", () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
  useFonts: jest.fn(() => [true, null]),
}));

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: { Success: "success", Warning: "warning", Error: "error" },
}));

// Mock expo-location
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  requestBackgroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } })
  ),
  watchPositionAsync: jest.fn(() => Promise.resolve({ remove: jest.fn() })),
  Accuracy: { Balanced: 3, High: 4, Highest: 5, Low: 2, Lowest: 1 },
}));

// Mock expo-camera
jest.mock("expo-camera", () => ({
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
  CameraView: "CameraView",
}));

// Mock expo-task-manager
jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
}));

// Mock react-native-unistyles
jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (styles) => styles,
    configure: jest.fn(),
  },
  UnistylesRuntime: {
    themeName: "light",
    setTheme: jest.fn(),
  },
  mq: jest.fn(),
}));

// Mock react-native-sse
jest.mock("react-native-sse", () => jest.fn());

// Mock sonner-native
jest.mock("sonner-native", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
  Toaster: "Toaster",
}));

// Mock @nozbe/watermelondb
jest.mock("@nozbe/watermelondb", () => ({
  Database: jest.fn(),
  Model: class Model {},
  Q: {
    where: jest.fn(),
    and: jest.fn(),
    or: jest.fn(),
    on: jest.fn(),
    oneOf: jest.fn(),
    notEq: jest.fn(),
    sortBy: jest.fn(),
    asc: "asc",
    desc: "desc",
  },
  tableSchema: jest.fn((schema) => schema),
  appSchema: jest.fn((schema) => schema),
}));

jest.mock("@nozbe/watermelondb/decorators", () => ({
  field: jest.fn(() => () => {}),
  text: jest.fn(() => () => {}),
  date: jest.fn(() => () => {}),
  readonly: jest.fn(() => () => {}),
  relation: jest.fn(() => () => {}),
  children: jest.fn(() => () => {}),
  action: jest.fn(() => () => {}),
}));

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: View,
    Marker: View,
    Circle: View,
    PROVIDER_GOOGLE: "google",
  };
});

// Mock react-native-unistyles
jest.mock("react-native-unistyles", () => ({
  StyleSheet: {
    create: (stylesOrFn) => {
      if (typeof stylesOrFn === "function") {
        return stylesOrFn({
          colors: {
            primary: "#2BCCBD",
            white: "#fff",
            typography: "#000",
            grey: "#999",
            greyBackground: "#f5f5f5",
            greyDark: "#666",
            error: "#ff0000",
            background: "#fff",
            backgroundAccent: "#f0f0f0",
          },
          gap: 8,
          borderRadiusSm: 8,
          borderRadiusMd: 12,
          buttonHeight: 48,
          fontSizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 },
          fontFamily: { regular: "System", semiBold: "System", bold: "System" },
          spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
        });
      }
      return stylesOrFn;
    },
    configure: jest.fn(),
  },
  UnistylesRuntime: {
    themeName: "light",
    setTheme: jest.fn(),
    setRootViewBackgroundColor: jest.fn(),
  },
  useUnistyles: jest.fn(() => ({
    theme: {
      colors: {
        primary: "#2BCCBD",
        white: "#fff",
        typography: "#000",
        grey: "#999",
        error: "#ff0000",
        background: "#fff",
        backgroundAccent: "#f0f0f0",
        greyBackground: "#f5f5f5",
        greyDark: "#666",
      },
      gap: 8,
      borderRadiusSm: 8,
      borderRadiusMd: 12,
      buttonHeight: 48,
      fontSizes: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20 },
      fontFamily: { regular: "System", semiBold: "System", bold: "System" },
      spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20 },
    },
  })),
  mq: jest.fn(),
}));

// Mock lucide-react-native
jest.mock("lucide-react-native", () => ({
  AlertTriangle: "AlertTriangle",
  ChevronLeft: "ChevronLeft",
  ChevronRight: "ChevronRight",
  Check: "Check",
}));

// Mock expo-haptics with ImpactFeedbackStyle
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium", Heavy: "heavy" },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
}));

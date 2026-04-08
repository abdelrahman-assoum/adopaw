import { blue, coral, error, neutral, success, warning } from "./colors";

import { MD3DarkTheme } from "react-native-paper";
import { fonts, fontSizes } from "./fonts";
import { radii } from "./radii";
import { spacing } from "./spacing";
import { customTypography } from "./typograhpy";

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: radii.md,
  colors: {
    ...MD3DarkTheme.colors,
    // Base colors
    primary: blue[500],
    accent: coral[500],
    background: "#121417",
    surface: "#24282D",
    text: neutral[100],
    disabled: neutral[600],
    placeholder: neutral[400],
    onSurface: neutral[100],
    backdrop: "rgba(255, 255, 255, 0.3)",
    notification: coral[400],
    onPrimary: neutral[100],
    onAccent: neutral[100], // optional, for accent buttons
    onBackground: neutral[100],
    // Semantic base colors
    success: success[400],
    warning: warning[400],
    error: error[400],

    // Full palette
    palette: {
      blue,
      coral,
      neutral,
      success,
      warning,
      error,
    },
  },
  fonts: customTypography,
  animation: {
    scale: 1,
  },
  custom: {
    fontSizes,
    spacing,
    radii,
    semantic: {
      success: {
        bg: success[900],
        text: success[100],
        border: success[500],
      },
      warning: {
        bg: warning[900],
        text: warning[100],
        border: warning[500],
      },
      error: {
        bg: error[900],
        text: error[100],
        border: error[500],
      },
    },
  },
};

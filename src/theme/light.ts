import { DefaultTheme } from "react-native-paper";
import { blue, coral, error, neutral, success, warning } from "./colors";
import { fonts, fontSizes } from "./fonts";
import { radii } from "./radii";
import { spacing } from "./spacing";
import { customTypography } from "./typograhpy";

export const CustomLightTheme = {
  ...DefaultTheme,
  dark: false,
  roundness: radii.md,
  colors: {
    ...DefaultTheme.colors,
    // Base colors
    primary: blue[500],
    accent: coral[500],
    background: "#EDF1F4",
    surface: "#FFFFFF",
    text: neutral[800],
    disabled: neutral[400],
    placeholder: neutral[500],
    onSurface: neutral[900],
    backdrop: "rgba(0, 0, 0, 0.3)",
    notification: coral[500],

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
        bg: success[100],
        text: success[800],
        border: success[500],
      },
      warning: {
        bg: warning[100],
        text: warning[800],
        border: warning[500],
      },
      error: {
        bg: error[100],
        text: error[800],
        border: error[500],
      },
    },
  },
};

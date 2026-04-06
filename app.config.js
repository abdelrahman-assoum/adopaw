require("dotenv").config({ path: ".env.local" });

module.exports = ({ config }) => {
  const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) {
    console.warn("[app.config] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");
  }
  return {
    ...config,
    plugins: [...(config.plugins || []), "expo-font", "expo-web-browser"],
    android: {
      config: {
        googleMaps: { apiKey: googleMapsKey || "" },
      },
      softwareKeyboardLayoutMode: "pan",
    },
    ios: {
      config: {
        googleMapsApiKey: googleMapsKey,
      },
    },
    extras: {
      googleMapsApiKey: googleMapsKey,
    },
  };
};

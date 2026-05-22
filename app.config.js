require("dotenv").config({ path: ".env.local" });

module.exports = ({ config }) => {
  const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) {
    console.warn("[app.config] Missing EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");
  }
  return {
    ...config,
    plugins: [...(config.plugins || []), "expo-web-browser"],
    android: {
      ...config.android, // preserve package, adaptiveIcon, etc. from app.json
      config: {
        googleMaps: { apiKey: googleMapsKey || "" },
      },
      softwareKeyboardLayoutMode: "resize",
    },
    ios: {
      ...config.ios, // preserve supportsTablet etc. from app.json
      config: {
        googleMapsApiKey: googleMapsKey,
      },
    },
    extras: {
      googleMapsApiKey: googleMapsKey,
    },
  };
};

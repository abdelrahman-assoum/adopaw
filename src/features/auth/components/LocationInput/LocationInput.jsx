import React, { useState } from "react";
import { StyleSheet, View, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Text, useTheme } from "react-native-paper";
import * as Location from "expo-location";
import { I18nManager as RNI18nManager } from "react-native";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function LocationInput({
  onLocationRetrieved,
  error,
  errorMessage,
}) {
  const [displayAddress, setDisplayAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const isRTL = RNI18nManager.isRTL;
  const {t} = useTranslationLoader("common")

  const getLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLoading(false);
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = [loc.coords.longitude, loc.coords.latitude];

      const geoJson = {
        type: "Point",
        coordinates: coords,
      };

      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords[1],
        longitude: coords[0],
      });
      console.log(geocode)
      const address = geocode?.[0];
      const readable = address
        ? `${address.city || address.region || ""}, ${address.country || ""}`
        : "Unknown location";

      setDisplayAddress(readable);
      onLocationRetrieved({ geoJson, readable });
    } catch (err) {
      console.error("Location error:", err);
      alert("Failed to get location.");
    }
    setLoading(false);
  };

  return (
    <View style={styles.inputWrapper}>
      <TouchableWithoutFeedback onPress={getLocation}>
        <View>
          <Ionicons
            name="locate-outline"
            size={20}
            color={colors.text}
            style={styles.iconStart}
          />

          <TextInput
            value={loading ? t("location.loading") : displayAddress}
            placeholder={t("location.current")}
            editable={false}
            mode="outlined"
            pointerEvents="none"
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                textAlign: isRTL ? "right" : "left",
                paddingStart: 40,
                paddingEnd: 20,
              },
            ]}
            outlineColor={error ? colors.error : "rgba(169, 169, 169, 0.5)"}
            error={error}
          />
        </View>
      </TouchableWithoutFeedback>

      {error && (
        <Text style={{ color: colors.error, marginTop: 4, marginStart: 8 }}>
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    position: "relative",
    marginVertical: 6,
  },
  input: {
    borderRadius: 100,
  },
  iconStart: {
    position: "absolute",
    start: 20,
    top: 18,
    zIndex: 1,
  },
});

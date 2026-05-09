import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

const ICON_SIZE = 80;

export default function PawLoader({ text }) {
  const theme = useTheme();
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fillAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(250),
        Animated.timing(fillAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.delay(200),
      ])
    ).start();
  }, []);

  const animatedHeight = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, ICON_SIZE],
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {/* Outline base — always visible */}
        <Ionicons
          name="paw-outline"
          size={ICON_SIZE}
          color={theme.colors.outlineVariant ?? "rgba(0,0,0,0.12)"}
        />

        {/* Brand-colored fill rising from bottom */}
        <Animated.View
          style={[styles.fillClip, { height: animatedHeight }]}
        >
          <View style={styles.fillIcon}>
            <Ionicons name="paw" size={ICON_SIZE} color={theme.colors.primary} />
          </View>
        </Animated.View>
      </View>

      {text ? (
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {text}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: "relative",
  },
  fillClip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  fillIcon: {
    position: "absolute",
    bottom: 0,
  },
  label: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
});

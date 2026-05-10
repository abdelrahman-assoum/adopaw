import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TYPE_CONFIG = {
  success: {
    bg: "#D7F1E4",
    iconBg: "#BCE8D3",
    color: "#1B5D3D",
    icon: "checkmark-circle",
  },
  error: {
    bg: "#F6D7D7",
    iconBg: "#F0BCBC",
    color: "#691B1B",
    icon: "close-circle",
  },
  warning: {
    bg: "#FFF1DB",
    iconBg: "#FFE7C4",
    color: "#553D1A",
    icon: "warning",
  },
  info: {
    bg: "#DBEBF9",
    iconBg: "#C4DEF5",
    color: "#1A344B",
    icon: "information-circle",
  },
};

export default function AppSnackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
  type = "info",
}) {
  const insets = useSafeAreaInsets();
  const slideY = useRef(new Animated.Value(-300)).current;
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  const slideOut = (callback) => {
    Animated.timing(slideY, {
      toValue: -300,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => callback?.());
  };

  useEffect(() => {
    if (!visible) return;

    slideY.setValue(-300);
    Animated.spring(slideY, {
      toValue: 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      slideOut(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
  }, [visible, message]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 12,
          backgroundColor: config.bg,
          transform: [{ translateY: slideY }],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: config.iconBg }]}>
        <Ionicons name={config.icon} size={18} color={config.color} />
      </View>

      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {message}
      </Text>

      <TouchableOpacity onPress={() => slideOut(onDismiss)} hitSlop={10}>
        <Ionicons name="close" size={16} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
});

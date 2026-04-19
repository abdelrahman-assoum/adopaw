import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

const ORDER = ["home", "map", "chats", "profile"];

const ICON_SIZE = 28;
const FAB_SIZE = 70;
const FAB_ICON = 45;
const SPACER = FAB_SIZE + 9;

function iconFor(name, focused) {
  switch (name) {
    case "home":    return focused ? "home"                  : "home-outline";
    case "map":     return focused ? "location"              : "location-outline";
    case "chats":   return focused ? "chatbubble-ellipses"   : "chatbubble-ellipses-outline";
    case "profile": return focused ? "person"                : "person-outline";
    default:        return "ellipse-outline";
  }
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("home");

  const routes = ORDER.map((n) => state.routes.find((r) => r.name === n)).filter(Boolean);
  const left  = routes.slice(0, 2);
  const right = routes.slice(2);

  const isFocused = (route) =>
    state.index === state.routes.findIndex((r) => r.key === route.key);

  const renderTab = (route) => {
    const focused = isFocused(route);
    const label = t(`tabs.${route.name}`) ?? route.name;
    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(route.name)}
      >
        <Ionicons
          name={iconFor(route.name, focused)}
          size={ICON_SIZE}
          color={focused ? theme.colors.primary : theme.colors.palette.neutral[400]}
        />
        <Text
          style={{
            fontFamily: theme.fonts.labelMedium.fontFamily,
            fontSize: theme.fonts.labelMedium.fontSize,
            lineHeight: theme.fonts.labelMedium.lineHeight,
            fontWeight: "600",
            marginTop: 4,
            color: focused ? theme.colors.primary : theme.colors.palette.neutral[400],
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom - 12, backgroundColor: theme.colors.surface },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.side}>{left.map(renderTab)}</View>
        <View style={{ width: SPACER }} />
        <View style={styles.side}>{right.map(renderTab)}</View>
      </View>

      <View
        style={[styles.fabOverlay, { bottom: Math.max(insets.bottom, 8) + 12 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => router.push("/(tabs)/addPet")}
          style={styles.fab}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.palette.blue[400]]}
            start={{ x: 0.5, y: 0.0 }}
            end={{ x: 0.5, y: 1.0 }}
            style={styles.fabCircle}
          >
            <MaterialIcons name="add" size={FAB_ICON} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bar: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: -2 },
      },
    }),
  },
  fabOverlay: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  side: { flexDirection: "row", alignItems: "center" },
  tab: { width: 76, alignItems: "center", justifyContent: "center" },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  fabCircle: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

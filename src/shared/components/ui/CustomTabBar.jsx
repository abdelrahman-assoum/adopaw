import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/src/features/chats/hooks/useCurrentUser";
import { getUnreadCount } from "@/src/features/chats/services/chatService";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

const ORDER = ["home", "map", "chats", "profile"];

const ICON_SIZE = 28;
const FAB_SIZE = 70;
const FAB_ICON = 45;
const SPACER = FAB_SIZE + 9;

function iconFor(name, focused) {
  switch (name) {
    case "home":
      return focused ? "home" : "home-outline";
    case "map":
      return focused ? "location" : "location-outline";
    case "chats":
      return focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
    case "profile":
      return focused ? "person" : "person-outline";
    default:
      return "ellipse-outline";
  }
}

export default function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("home");
  const userId = useCurrentUser();

  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    const fetchCount = async () => {
      try {
        const count = await getUnreadCount(userId);
        if (isMounted) setUnreadCount(count);
      } catch {}
    };

    fetchCount();

    // Re-fetch when any message is inserted or updated (is_read changes)
    const channel = supabase
      .channel(`unread-badge:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: TABLES.MESSAGES,
        },
        fetchCount,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: TABLES.MESSAGES,
        },
        fetchCount,
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId]);

  const routes = ORDER.map((n) =>
    state.routes.find((r) => r.name === n),
  ).filter(Boolean);
  const left = routes.slice(0, 2);
  const right = routes.slice(2);

  const isFocused = (route) =>
    state.index === state.routes.findIndex((r) => r.key === route.key);

  const renderTab = (route) => {
    const focused = isFocused(route);
    const label = t(`tabs.${route.name}`) ?? route.name;
    const isChats = route.name === "chats";
    const showBadge = isChats && unreadCount > 0;

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(route.name)}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={iconFor(route.name, focused)}
            size={ICON_SIZE}
            color={
              focused ? theme.colors.primary : theme.colors.palette.neutral[400]
            }
          />
          {showBadge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : String(unreadCount)}
              </Text>
            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: theme.fonts.labelMedium.fontFamily,
            fontSize: theme.fonts.labelMedium.fontSize,
            lineHeight: theme.fonts.labelMedium.lineHeight,
            fontWeight: "600",
            marginTop: 4,
            color: focused
              ? theme.colors.primary
              : theme.colors.palette.neutral[400],
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
        {
          paddingBottom: Math.max(insets.bottom, 0),
          backgroundColor: theme.colors.surface,
        },
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
  side: { flexDirection: "row", alignItems: "center", flex: 1 },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  iconWrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4083BB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Alexandria_700Bold",
    lineHeight: 13,
  },
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

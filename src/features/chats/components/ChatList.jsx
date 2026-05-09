import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCard";

export default function ChatList({
  chats = [],
  onPressChat,
  onLongPressChat,
  emptyTitle,
  emptySubtitle,
}) {
  const { t } = useTranslationLoader("chatlist");
  const { colors } = useTheme();

  const toPreview = useCallback(
    (chat) => {
      const last = chat?.lastMessage;
      if (!last) return "";
      if (last.type === "text") return last?.content?.text ?? "";
      if (last.type === "image") return t("photoLabel");
      return "";
    },
    [t]
  );

  const renderItem = ({ item }) => (
    <ChatCard
      key={item._id}
      avatar={item.avatar}
      name={item.name}
      message={toPreview(item)}
      timestamp={item.updatedAt ?? null}
      unreadCount={item.unreadCount ?? 0}
      onPress={() => onPressChat?.(item._id, item.name)}
      onLongPress={() => onLongPressChat?.(item._id, item.name)}
    />
  );

  return (
    <FlatList
      contentContainerStyle={[
        styles.list,
        chats.length === 0 && styles.listEmpty,
      ]}
      data={chats}
      keyExtractor={(item) => String(item._id)}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.headerWrap}>
          <AiAssistantCard />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Ionicons
            name="chatbubbles-outline"
            size={72}
            color={colors.outline ?? "#9ca3af"}
          />
          <Text
            variant="titleMedium"
            style={[styles.emptyTitle, { color: colors.onSurface }]}
          >
            {emptyTitle ?? t("emptyTitle")}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySub, { color: colors.onSurfaceVariant }]}
          >
            {emptySubtitle ?? t("emptySubtitle")}
          </Text>
        </View>
      }
      initialNumToRender={12}
      windowSize={10}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100, paddingTop: 8 },
  listEmpty: { flexGrow: 1 },
  headerWrap: { marginBottom: 4 },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
    paddingTop: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    textAlign: "center",
    fontWeight: "600",
  },
  emptySub: {
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 20,
  },
});

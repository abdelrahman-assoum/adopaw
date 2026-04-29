import { useCallback } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { List, Text } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import AiAssistantCard from "./AiAssistantCard";
import ChatCard from "./ChatCard";

export default function ChatList({
  chats = [],
  onPressChat,
  emptyTitle,
  emptySubtitle,
}) {
  const { t } = useTranslationLoader("chatlist");

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
    />
  );

  return (
    <FlatList
      contentContainerStyle={styles.list}
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
          <List.Icon icon="chat-outline" />
          <Text variant="titleMedium">{emptyTitle ?? t("emptyTitle")}</Text>
          <Text variant="bodyMedium" style={styles.emptySub}>
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
  headerWrap: { marginBottom: 4 },
  emptyWrap: { paddingTop: 24, paddingHorizontal: 20, gap: 6 },
  emptySub: { opacity: 0.7 },
});

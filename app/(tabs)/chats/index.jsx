import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatList from "@/src/features/chats/components/ChatList";
import { useCurrentUser } from "@/src/features/chats/hooks/useCurrentUser";
import {
  getUserChats,
  subscribeToUserChats,
} from "@/src/features/chats/services/chatService";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ChatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslationLoader("chatlist");
  const userId = useCurrentUser();

  const [initialLoading, setInitialLoading] = useState(true);
  const [chats, setChats] = useState([]);

  const fetchChats = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getUserChats(userId);
      setChats(data);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setInitialLoading(true);
    fetchChats().finally(() => setInitialLoading(false));
    const unsub = subscribeToUserChats(userId, fetchChats);
    return () => unsub();
  }, [userId, fetchChats]);

  // Re-fetch silently when returning from a chat so unread counts are fresh
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  const handleOpenChat = (chatId, name) =>
    router.push({ pathname: "/(tabs)/chats/[chatId]", params: { chatId, title: name } });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.heading, { paddingTop: insets.top + 16 }]}>
        <Text
          variant="headlineLarge"
          style={{ color: theme.colors.onSurface, fontFamily: "Alexandria_700Bold" }}
        >
          {t("chatsListTitle")}
        </Text>
      </View>

      {initialLoading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <ChatList chats={chats} onPressChat={handleOpenChat} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { paddingHorizontal: 20, paddingBottom: 8 },
});

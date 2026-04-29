import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ImageMessage from "@/src/features/chats/components/ImageMessage";
import MessageBubble from "@/src/features/chats/components/MessageBubble";
import ChatInput from "@/src/features/chats/components/ChatInput";
import { useCurrentUser } from "@/src/features/chats/hooks/useCurrentUser";
import {
  createChatChannel,
  getMessages,
  markMessagesRead,
  sendMessage,
} from "@/src/features/chats/services/chatService";
import { uploadImage } from "@/src/shared/services/supabase/upload";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ChatDetailScreen() {
  const { chatId } = useLocalSearchParams();
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("chatId");
  const userId = useCurrentUser();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const listRef = useRef(null);
  const channelRef = useRef(null);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  // Initial load
  useEffect(() => {
    if (!chatId) return;
    let isMounted = true;

    getMessages(String(chatId), 30, null)
      .then((res) => {
        if (!isMounted) return;
        setMessages(res.items);
        setNextCursor(res.nextCursor);
      })
      .catch((err) => console.error("Load messages:", err))
      .finally(() => { if (isMounted) setLoading(false); });

    return () => { isMounted = false; };
  }, [chatId]);

  // Mark messages read whenever this chat is open and userId is available
  useEffect(() => {
    if (!chatId || !userId) return;
    markMessagesRead(String(chatId), userId);
  }, [chatId, userId]);

  // Realtime channel
  useEffect(() => {
    if (!chatId || !userId) return;

    const { unsubscribe, sendTyping } = createChatChannel(String(chatId), {
      onMessage: (evt) => {
        if (evt.type === "new") {
          setMessages((prev) => {
            // Skip if already added locally (sender's own message)
            if (prev.some((m) => m._id === evt.message._id)) return prev;
            setTimeout(scrollToEnd, 50);
            return [...prev, evt.message];
          });
          if (evt.message.senderId !== userId) {
            markMessagesRead(String(chatId), userId).catch(() => {});
          }
        } else if (evt.type === "edit") {
          setMessages((prev) =>
            prev.map((m) => (m._id === evt.message._id ? evt.message : m))
          );
        } else if (evt.type === "delete") {
          setMessages((prev) => prev.filter((m) => m._id !== evt.messageId));
        }
      },
      onTyping: (payload) => {
        if (payload?.userId && payload.userId !== userId) {
          setIsPeerTyping(!!payload.isTyping);
        }
      },
    });

    channelRef.current = { sendTyping };
    return () => {
      unsubscribe();
      channelRef.current = null;
    };
  }, [chatId, userId, scrollToEnd]);

  const handleSend = useCallback(
    async (type, content) => {
      if (!userId || !chatId) return;
      try {
        let finalContent = content;
        if (type === "image" && content?.imageUrl?.startsWith("file://")) {
          const result = await uploadImage(content.imageUrl, "chat-images", "chats");
          finalContent = { imageUrl: result.signedUrl };
        }
        const msg = await sendMessage(String(chatId), { type, content: finalContent }, userId);
        setMessages((prev) => [...prev, msg]);
        setTimeout(scrollToEnd, 50);
      } catch (err) {
        console.error("Send failed:", err);
      }
    },
    [chatId, userId, scrollToEnd]
  );

  const handleTyping = useCallback(
    (isTyping) => channelRef.current?.sendTyping(userId, isTyping),
    [userId]
  );

  const loadOlder = useCallback(async () => {
    if (!nextCursor || !chatId) return;
    try {
      const res = await getMessages(String(chatId), 30, nextCursor);
      setMessages((prev) => [...res.items, ...prev]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.error("Load older:", err);
    }
  }, [chatId, nextCursor]);

  const renderItem = useCallback(
    ({ item }) =>
      item.type === "image" ? (
        <ImageMessage item={item} currentUserId={userId} />
      ) : (
        <MessageBubble item={item} currentUserId={userId} />
      ),
    [userId]
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <Text
        style={[
          styles.dateChip,
          { backgroundColor: palette.blue[400], color: palette.neutral[800] },
        ]}
      >
        {t("today")}
      </Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.05}
        onEndReached={loadOlder}
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews
        onContentSizeChange={scrollToEnd}
      />

      {isPeerTyping && (
        <Text style={[styles.typing, { color: theme.colors.outline }]}>
          {t("typing")}
        </Text>
      )}

      <ChatInput onSend={handleSend} onTyping={handleTyping} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dateChip: {
    alignSelf: "center",
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 100,
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    overflow: "hidden",
  },
  list: { paddingHorizontal: 8, paddingBottom: 8 },
  typing: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 4,
    opacity: 0.7,
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
});

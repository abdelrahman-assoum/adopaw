import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatInput from "@/src/features/chats/components/ChatInput";
import ImageMessage from "@/src/features/chats/components/ImageMessage";
import MessageBubble from "@/src/features/chats/components/MessageBubble";
import PawloHeader from "@/src/features/chats/components/pawlo/PawloHeader";
import SuggestionChips from "@/src/features/chats/components/pawlo/SuggestionChips";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import pawloImage from "@/assets/images/itspawlo.png";

const PAWLO_ID = "pawlo";
const ME_ID = "me";

export default function PawloChat() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("pawlo");
  const listRef = useRef(null);

  const suggestions = useMemo(() => {
    const raw = t("suggestions", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = useCallback(
    async (type, content) => {
      const text = type === "text" ? (content?.text ?? "").trim() : "";
      if (!text && type !== "image") return;

      setShowSuggestions(false);

      const userMsg = {
        _id: `me-${Date.now()}`,
        type,
        content,
        senderId: ME_ID,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTimeout(scrollToEnd, 50);

      setLoading(true);
      try {
        // Placeholder — Pawlo AI backend will be wired in later
        await new Promise((r) => setTimeout(r, 800));
        const botMsg = {
          _id: `pawlo-${Date.now()}`,
          type: "text",
          content: { text: t("fallbackReply") },
          senderId: PAWLO_ID,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setTimeout(scrollToEnd, 50);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            _id: `err-${Date.now()}`,
            type: "text",
            content: { text: t("sendError") },
            senderId: PAWLO_ID,
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [t, scrollToEnd]
  );

  const onSuggestionPress = useCallback(
    (label) => handleSend("text", { text: label }),
    [handleSend]
  );

  const renderItem = useCallback(
    ({ item }) =>
      item.type === "image" ? (
        <ImageMessage item={item} currentUserId={ME_ID} />
      ) : (
        <MessageBubble item={item} currentUserId={ME_ID} />
      ),
    []
  );

  const ListHeader = useMemo(
    () =>
      showSuggestions ? (
        <View style={styles.header}>
          <PawloHeader avatar={pawloImage} title={t("title")} description={t("description")} />
          <Text
            style={[styles.suggestionTitle, { color: theme.colors.palette.neutral[700] }]}
          >
            {t("suggestionTitle")}
          </Text>
          <SuggestionChips suggestions={suggestions} onSelect={onSuggestionPress} />
        </View>
      ) : null,
    [showSuggestions, t, theme, suggestions, onSuggestionPress]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, 12) + 72 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToEnd}
      />

      {loading && (
        <Text style={[styles.typing, { color: theme.colors.outline }]}>
          {t("typing")}
        </Text>
      )}

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <ChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 8, paddingTop: 8 },
  header: { paddingHorizontal: 12 },
  suggestionTitle: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 14,
    marginTop: 20,
    textAlign: "center",
  },
  typing: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 4,
    opacity: 0.7,
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
});

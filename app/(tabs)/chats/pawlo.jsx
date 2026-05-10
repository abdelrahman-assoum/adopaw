import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AiMessageBubble from "@/src/features/chats/components/AiMessageBubble";
import ChatInput from "@/src/features/chats/components/ChatInput";
import ImageMessage from "@/src/features/chats/components/ImageMessage";
import MessageBubble from "@/src/features/chats/components/MessageBubble";
import PetContextCard from "@/src/features/chats/components/pawlo/PetContextCard";
import PlaceSuggestionCard from "@/src/features/chats/components/pawlo/PlaceSuggestionCard";
import PawloHeader from "@/src/features/chats/components/pawlo/PawloHeader";
import SuggestionChips from "@/src/features/chats/components/pawlo/SuggestionChips";
import { usePawloConversation } from "@/src/features/chats/hooks/usePawloConversation";
import { usePawloGuard } from "@/src/features/chats/hooks/usePawloGuard";
import { useCurrentUser } from "@/src/features/chats/hooks/useCurrentUser";
import { usePet } from "@/src/features/home/hooks/usePets";
import { useCurrentLocation } from "@/src/features/map/hooks/useCurrentLocation";
import { usePlaces } from "@/src/features/map/hooks/usePlaces";
import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

import pawloImage from "@/assets/images/itspawlo.png";

const PAWLO_ID = "pawlo";

export default function PawloChat() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslationLoader("pawlo");
  const listRef = useRef(null);

  const { petId, conversationId: initialConvId } = useLocalSearchParams();
  const userId = useCurrentUser();

  // ─── Pet context (when entering from pet detail) ───────────────────────────
  const { data: pet } = usePet(petId ?? null);
  const petContext = useMemo(() => {
    if (!pet) return null;
    return {
      name: pet.name,
      species: pet.species,
      breed: pet.breed ?? null,
      age: pet.age_value ? `${pet.age_value} ${pet.age_unit ?? ""}`.trim() : null,
      health: [
        pet.vaccinated && "vaccinated",
        pet.sterilized && "sterilized",
        pet.dewormed && "dewormed",
        pet.has_passport && "has passport",
        pet.special_needs && "special needs",
      ].filter(Boolean),
      about: pet.description ?? null,
    };
  }, [pet]);

  // ─── Nearby places ────────────────────────────────────────────────────────
  const { region } = useCurrentLocation();
  const { data: nearbyPlaces = [] } = usePlaces(region);

  // ─── Conversation ─────────────────────────────────────────────────────────
  const {
    messages,
    loading,
    initializing,
    sendMessage,
    startNewConversation,
    loadConversation,
  } = usePawloConversation({
    userId,
    initialConversationId: initialConvId ?? null,
    petId: petId ?? null,
    petContext,
  });

  // ─── Warning / cooldown ────────────────────────────────────────────────────
  const { warningCount, isBlocked, timeRemaining, recordOffTopic } = usePawloGuard();

  // Show intro header until the user has sent their first message
  const hasUserMessage = messages.some((m) => m.role === "user");
  const showSuggestions = !hasUserMessage && !initializing;

  const suggestions = useMemo(() => {
    const raw = t("suggestions", { returnObjects: true });
    return Array.isArray(raw) ? raw : [];
  }, [t]);

  // ─── Scroll helpers ────────────────────────────────────────────────────────
  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  // ─── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (type, content) => {
      if (isBlocked) return;

      const text = type === "text" ? (content?.text ?? "").trim() : "";
      const imageUri = type === "image" ? content?.imageUrl : null;
      if (!text && !imageUri) return;

      setTimeout(scrollToEnd, 80);

      const result = await sendMessage({
        type,
        content: type === "text" ? { text } : content,
        imageUri,
        nearbyPlaces,
      });

      if (result?.isOffTopic) {
        await recordOffTopic();
      }

      setTimeout(scrollToEnd, 80);
    },
    [isBlocked, sendMessage, nearbyPlaces, recordOffTopic, scrollToEnd]
  );

  const onSuggestionPress = useCallback(
    (label) => handleSend("text", { text: label }),
    [handleSend]
  );

  // ─── Render item ───────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }) => {
      if (item.role === "assistant") {
        return (
          <View>
            <AiMessageBubble item={item} />
            {item.suggestedCategory && (
              <PlaceSuggestionCard
                category={item.suggestedCategory}
                places={nearbyPlaces}
              />
            )}
          </View>
        );
      }
      // User message — normalize role → senderId for existing components
      const normalized = { ...item, senderId: userId };
      return item.type === "image" ? (
        <ImageMessage item={normalized} currentUserId={userId} />
      ) : (
        <MessageBubble item={normalized} currentUserId={userId} />
      );
    },
    [userId, nearbyPlaces]
  );

  const ListHeader = useMemo(
    () =>
      showSuggestions ? (
        <View>
          {petContext?.name ? (
            <PetContextCard pet={pet} petContext={petContext} />
          ) : (
            <View style={styles.header}>
              <PawloHeader avatar={pawloImage} title={t("title")} description={t("description")} />
              <Text style={[styles.suggestionTitle, { color: theme.colors.palette?.neutral?.[700] ?? theme.colors.outline }]}>
                {t("suggestionTitle")}
              </Text>
              <SuggestionChips suggestions={suggestions} onSelect={onSuggestionPress} />
            </View>
          )}
        </View>
      ) : petContext?.name ? (
        <PetContextCard pet={pet} petContext={petContext} />
      ) : null,
    [showSuggestions, petContext, pet, t, theme, suggestions, onSuggestionPress]
  );

  // ─── Cooldown screen ───────────────────────────────────────────────────────
  if (isBlocked) {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Pawlo",
            headerRight: () => (
              <TouchableOpacity onPress={() => router.push("/(tabs)/chats/pawlo-history")} style={styles.headerBtn}>
                <Ionicons name="time-outline" size={22} color={theme.colors.onSurface} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={[styles.cooldown, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="time-outline" size={52} color={theme.colors.primary} style={{ marginBottom: 16 }} />
          <Text style={[styles.cooldownTitle, { color: theme.colors.onSurface }]}>
            Pawlo is taking a break
          </Text>
          <Text style={[styles.cooldownSub, { color: theme.colors.outline }]}>
            You sent too many off-topic messages.{"\n"}Chat resumes in
          </Text>
          <Text style={[styles.cooldownTimer, { color: theme.colors.primary }]}>
            {timeRemaining}
          </Text>
        </View>
      </>
    );
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (initializing) {
    return (
      <>
        <Stack.Screen options={{ title: "Pawlo" }} />
        <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pawlo",
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => startNewConversation()}
                style={styles.headerBtn}
              >
                <Ionicons name="add-circle-outline" size={22} color={theme.colors.onSurface} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/chats/pawlo-history")}
                style={styles.headerBtn}
              >
                <Ionicons name="time-outline" size={22} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

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

        {/* Warning banner */}
        {warningCount > 0 && (
          <View style={[styles.warningBanner, { backgroundColor: theme.colors.errorContainer }]}>
            <Ionicons name="warning-outline" size={14} color={theme.colors.error} />
            <Text style={[styles.warningText, { color: theme.colors.error }]}>
              {`Off-topic warning ${warningCount}/${3} — chatbot disables for 10 min after ${3}`}
            </Text>
          </View>
        )}

        {loading && (
          <Text style={[styles.typing, { color: theme.colors.outline }]}>
            {t("typing")}
          </Text>
        )}

        <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
          <ChatInput onSend={handleSend} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  warningText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    flex: 1,
  },
  cooldown: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  cooldownTitle: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  cooldownSub: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  cooldownTimer: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 42,
  },
  headerRight: { flexDirection: "row", gap: 4 },
  headerBtn: { padding: 6 },
});

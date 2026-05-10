import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentUser } from "@/src/features/chats/hooks/useCurrentUser";
import {
  clearConversations,
  deleteConversation,
  getConversations,
} from "@/src/features/chats/services/pawloService";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PawloHistory() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userId = useCurrentUser();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getConversations(userId);
      setConversations(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (convId) => {
    router.replace({ pathname: "/(tabs)/chats/pawlo", params: { conversationId: convId } });
  };

  const handleDelete = (convId) => {
    Alert.alert("Delete conversation", "This conversation will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteConversation(convId);
          setConversations((prev) => prev.filter((c) => c.id !== convId));
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (!conversations.length) return;
    Alert.alert("Clear all history", "All Pawlo conversations will be permanently deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear all",
        style: "destructive",
        onPress: async () => {
          await clearConversations(userId);
          setConversations([]);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
      onPress={() => handleOpen(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
          {item.title ?? "New conversation"}
        </Text>
        <Text style={[styles.rowDate, { color: theme.colors.outline }]}>
          {formatDate(item.last_message_at ?? item.created_at)}
          {item.pet_id ? " · 🐾 Pet context" : ""}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Chat History",
          headerRight: () =>
            conversations.length > 0 ? (
              <TouchableOpacity onPress={handleClearAll} style={styles.headerBtn}>
                <Text style={[styles.clearText, { color: theme.colors.error }]}>Clear all</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      {loading ? (
        <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
          style={{ backgroundColor: theme.colors.background }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={theme.colors.outline} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
                No conversation history yet
              </Text>
            </View>
          }
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  rowLeft: { width: 36, alignItems: "center" },
  rowContent: { flex: 1 },
  rowTitle: {
    fontFamily: "Alexandria_500Medium",
    fontSize: 14,
    marginBottom: 3,
  },
  rowDate: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  deleteBtn: { padding: 4 },
  headerBtn: { padding: 6 },
  clearText: { fontFamily: "Alexandria_500Medium", fontSize: 14 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
  },
});

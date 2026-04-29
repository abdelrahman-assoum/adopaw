import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeMessage(row) {
  return {
    _id: row.id,
    chatId: row.chat_id,
    senderId: row.sender_id,
    type: row.type ?? "text",
    content: row.type === "image"
      ? { imageUrl: row.image_url }
      : { text: row.text },
    createdAt: row.created_at,
    isRead: row.is_read ?? false,
  };
}

// ─── Chat List ─────────────────────────────────────────────────────────────────

export async function getUserChats(userId) {
  const { data: chats, error } = await supabase
    .from(TABLES.CHATS)
    .select("*")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsLast: true });

  if (error) throw error;
  if (!chats?.length) return [];

  const chatIds = chats.map((c) => c.id);

  const otherIds = [
    ...new Set(
      chats.map((c) => (c.user1_id === userId ? c.user2_id : c.user1_id))
    ),
  ];

  const [profilesResult, unreadResult] = await Promise.all([
    otherIds.length
      ? supabase.from(TABLES.PROFILES).select("id, name, avatar_url").in("id", otherIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from(TABLES.MESSAGES)
      .select("chat_id")
      .in("chat_id", chatIds)
      .neq("sender_id", userId)
      .eq("is_read", false),
  ]);

  const profilesMap = Object.fromEntries(
    (profilesResult.data ?? []).map((p) => [p.id, p])
  );

  const unreadMap = {};
  for (const msg of (unreadResult.data ?? [])) {
    unreadMap[msg.chat_id] = (unreadMap[msg.chat_id] ?? 0) + 1;
  }

  return chats.map((chat) => {
    const otherId = chat.user1_id === userId ? chat.user2_id : chat.user1_id;
    const other = profilesMap[otherId] ?? {};
    return {
      _id: chat.id,
      name: other.name ?? "Unknown",
      avatar: other.avatar_url ?? null,
      updatedAt: chat.last_message_at ?? chat.created_at,
      lastMessage: chat.last_message
        ? { type: "text", content: { text: chat.last_message } }
        : null,
      unreadCount: unreadMap[chat.id] ?? 0,
      otherUserId: otherId,
      petId: chat.pet_id ?? null,
    };
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(chatId, limit = 30, cursor = null) {
  let query = supabase
    .from(TABLES.MESSAGES)
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) throw error;

  const items = (data ?? []).map(normalizeMessage);
  // nextCursor points to the oldest item so older pages can be fetched
  const nextCursor = items.length === limit ? items[0]?.createdAt : null;
  return { items, nextCursor };
}

export async function sendMessage(chatId, { type, content }, senderId) {
  const { data, error } = await supabase
    .from(TABLES.MESSAGES)
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      type,
      text: type === "text" ? (content?.text ?? null) : null,
      image_url: type === "image" ? (content?.imageUrl ?? null) : null,
    })
    .select()
    .single();

  if (error) throw error;
  // The DB trigger update_chat_on_message handles last_message / last_message_at
  return normalizeMessage(data);
}

export async function markMessagesRead(chatId, currentUserId) {
  const { error } = await supabase
    .from(TABLES.MESSAGES)
    .update({ is_read: true })
    .eq("chat_id", chatId)
    .neq("sender_id", currentUserId)
    .eq("is_read", false);
  if (error) console.warn("markMessagesRead:", error.message);
}

// ─── Realtime: single channel per chat (postgres_changes + typing broadcast) ──

export function createChatChannel(chatId, { onMessage, onTyping } = {}) {
  const channel = supabase
    .channel(`chat:${chatId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: TABLES.MESSAGES,
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) =>
        onMessage?.({ type: "new", message: normalizeMessage(payload.new) })
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: TABLES.MESSAGES,
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) =>
        onMessage?.({ type: "edit", message: normalizeMessage(payload.new) })
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: TABLES.MESSAGES,
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => onMessage?.({ type: "delete", messageId: payload.old?.id })
    )
    .on("broadcast", { event: "typing" }, ({ payload }) => onTyping?.(payload))
    .subscribe();

  return {
    sendTyping: (userId, isTyping) => {
      if (channel.state !== "joined") return;
      channel.send({ type: "broadcast", event: "typing", payload: { userId, isTyping } });
    },
    unsubscribe: () => supabase.removeChannel(channel),
  };
}

// ─── Unread Count ─────────────────────────────────────────────────────────────

export async function getUnreadCount(userId) {
  const { data: chats } = await supabase
    .from(TABLES.CHATS)
    .select("id")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

  if (!chats?.length) return 0;

  const chatIds = chats.map((c) => c.id);
  const { data: unreadMsgs } = await supabase
    .from(TABLES.MESSAGES)
    .select("chat_id")
    .in("chat_id", chatIds)
    .neq("sender_id", userId)
    .eq("is_read", false);

  // Count distinct chats that have at least one unread message
  return new Set((unreadMsgs ?? []).map((m) => m.chat_id)).size;
}

// ─── Get or Create Chat ───────────────────────────────────────────────────────

export async function getOrCreateChat(currentUserId, otherUserId, petId = null) {
  // One conversation per user pair — petId is context only, not a differentiator
  const { data: existing, error: fetchError } = await supabase
    .from(TABLES.CHATS)
    .select("id, user1_id, user2_id")
    .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);

  if (fetchError) throw fetchError;

  const found = (existing ?? []).find(
    (c) =>
      (c.user1_id === currentUserId && c.user2_id === otherUserId) ||
      (c.user1_id === otherUserId && c.user2_id === currentUserId)
  );

  if (found) return found.id;

  // Normalize ordering to match the unique index
  const [user1_id, user2_id] =
    currentUserId < otherUserId
      ? [currentUserId, otherUserId]
      : [otherUserId, currentUserId];

  const { data: newChat, error: createError } = await supabase
    .from(TABLES.CHATS)
    .insert({ user1_id, user2_id, pet_id: petId ?? null })
    .select("id")
    .single();

  if (createError) throw createError;
  return newChat.id;
}

// ─── Chat List Realtime ────────────────────────────────────────────────────────
// Two channels because Supabase filter doesn't support OR across columns

export function subscribeToUserChats(userId, callback) {
  const ch1 = supabase
    .channel(`chats:user1:${userId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: TABLES.CHATS,
      filter: `user1_id=eq.${userId}`,
    }, () => callback())
    .subscribe();

  const ch2 = supabase
    .channel(`chats:user2:${userId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: TABLES.CHATS,
      filter: `user2_id=eq.${userId}`,
    }, () => callback())
    .subscribe();

  return () => {
    supabase.removeChannel(ch1);
    supabase.removeChannel(ch2);
  };
}

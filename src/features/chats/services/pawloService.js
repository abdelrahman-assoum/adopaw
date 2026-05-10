import { TABLES } from "@/src/shared/constants/tables";
import { supabase } from "@/src/shared/services/supabase/client";
import { uploadImage } from "@/src/shared/services/supabase/upload";

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeMessage(row) {
  return {
    _id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    type: row.type ?? "text",
    content:
      row.type === "image"
        ? { imageUrl: row.image_url, text: row.content ?? null }
        : { text: row.content ?? "" },
    createdAt: row.created_at,
  };
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function createConversation(userId, petId = null, title = null) {
  const { data, error } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .insert({ user_id: userId, pet_id: petId ?? null, title })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getConversations(userId) {
  const { data, error } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .select("*")
    .eq("user_id", userId)
    .order("last_message_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateConversationMeta(conversationId, { title } = {}) {
  const patch = { last_message_at: new Date().toISOString() };
  if (title) patch.title = title;
  const { error } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .update(patch)
    .eq("id", conversationId);
  if (error) console.warn("updateConversationMeta:", error.message);
}

// Signed URLs look like: .../storage/v1/object/sign/chat-images/{path}?token=...
function extractStoragePath(signedUrl) {
  try {
    const url = new URL(signedUrl);
    const prefix = "/storage/v1/object/sign/chat-images/";
    return url.pathname.startsWith(prefix)
      ? url.pathname.slice(prefix.length)
      : null;
  } catch {
    return null;
  }
}

async function removeConversationImages(conversationIds) {
  if (!conversationIds.length) return;
  const { data } = await supabase
    .from(TABLES.AI_MESSAGES)
    .select("image_url")
    .in("conversation_id", conversationIds)
    .eq("type", "image")
    .not("image_url", "is", null);
  const paths = (data ?? [])
    .map((m) => extractStoragePath(m.image_url))
    .filter(Boolean);
  if (paths.length) {
    const { error } = await supabase.storage.from("chat-images").remove(paths);
    if (error) console.warn("removeConversationImages:", error.message);
  }
}

export async function deleteConversation(conversationId) {
  await removeConversationImages([conversationId]);
  const { error } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .delete()
    .eq("id", conversationId);
  if (error) throw error;
}

export async function clearConversations(userId) {
  const { data: convs } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .select("id")
    .eq("user_id", userId);
  const ids = (convs ?? []).map((c) => c.id);
  await removeConversationImages(ids);
  const { error } = await supabase
    .from(TABLES.AI_CONVERSATIONS)
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from(TABLES.AI_MESSAGES)
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalizeMessage);
}

export async function saveMessage(conversationId, { role, type = "text", content = null, imageUrl = null }) {
  const { data, error } = await supabase
    .from(TABLES.AI_MESSAGES)
    .insert({
      conversation_id: conversationId,
      role,
      type,
      content: content ?? null,
      image_url: type === "image" ? imageUrl : null,
    })
    .select()
    .single();
  if (error) throw error;
  return normalizeMessage(data);
}

// ─── Image upload ─────────────────────────────────────────────────────────────

export async function uploadPawloImage(localUri) {
  const { signedUrl } = await uploadImage(localUri, "chat-images", "pawlo");
  return signedUrl;
}

// ─── Edge function ────────────────────────────────────────────────────────────

export async function invokeEdgeFunction({
  message,
  history = [],
  imageUrls = [],
  nearbyPlaces = [],
  petContext = null,
}) {
  const { data, error } = await supabase.functions.invoke("pawlo-reply", {
    body: { message, history, imageUrls, nearbyPlaces, petContext },
  });
  if (error) throw error;
  if (!data) throw new Error("empty_response");
  return data; // { reply, off_topic?, suggestedCategory? }
}

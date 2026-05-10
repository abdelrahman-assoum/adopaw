import { useCallback, useEffect, useRef, useState } from "react";

import {
  createConversation,
  getConversations,
  getMessages,
  invokeEdgeFunction,
  saveMessage,
  updateConversationMeta,
  uploadPawloImage,
} from "../services/pawloService";

const MAX_HISTORY = 20;

function toGroqHistory(messages) {
  return messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role,
    content:
      m.type === "image"
        ? "[User shared an image]"
        : (m.content?.text ?? ""),
  }));
}

function formatPlaces(places) {
  return places.slice(0, 9).map((p) => ({
    name: p.name,
    category: p.category,
    description: p.description ?? "",
    isOpen: p.isOpen ?? null,
  }));
}

export function usePawloConversation({ userId, initialConversationId = null, petId = null, petContext = null }) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const isFirstMessage = useRef(true);

  // ─── Load existing conversation ───────────────────────────────────────────────

  const loadConversation = useCallback(async (id) => {
    setInitializing(true);
    try {
      const msgs = await getMessages(id);
      setConversationId(id);
      setMessages(msgs);
      isFirstMessage.current = msgs.length === 0;
    } finally {
      setInitializing(false);
    }
  }, []);

  // ─── Start a fresh conversation ───────────────────────────────────────────────

  const startNewConversation = useCallback(
    async (overridePetId = null, overridePetContext = null) => {
      if (!userId) return;
      setInitializing(true);
      try {
        const pid = overridePetId ?? petId ?? null;
        const ctx = overridePetContext ?? petContext ?? null;
        const title = ctx?.name ? `About ${ctx.name}` : null;
        const conv = await createConversation(userId, pid, title);
        setConversationId(conv.id);
        isFirstMessage.current = true;

        // Auto-save a greeting when starting with pet context
        if (ctx?.name) {
          const greetingText =
            `Hi! I can see you want to ask about **${ctx.name}** 🐾\n\n` +
            `I know all about this ${ctx.species ?? "pet"}` +
            (ctx.breed ? ` (${ctx.breed})` : "") +
            `. Whether it's about care, health, behavior, or adoption — I'm here to help!\n\n` +
            `What would you like to know?`;
          const greeting = await saveMessage(conv.id, {
            role: "assistant",
            type: "text",
            content: greetingText,
          });
          setMessages([greeting]);
        } else {
          setMessages([]);
        }
      } finally {
        setInitializing(false);
      }
    },
    [userId, petId, petContext]
  );

  // ─── Init on mount ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;
    (async () => {
      if (initialConversationId) {
        await loadConversation(initialConversationId);
      } else if (petId) {
        await startNewConversation(petId);
      } else {
        try {
          const convs = await getConversations(userId);
          if (convs.length > 0) {
            await loadConversation(convs[0].id);
          } else {
            await startNewConversation();
          }
        } catch {
          await startNewConversation();
        }
      }
    })();
  }, [userId]); // intentionally only on userId change

  // ─── Send message ─────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async ({ type, content, imageUri = null, nearbyPlaces = [] }) => {
      if (!conversationId || loading) return null;
      setLoading(true);

      const tempId = `temp-${Date.now()}`;
      const tempMsg = {
        _id: tempId,
        role: "user",
        type,
        content: type === "image" ? { imageUrl: imageUri, text: content?.text ?? null } : content,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((prev) => [...prev, tempMsg]);

      // Capture messages before this send for history
      const historyMessages = messages.filter((m) => !m.pending);

      try {
        // 1. Upload image if needed
        let imageUrl = null;
        if (type === "image" && imageUri) {
          imageUrl = await uploadPawloImage(imageUri);
        }

        // 2. Save user message to DB
        const textContent = type === "text" ? (content?.text ?? null) : null;
        const captionText = type === "image" ? (content?.text ?? null) : null;
        const savedUser = await saveMessage(conversationId, {
          role: "user",
          type,
          content: textContent ?? captionText,
          imageUrl,
        });
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...savedUser, pending: false } : m))
        );

        // 3. Update conversation metadata (title on first message)
        if (isFirstMessage.current) {
          const title =
            petContext?.name
              ? `About ${petContext.name}`
              : (textContent ?? captionText)?.slice(0, 60) ?? "Sent an image";
          await updateConversationMeta(conversationId, { title });
          isFirstMessage.current = false;
        } else {
          await updateConversationMeta(conversationId);
        }

        // 4. Call edge function
        const result = await invokeEdgeFunction({
          message: type === "text" ? (textContent ?? "") : (captionText ?? ""),
          history: toGroqHistory(historyMessages),
          imageUrls: imageUrl ? [imageUrl] : [],
          nearbyPlaces: formatPlaces(nearbyPlaces),
          petContext,
        });

        // 5. Save and display assistant reply
        const savedBot = await saveMessage(conversationId, {
          role: "assistant",
          type: "text",
          content: result.reply ?? "",
        });

        setMessages((prev) => [
          ...prev,
          { ...savedBot, suggestedCategory: result.suggestedCategory ?? null },
        ]);

        return {
          isOffTopic: result.off_topic === true,
          suggestedCategory: result.suggestedCategory ?? null,
        };
      } catch {
        setMessages((prev) => {
          const clean = prev.filter((m) => !m.pending);
          return [
            ...clean,
            {
              _id: `err-${Date.now()}`,
              role: "assistant",
              type: "text",
              content: { text: "Something went wrong. Please try again." },
              createdAt: new Date().toISOString(),
              isError: true,
            },
          ];
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversationId, loading, messages, petContext]
  );

  return {
    conversationId,
    messages,
    loading,
    initializing,
    sendMessage,
    startNewConversation,
    loadConversation,
  };
}

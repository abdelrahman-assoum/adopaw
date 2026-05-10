import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  I18nManager,
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function ChatInput({ onSend, onTyping }) {
  const [message, setMessage] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslationLoader("chatId");

  const { palette } = theme.colors;
  const isDark = !!theme.dark;

  const inputBg = isDark ? theme.colors.surface : (palette?.neutral?.[100] ?? theme.colors.surfaceVariant);
  const iconGray = palette?.neutral?.[600] ?? theme.colors.outline;
  const sendActiveBg = theme.colors.primary;
  const sendIdleBg = palette?.neutral?.[200] ?? theme.colors.surfaceVariant;

  const typingTimer = useRef(null);
  const hasContent = message.trim().length > 0 || !!pendingImage;

  useEffect(() => {
    if (!onTyping) return;
    if (message.trim().length > 0) {
      onTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => onTyping(false), 1200);
    } else {
      onTyping(false);
    }
    return () => clearTimeout(typingTimer.current);
  }, [message, onTyping]);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed && !pendingImage) return;

    // Capture and clear immediately so input doesn't freeze during upload/AI call
    const imageToSend = pendingImage;
    const textToSend = trimmed;
    setMessage("");
    setPendingImage(null);

    try {
      if (imageToSend) {
        await onSend?.("image", { imageUrl: imageToSend, text: textToSend || null });
      } else {
        await onSend?.("text", { text: textToSend });
      }
    } catch (err) {
      console.warn("Send failed:", err?.message);
    }
  }, [message, pendingImage, onSend]);

  const openLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      const imageEnum =
        ImagePicker?.MediaType?.Images ?? ImagePicker?.MediaTypeOptions?.Images;
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        quality: 0.8,
        ...(imageEnum ? { mediaTypes: imageEnum } : {}),
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) setPendingImage(uri);
    } catch (err) {
      console.warn("Pick image failed:", err?.message);
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") return;
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) setPendingImage(uri);
    } catch (err) {
      console.warn("Camera failed:", err?.message);
    }
  };

  const handlePickImage = () => {
    Alert.alert("Send Photo", null, [
      { text: "Take Photo", onPress: openCamera },
      { text: "Choose from Library", onPress: openLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.surface, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={[styles.pill, { backgroundColor: inputBg }]}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={t("placeholder")}
          placeholderTextColor={theme.colors.outline}
          style={[styles.input, { color: theme.colors.onSurface }]}
          multiline
        />

        {pendingImage && (
          <View style={styles.thumbWrap}>
            <Image source={{ uri: pendingImage }} style={styles.thumb} />
            <TouchableOpacity style={styles.thumbRemove} onPress={() => setPendingImage(null)}>
              <Ionicons name="close" size={14} color={iconGray} />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.iconBtn} onPress={handlePickImage}>
          <Ionicons name="image-outline" size={22} color={iconGray} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleSend}
        disabled={!hasContent}
        style={[styles.sendBtn, { backgroundColor: hasContent ? sendActiveBg : sendIdleBg }]}
      >
        <Ionicons
          name="send"
          size={18}
          color={hasContent ? theme.colors.onPrimary : iconGray}
          style={I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    paddingBottom: 2,
    fontFamily: "Alexandria_400Regular",
  },
  iconBtn: { paddingLeft: 8, paddingVertical: 6 },
  sendBtn: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbWrap: {
    marginLeft: 8,
    width: 34,
    height: 34,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  thumb: { width: "100%", height: "100%" },
  thumbRemove: { position: "absolute", top: -4, right: -4, padding: 6 },
});

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function AdoptionBottomSheet({ visible, onClose, onSubmit, loading }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("petdetails");
  const [note, setNote] = useState("");
  const [mounted, setMounted] = useState(false);

  const translateY = useRef(new Animated.Value(600)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(600);
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          bounciness: 4,
          speed: 14,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 600,
          duration: 220,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setMounted(false);
        setNote("");
      });
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit(note.trim() || null);
  };

  const isDark = theme.dark;
  const neutral = theme.colors.palette.neutral;

  const sheetBg      = isDark ? neutral[800] : "#FFFFFF";
  const handleColor  = isDark ? neutral[600]  : "#D9D9D9";
  const titleColor   = theme.colors.onSurface;
  const subtitleColor = isDark ? neutral[400] : "#777777";
  const labelColor   = theme.colors.onSurface;
  const inputBorder  = isDark ? "rgba(255,255,255,0.12)" : "rgba(169,169,169,0.5)";
  const placeholderColor = isDark ? neutral[500] : "#A9A9A9";

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Dim overlay — pointerEvents="none" so Pressable below handles dismissal */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#000", opacity: Animated.multiply(overlayOpacity, 0.7) },
        ]}
      />

      <View style={{ flex: 1 }} pointerEvents="box-none">
        {/* Tapping outside closes the sheet */}
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Animated.View
            style={[styles.sheet, { backgroundColor: sheetBg, transform: [{ translateY }] }]}
          >
            {/* keyboardShouldPersistTaps prevents the keyboard from eating the first tap on buttons */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              scrollEnabled={false}
              contentContainerStyle={styles.content}
            >
              <View style={[styles.handle, { backgroundColor: handleColor }]} />

              <View style={styles.topSection}>
                <View style={styles.iconCircle}>
                  <Ionicons name="paw" size={26} color="#FF6B6B" />
                </View>
                <Text style={[styles.title, { color: titleColor }]}>
                  {t("adoptSheetTitle")}
                </Text>
                <Text style={[styles.subtitle, { color: subtitleColor }]}>
                  {t("adoptSheetSubtitle")}
                </Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={[styles.noteLabel, { color: labelColor }]}>
                  {t("personalNotes")}
                </Text>
                <View style={[styles.inputWrapper, { borderColor: inputBorder }]}>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t("notePlaceholder")}
                    placeholderTextColor={placeholderColor}
                    multiline
                    style={[styles.input, { color: theme.colors.onSurface }]}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.8}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>{t("cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                  disabled={loading}
                  style={[styles.sendButton, loading && { opacity: 0.7 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sendText}>{t("sendRequest")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },
  handle: {
    width: 80,
    height: 6,
    borderRadius: 10,
    alignSelf: "center",
  },
  topSection: {
    alignItems: "center",
    gap: 11,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    backgroundColor: "#FFE1E1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 24,
    lineHeight: 32,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  inputSection: {
    gap: 8,
  },
  noteLabel: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 100,
  },
  input: {
    fontFamily: "Alexandria_300Light",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#DBEBF9",
    borderWidth: 1,
    borderColor: "#4D9DE0",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#4D9DE0",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: {
    fontFamily: "Alexandria_600SemiBold",
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});

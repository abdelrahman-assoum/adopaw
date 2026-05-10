import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN = Dimensions.get("window");
const IMG_WIDTH = Math.min(SCREEN.width * 0.62, 260);

export default function ImageMessage({ item, currentUserId }) {
  const theme = useTheme();
  const { palette } = theme.colors;
  const insets = useSafeAreaInsets();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const isMine = item?.senderId === currentUserId;
  const uri = item?.content?.imageUrl;
  const caption = item?.content?.text ?? null;
  const isPending = !!item?.pending;

  const timeLabel = useMemo(() => {
    if (!item?.createdAt) return "";
    try {
      return new Date(item.createdAt).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [item?.createdAt]);

  const handleSave = async () => {
    if (!uri || saving) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") return;
      let localUri = uri;
      if (uri.startsWith("http")) {
        const dest = FileSystem.cacheDirectory + `pawlo_${Date.now()}.jpg`;
        const { uri: dl } = await FileSystem.downloadAsync(uri, dest);
        localUri = dl;
      }
      await MediaLibrary.saveToLibraryAsync(localUri);
    } catch (e) {
      console.warn("Save failed:", e);
    } finally {
      setSaving(false);
    }
  };

  const bubbleBg = isMine ? palette.blue[400] : theme.colors.surface;
  const fgMine = theme.colors.onPrimary;
  const fgOther = theme.colors.onSurface;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => !isPending && uri && setViewerVisible(true)}
        style={[
          styles.container,
          {
            backgroundColor: bubbleBg,
            alignSelf: isMine ? "flex-end" : "flex-start",
            opacity: isPending ? 0.65 : 1,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          {uri ? (
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : null}
          {isPending && (
            <View style={styles.pendingOverlay}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
        {!!caption && (
          <Text style={[styles.caption, { color: isMine ? fgMine : fgOther }]}>
            {caption}
          </Text>
        )}
        {!!timeLabel && (
          <Text style={[styles.time, { color: isMine ? fgMine : fgOther }]}>
            {timeLabel}
          </Text>
        )}
      </TouchableOpacity>

      <Modal visible={viewerVisible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.viewer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            maximumZoomScale={4}
            minimumZoomScale={1}
            centerContent
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri }}
              style={{ width: SCREEN.width, height: SCREEN.height * 0.82 }}
              resizeMode="contain"
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeBtn, { top: insets.top + 12 }]}
            onPress={() => setViewerVisible(false)}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, { bottom: insets.bottom + 24 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="download-outline" size={20} color="#fff" />}
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save to photos"}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    maxWidth: "75%",
  },
  imageWrap: { position: "relative" },
  image: {
    width: IMG_WIDTH,
    height: IMG_WIDTH * 0.75,
    borderRadius: 8,
  },
  pendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: IMG_WIDTH,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
    fontFamily: "Alexandria_400Regular",
    opacity: 0.8,
  },
  viewer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 10,
  },
  saveBtn: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: "Alexandria_500Medium",
    fontSize: 14,
  },
});

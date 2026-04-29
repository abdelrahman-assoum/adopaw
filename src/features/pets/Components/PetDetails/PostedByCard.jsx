import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";

export default function PostedByCard({ name, avatarUrl, postedAt, onMessage }) {
  const theme = useTheme();
  const { t } = useTranslationLoader("petdetails");

  const neutral600 = theme.colors.palette.neutral[600];
  const blue600 = theme.colors.palette.blue[600];
  const blue200 = theme.colors.palette.blue[200];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: blue200 }]} />
      )}

      <View style={styles.textContainer}>
        <Text variant="labelSmall" style={{ color: neutral600 }}>{t("postedBy")}</Text>
        <Text variant="titleMedium">{name}</Text>
        <Text variant="labelSmall" style={{ color: neutral600, marginTop: 2 }}>{postedAt}</Text>
      </View>

      {onMessage && (
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: blue200 }]}
          onPress={onMessage}
          activeOpacity={0.75}
        >
          <Ionicons name="send" size={20} color={blue600} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginTop: 16,
    elevation: 2,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  avatarPlaceholder: {},
  textContainer: { flex: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});

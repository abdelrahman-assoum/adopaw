import { useRouter } from "expo-router";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

import { useTranslationLoader } from "@/src/localization/hooks/useTranslationLoader";
import aiPawlo from "@/assets/images/ai-pawlo.png";

export default function AiAssistantCard() {
  const router = useRouter();
  const theme = useTheme();
  const { palette } = theme.colors;
  const { t } = useTranslationLoader("chatlist");

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push("/(tabs)/chats/pawlo")}
      activeOpacity={0.85}
    >
      <View style={[styles.avatarWrap, { borderColor: palette.blue[400] }]}>
        <Image source={aiPawlo} style={styles.avatar} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, { color: theme.colors.onSurface }]}>
          {t("pawloName")}{" "}
          <Text style={[styles.role, { color: palette.blue[500] }]}>
            • {t("pawloRole")}
          </Text>
        </Text>
        <Text style={[styles.subtitle, { color: palette.neutral[600] }]}>
          {t("pawloSubtitle")}
        </Text>
      </View>
      <Text style={[styles.arrow, { color: palette.neutral[400] }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 10,
    marginHorizontal: 12,
    elevation: 2,
  },
  avatarWrap: {
    borderWidth: 2,
    borderRadius: 32,
    padding: 2,
    marginRight: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  text: { flex: 1 },
  name: { fontFamily: "Alexandria_700Bold", fontSize: 15 },
  role: { fontFamily: "Alexandria_400Regular", fontSize: 13 },
  subtitle: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  arrow: { fontSize: 22, marginLeft: 10 },
});

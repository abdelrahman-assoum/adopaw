import { Dimensions, StyleSheet, View } from "react-native";
import { Surface, Text, useTheme } from "react-native-paper";

import FormattedText from "./FormattedText";

const BUBBLE_MAX_WIDTH = Dimensions.get("window").width * 0.82;

export default function AiMessageBubble({ item }) {
  const theme = useTheme();
  const isDark = theme.dark;

  const fg = theme.colors.onSurface;
  const bg = isDark ? theme.colors.surfaceVariant : theme.colors.surface;
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const textStyle = {
    fontFamily: "Alexandria_400Regular",
    fontSize: 14,
    lineHeight: 22,
    color: fg,
  };

  const boldStyle = {
    fontFamily: "Alexandria_700Bold",
    fontSize: 14,
    lineHeight: 22,
    color: fg,
  };

  const timeLabel = item?.createdAt
    ? (() => {
        try {
          return new Date(item.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return "";
        }
      })()
    : "";

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text style={styles.avatarEmoji}>🐾</Text>
      </View>

      <Surface
        elevation={0}
        style={[styles.bubble, { backgroundColor: bg, borderColor: border, maxWidth: BUBBLE_MAX_WIDTH }]}
      >
        <FormattedText
          text={item.content?.text ?? ""}
          textStyle={textStyle}
          boldStyle={boldStyle}
        />
        {timeLabel ? (
          <Text style={[styles.time, { color: theme.colors.outline }]}>{timeLabel}</Text>
        ) : null}
      </Surface>
    </View>
  );
}

const R = 16;
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 15 },
  bubble: {
    padding: 12,
    borderWidth: 1,
    borderTopLeftRadius: 4,
    borderTopRightRadius: R,
    borderBottomLeftRadius: R,
    borderBottomRightRadius: R,
    gap: 6,
  },
  time: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 11,
    alignSelf: "flex-end",
    opacity: 0.7,
    marginTop: 2,
  },
});

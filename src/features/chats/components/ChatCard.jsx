import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Badge, Text, useTheme } from "react-native-paper";

export default function ChatCard({
  name,
  message,
  timestamp,
  avatar,
  unreadCount = 0,
  onPress,
  onLongPress,
}) {
  const theme = useTheme();
  const { palette } = theme.colors;

  const avatarNode = useMemo(() => {
    if (avatar && typeof avatar === "number")
      return <Avatar.Image size={52} source={avatar} />;
    if (avatar && typeof avatar === "string")
      return <Avatar.Image size={52} source={{ uri: avatar }} />;
    const initials =
      typeof name === "string" && name.length
        ? name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
        : "?";
    return (
      <Avatar.Text
        size={52}
        label={initials}
        style={{ backgroundColor: palette?.blue?.[100] ?? theme.colors.surfaceVariant }}
        color={palette?.neutral?.[800] ?? theme.colors.onSurface}
      />
    );
  }, [avatar, name, palette, theme.colors]);

  const timeLabel = useMemo(() => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }, [timestamp]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={styles.avatarWrap}>{avatarNode}</View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]} numberOfLines={1}>
            {name}
          </Text>
          {!!timeLabel && (
            <Text style={[styles.timestamp, { color: palette?.neutral?.[500] }]}>
              {timeLabel}
            </Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text
            style={[styles.message, { color: palette?.neutral?.[600] }]}
            numberOfLines={1}
          >
            {message}
          </Text>
          {unreadCount > 0 && (
            <Badge
              size={20}
              style={{
                marginLeft: 8,
                alignSelf: "center",
                backgroundColor: theme.colors.primary,
                color: theme.colors.onPrimary,
              }}
            >
              {unreadCount}
            </Badge>
          )}
        </View>
      </View>
    </Pressable>
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
  },
  avatarWrap: { marginRight: 12 },
  content: { flex: 1, justifyContent: "center", minHeight: 56 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontFamily: "Alexandria_700Bold",
    fontSize: 15,
    flex: 1,
    marginRight: 6,
  },
  timestamp: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  message: {
    fontFamily: "Alexandria_400Regular",
    fontSize: 13,
    flex: 1,
    marginRight: 10,
    opacity: 0.9,
  },
});

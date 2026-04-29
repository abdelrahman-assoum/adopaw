import { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function ImageMessage({ item, currentUserId }) {
  const theme = useTheme();
  const { palette } = theme.colors;

  const isMine = item?.senderId === currentUserId;
  const uri = item?.content?.imageUrl;
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

  const bubbleBg = isMine ? palette.blue[400] : theme.colors.surface;
  const fgMine = theme.colors.onPrimary;
  const fgOther = theme.colors.onSurface;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bubbleBg,
          alignSelf: isMine ? "flex-end" : "flex-start",
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      ) : null}
      {!!timeLabel && (
        <Text style={[styles.time, { color: isMine ? fgMine : fgOther }]}>
          {timeLabel}
        </Text>
      )}
    </View>
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
  image: {
    width: 180,
    height: 180,
    borderRadius: 8,
  },
  time: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: "flex-end",
    fontFamily: "Alexandria_400Regular",
  },
});
